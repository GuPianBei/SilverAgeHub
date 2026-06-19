const { envId, cloudFunctionTimeout } = require('./config');

function createError(message, code, cause) {
  const error = new Error(message);
  error.code = code;
  error.cause = cause;
  return error;
}

function validateCloud() {
  if (!wx.cloud) {
    throw createError('当前微信基础库不支持云开发，请升级开发者工具或基础库。', 'CLOUD_UNAVAILABLE');
  }

  if (!envId) {
    throw createError('未配置云环境 ID，请检查 miniprogram/utils/config.js。', 'ENV_NOT_CONFIGURED');
  }
}

function withTimeout(promise, timeout) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(createError('云函数响应超时，请确认云函数已部署到当前环境。', 'CLOUD_TIMEOUT'));
    }, timeout);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function callFunction(name, data = {}) {
  try {
    validateCloud();
  } catch (error) {
    return Promise.reject(error);
  }

  const request = wx.cloud.callFunction({
    name,
    data,
    config: { env: envId }
  });

  return withTimeout(request, cloudFunctionTimeout || 12000)
    .then((res) => {
      const result = res.result;
      if (!result || typeof result.code !== 'number') {
        throw createError(
          `云函数 ${name} 返回格式不正确，请重新部署最新代码。`,
          'INVALID_RESPONSE'
        );
      }

      if (result.code !== 0) {
        throw createError(result.message || '云函数调用失败', result.code);
      }

      return result;
    })
    .catch((error) => {
      if (error && error.code) throw error;

      const message = error && (error.errMsg || error.message);
      throw createError(
        message || `云函数 ${name} 调用失败，请检查环境和部署状态。`,
        'CLOUD_CALL_FAILED',
        error
      );
    });
}

function getCloudStatus() {
  try {
    validateCloud();
    return {
      ready: true,
      envId
    };
  } catch (error) {
    return {
      ready: false,
      envId,
      message: error.message
    };
  }
}

module.exports = {
  callFunction,
  getCloudStatus
};
