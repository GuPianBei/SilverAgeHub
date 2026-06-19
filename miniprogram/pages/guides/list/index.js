const { listGuides } = require('../../../services/guide');

Page({
  data: {
    loading: true,
    error: '',
    guides: []
  },

  onLoad() {
    this.loadGuides();
  },

  onPullDownRefresh() {
    this.loadGuides().finally(() => wx.stopPullDownRefresh());
  },

  loadGuides() {
    this.setData({ loading: true, error: '' });
    return listGuides()
      .then((res) => {
        this.setData({ guides: res.data || [] });
      })
      .catch(() => {
        this.setData({ error: '教程暂时加载失败，请稍后再试。' });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  }
});
