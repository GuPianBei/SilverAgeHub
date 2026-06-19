const { callFunction } = require('../utils/cloud');
const { userFunctionName } = require('../utils/config');

function createOrder(order) {
  return callFunction(userFunctionName, {
    resource: 'order',
    action: 'create',
    data: order
  });
}

function listOrders(params = {}) {
  return callFunction(userFunctionName, {
    resource: 'order',
    action: 'list',
    ...params
  });
}

module.exports = {
  createOrder,
  listOrders
};
