var cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

var db = cloud.database();
var collection = db.collection('order');

function pickOrder(data) {
  data = data || {};
  return {
    userName: data.userName || '',
    phone: data.phone || '',
    courseId: data.courseId || ''
  };
}

exports.main = function (event) {
  event = event || {};

  var wxContext = cloud.getWXContext();
  var action = event.action || 'list';
  var order = event.order || {};

  if (action === 'create') {
    var data = pickOrder(order);
    if (!data.userName || !data.phone || !data.courseId) {
      return { code: 400, message: 'Missing order fields' };
    }

    return collection.add({
      data: Object.assign({}, data, {
        status: '未确认',
        createTime: db.serverDate(),
        _openid: wxContext.OPENID
      })
    });
  }

  return collection
    .where({ _openid: wxContext.OPENID })
    .orderBy('createTime', 'desc')
    .get();
};
