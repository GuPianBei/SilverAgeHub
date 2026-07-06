var crypto = require('crypto');

var CANCELLED_STATUSES = ['已取消', 'cancelled'];
var MAX_MIGRATION_ORDERS = 1000;

function normalizeText(value) {
  return String(value || '').trim();
}

function buildIdempotencyKey(openid, courseId) {
  return crypto
    .createHash('sha256')
    .update(openid + ':' + courseId)
    .digest('hex');
}

function isActiveOrder(order) {
  return CANCELLED_STATUSES.indexOf(order && order.status) === -1;
}

async function readInitialReservedCount(transaction, courseId) {
  var result = await transaction.collection('order')
    .where({ courseId: courseId })
    .field({ _id: true, status: true })
    .limit(MAX_MIGRATION_ORDERS)
    .get();

  var orders = result.data || [];
  if (orders.length >= MAX_MIGRATION_ORDERS) {
    var error = new Error('课程历史报名数据超过迁移上限，请先执行人工数据校准');
    error.code = 'BOOKING_MIGRATION_LIMIT';
    throw error;
  }

  return orders.filter(isActiveOrder).length;
}

async function createOrder(options) {
  var db = options.db;
  var data = options.data || {};
  var openid = normalizeText(options.openid);
  var success = options.success;
  var fail = options.fail;
  var userName = normalizeText(data.userName);
  var phone = normalizeText(data.phone);
  var courseId = normalizeText(data.courseId);

  if (!openid) {
    return fail(401, '无法识别当前用户');
  }

  if (!userName || !phone || !courseId) {
    return fail(400, '请完整填写姓名、电话和课程信息');
  }

  var idempotencyKey = buildIdempotencyKey(openid, courseId);
  var orderId = 'booking_' + idempotencyKey.slice(0, 32);

  return db.runTransaction(async function (transaction) {
    var courseResult = await transaction.collection('course').doc(courseId).get();
    var course = courseResult.data;

    if (!course) {
      return fail(404, '课程不存在或已下架');
    }

    var existingResult = await transaction.collection('order')
      .where({
        _openid: openid,
        courseId: courseId
      })
      .limit(20)
      .get();
    var existingOrder = (existingResult.data || []).find(isActiveOrder);

    if (existingOrder && isActiveOrder(existingOrder)) {
      return success({
        id: existingOrder._id,
        duplicate: true
      }, '您已预约该课程');
    }

    var limitCount = Number(course.limitCount) || 0;
    if (limitCount <= 0) {
      return fail(409, '当前课程暂不可预约');
    }

    var reservedCount = Number(course.reservedCount);
    if (!Number.isFinite(reservedCount) || reservedCount < 0) {
      reservedCount = await readInitialReservedCount(transaction, courseId);
    }

    if (reservedCount >= limitCount) {
      return fail(409, '课程名额已满');
    }

    await transaction.collection('order').doc(orderId).set({
      data: {
        userName: userName,
        phone: phone,
        courseId: courseId,
        status: '未确认',
        idempotencyKey: idempotencyKey,
        createTime: db.serverDate(),
        _openid: openid
      }
    });

    await transaction.collection('course').doc(courseId).update({
      data: {
        reservedCount: reservedCount + 1
      }
    });

    return success({
      id: orderId,
      duplicate: false,
      reservedCount: reservedCount + 1,
      limitCount: limitCount
    }, '预约成功');
  });
}

module.exports = {
  buildIdempotencyKey: buildIdempotencyKey,
  createOrder: createOrder,
  isActiveOrder: isActiveOrder
};
