var cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

var db = cloud.database();
var API_VERSION = '2026-06-18-stable-v1';
var allowResources = ['guide', 'course', 'order'];
var allowActions = {
  guide: ['list', 'detail'],
  course: ['list', 'detail'],
  order: ['create', 'list']
};

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
  console.error('[userApi]', error);
  return fail(500, error && error.message ? error.message : '服务暂时不可用');
}

function listGuides() {
  return db.collection('guide')
    .orderBy('createTime', 'desc')
    .get()
    .then(function (result) {
      return success(result.data || []);
    });
}

function getGuide(id) {
  if (!id) return Promise.resolve(fail(400, '缺少教程 ID'));
  return db.collection('guide').doc(id).get()
    .then(function (result) {
      return success(result.data || null);
    });
}

function listCourses() {
  return db.collection('course')
    .orderBy('time', 'asc')
    .get()
    .then(function (result) {
      return success(result.data || []);
    });
}

function getCourse(id) {
  if (!id) return Promise.resolve(fail(400, '缺少课程 ID'));
  return db.collection('course').doc(id).get()
    .then(function (result) {
      return success(result.data || null);
    });
}

function createOrder(data, openid) {
  data = data || {};
  var userName = String(data.userName || '').trim();
  var phone = String(data.phone || '').trim();
  var courseId = String(data.courseId || '').trim();

  if (!userName || !phone || !courseId) {
    return Promise.resolve(fail(400, '请完整填写姓名、电话和课程信息'));
  }

  return db.collection('order').add({
    data: {
      userName: userName,
      phone: phone,
      courseId: courseId,
      status: '未确认',
      createTime: db.serverDate(),
      _openid: openid
    }
  }).then(function (result) {
    return success({ id: result._id }, '预约成功');
  });
}

function listOrders(openid) {
  return db.collection('order')
    .where({ _openid: openid })
    .orderBy('createTime', 'desc')
    .get()
    .then(function (result) {
      return success(result.data || []);
    });
}

exports.main = function (event) {
  event = event || {};

  if (event.action === 'health') {
    return success({
      service: 'userApi',
      version: API_VERSION
    });
  }

  var resource = event.resource;
  var action = event.action;
  var context = cloud.getWXContext();

  if (allowResources.indexOf(resource) === -1) {
    return fail(400, '未知业务资源');
  }

  if (!action || allowActions[resource].indexOf(action) === -1) {
    return fail(400, '当前用户端不允许此操作');
  }

  var request;
  if (resource === 'guide' && action === 'list') request = listGuides();
  if (resource === 'guide' && action === 'detail') request = getGuide(event.id);
  if (resource === 'course' && action === 'list') request = listCourses();
  if (resource === 'course' && action === 'detail') request = getCourse(event.id);
  if (resource === 'order' && action === 'create') {
    request = createOrder(event.data, context.OPENID);
  }
  if (resource === 'order' && action === 'list') request = listOrders(context.OPENID);

  return Promise.resolve(request).catch(handleError);
};
