const { getGuide } = require('../../../services/guide');

Page({
  data: {
    loading: true,
    error: '',
    guide: {}
  },

  onLoad(options) {
    if (!options.id) {
      this.setData({ loading: false, error: '没有找到教程编号。' });
      return;
    }
    this.loadGuide(options.id);
  },

  loadGuide(id) {
    this.setData({ loading: true, error: '' });
    getGuide(id)
      .then((res) => {
        this.setData({ guide: res.data || {} });
      })
      .catch(() => {
        this.setData({ error: '教程详情暂时加载失败，请返回后重试。' });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  }
});
