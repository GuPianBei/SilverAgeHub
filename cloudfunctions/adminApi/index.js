var cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

var db = cloud.database();
var API_VERSION = '2026-06-18-stable-v1';
var allowResources = ['guide', 'course', 'order'];
var allowActions = ['list', 'create', 'update', 'delete'];
var allowStatus = ['未确认', '已确认', '完成'];

function success(data, message) {
  return {
    code: 0,
    message: message || 'ok',
    data: data
  };
}

function fail(code, message) {
  return {
    code: code,
    message: message,
    data: null
  };
}

function handleError(error) {
  console.error('[adminApi]', error);
  return fail(500, error && error.message ? error.message : '管理服务暂时不可用');
}

function checkAdmin(openid) {
  if (!openid) return Promise.resolve(false);

  return db.collection('admin_user')
    .where({
      openid: openid,
      enabled: true
    })
    .limit(1)
    .get()
    .then(function (result) {
      return (result.data || []).length > 0;
    })
    .catch(function (error) {
      if (error && error.errCode === -502005) return false;
      throw error;
    });
}

function pickGuide(data) {
  data = data || {};
  return {
    title: String(data.title || '').trim(),
    category: String(data.category || '').trim(),
    content: data.content || '',
    images: Array.isArray(data.images) ? data.images : [],
    video: String(data.video || '').trim()
  };
}

function pickCourse(data) {
  data = data || {};
  return {
    title: String(data.title || '').trim(),
    description: String(data.description || '').trim(),
    time: data.time || '',
    location: String(data.location || '').trim(),
    limitCount: Number(data.limitCount) || 0
  };
}

function pickUpdate(resource, data) {
  if (resource === 'guide') return pickGuide(data);
  if (resource === 'course') return pickCourse(data);
  if (resource === 'order' && allowStatus.indexOf(data.status) !== -1) {
    return { status: data.status };
  }
  return null;
}

function validate(resource, data) {
  if (resource === 'guide' && (!data.title || !data.category || !data.content)) {
    return '请填写教程标题、分类和内容';
  }
  if (
    resource === 'course' &&
    (!data.title || !data.description || !data.time || !data.location || data.limitCount <= 0)
  ) {
    return '请填写课程标题、介绍、时间、地点和有效人数上限';
  }
  return '';
}

function list(resource) {
  var orderField = resource === 'course' ? 'time' : 'createTime';
  var direction = resource === 'course' ? 'asc' : 'desc';

  return db.collection(resource)
    .orderBy(orderField, direction)
    .get()
    .then(function (result) {
      return success(result.data || []);
    });
}

function create(resource, data) {
  if (resource === 'order') {
    return Promise.resolve(fail(400, '预约只能由用户端创建'));
  }

  var value = pickUpdate(resource, data);
  var message = validate(resource, value);
  if (message) return Promise.resolve(fail(400, message));

  value.createTime = db.serverDate();
  return db.collection(resource).add({ data: value })
    .then(function (result) {
      return success({ id: result._id }, '新增成功');
    });
}

function update(resource, id, data) {
  if (!id) return Promise.resolve(fail(400, '缺少记录 ID'));

  var value = pickUpdate(resource, data || {});
  if (!value) return Promise.resolve(fail(400, '更新内容不合法'));

  var message = resource === 'order' ? '' : validate(resource, value);
  if (message) return Promise.resolve(fail(400, message));

  return db.collection(resource).doc(id).update({ data: value })
    .then(function () {
      return success({ id: id }, '更新成功');
    });
}

function remove(resource, id) {
  if (!id) return Promise.resolve(fail(400, '缺少记录 ID'));
  if (resource === 'order') {
    return Promise.resolve(fail(400, 'MVP 阶段不允许删除预约'));
  }

  return db.collection(resource).doc(id).remove()
    .then(function () {
      return success({ id: id }, '删除成功');
    });
}

exports.main = function (event) {
  event = event || {};
  var context = cloud.getWXContext();
  var openid = context.OPENID || '';

  return checkAdmin(openid)
    .then(function (isAdmin) {
      if (event.action === 'whoami') {
        return success({
          service: 'adminApi',
          version: API_VERSION,
          openid: openid,
          isAdmin: isAdmin
        });
      }

      if (!isAdmin) return fail(403, '当前账号没有管理员权限');
      if (allowResources.indexOf(event.resource) === -1) {
        return fail(400, '未知管理资源');
      }
      if (allowActions.indexOf(event.action) === -1) {
        return fail(400, '未知管理操作');
      }

      if (event.action === 'list') return list(event.resource);
      if (event.action === 'create') return create(event.resource, event.data);
      if (event.action === 'update') {
        return update(event.resource, event.id, event.data);
      }
      if (event.action === 'delete') return remove(event.resource, event.id);
      return fail(400, '未知管理操作');
    })
    .catch(handleError);
};
