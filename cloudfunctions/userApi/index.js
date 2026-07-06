var cloud = require('wx-server-sdk');
var booking = require('./booking');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

var db = cloud.database();
var API_VERSION = '2026-07-06-booking-v0.2.2';
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
  return booking.createOrder({
    db: db,
    data: data,
    openid: openid,
    success: success,
    fail: fail
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

exports.main = async function (event) {
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
