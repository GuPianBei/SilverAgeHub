const { envId } = require('./utils/config');

App({
  globalData: {
    envId,
    userInfo: null,
    cloudReady: false,
    cloudError: ''
  },

  onLaunch() {
    if (!wx.cloud) {
      this.globalData.cloudError = '当前微信基础库不支持云开发';
      return;
    }

    if (!envId) {
      this.globalData.cloudError = '尚未配置云开发环境 ID';
      return;
    }

    wx.cloud.init({
      env: envId,
      traceUser: true
    });
    this.globalData.cloudReady = true;
  }
});
