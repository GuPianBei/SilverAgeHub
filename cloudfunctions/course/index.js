var cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

var db = cloud.database();
var collection = db.collection('course');

function pickCourse(data) {
  data = data || {};
  return {
    title: data.title || '',
    description: data.description || '',
    time: data.time || '',
    location: data.location || '',
    limitCount: Number(data.limitCount) || 0
  };
}

exports.main = function (event) {
  event = event || {};

  var action = event.action || 'list';
  var id = event.id;
  var course = event.course || {};

  if (action === 'detail') {
    if (!id) return { code: 400, message: 'Missing course id' };
    return collection.doc(id).get();
  }

  if (action === 'create') {
    return collection.add({
      data: Object.assign({}, pickCourse(course), {
        createTime: db.serverDate()
      })
    });
  }

  return collection.orderBy('time', 'asc').get();
};
