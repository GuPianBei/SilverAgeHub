const { callFunction } = require('../utils/cloud');
const { userFunctionName } = require('../utils/config');

function listGuides(params = {}) {
  return callFunction(userFunctionName, {
    resource: 'guide',
    action: 'list',
    ...params
  });
}

function getGuide(id) {
  return callFunction(userFunctionName, {
    resource: 'guide',
    action: 'detail',
    id
  });
}

module.exports = {
  listGuides,
  getGuide
};
