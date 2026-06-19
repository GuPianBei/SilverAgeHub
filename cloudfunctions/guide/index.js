var cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

var db = cloud.database();
var collection = db.collection('guide');

function pickGuide(data) {
  data = data || {};
  return {
    title: data.title || '',
    category: data.category || '',
    content: data.content || '',
    images: Array.isArray(data.images) ? data.images : [],
    video: data.video || ''
  };
}

exports.main = function (event) {
  event = event || {};

  var action = event.action || 'list';
  var id = event.id;
  var guide = event.guide || {};

  if (action === 'detail') {
    if (!id) return { code: 400, message: 'Missing guide id' };
    return collection.doc(id).get();
  }

  if (action === 'create') {
    return collection.add({
      data: Object.assign({}, pickGuide(guide), {
        createTime: db.serverDate()
      })
    });
  }

  return collection.orderBy('createTime', 'desc').get();
};
