const { callFunction } = require('../utils/cloud');
const { userFunctionName } = require('../utils/config');

function listCourses(params = {}) {
  return callFunction(userFunctionName, {
    resource: 'course',
    action: 'list',
    ...params
  });
}

function getCourse(id) {
  return callFunction(userFunctionName, {
    resource: 'course',
    action: 'detail',
    id
  });
}

module.exports = {
  listCourses,
  getCourse
};
