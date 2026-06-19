const { callFunction } = require('../utils/cloud');
const { adminFunctionName } = require('../utils/config');

function getAdminIdentity() {
  return callFunction(adminFunctionName, {
    action: 'whoami'
  });
}

function listAdmin(resource) {
  return callFunction(adminFunctionName, {
    resource,
    action: 'list'
  });
}

function createAdmin(resource, data) {
  return callFunction(adminFunctionName, {
    resource,
    action: 'create',
    data
  });
}

function updateAdmin(resource, id, data) {
  return callFunction(adminFunctionName, {
    resource,
    action: 'update',
    id,
    data
  });
}

function deleteAdmin(resource, id) {
  return callFunction(adminFunctionName, {
    resource,
    action: 'delete',
    id
  });
}

module.exports = {
  getAdminIdentity,
  listAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin
};
