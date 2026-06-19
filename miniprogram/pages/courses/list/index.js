const { listCourses } = require('../../../services/course');

Page({
  data: {
    loading: true,
    error: '',
    courses: []
  },

  onLoad() {
    this.loadCourses();
  },

  onPullDownRefresh() {
    this.loadCourses().finally(() => wx.stopPullDownRefresh());
  },

  loadCourses() {
    this.setData({ loading: true, error: '' });
    return listCourses()
      .then((res) => {
        this.setData({ courses: res.data || [] });
      })
      .catch(() => {
        this.setData({ error: '课程暂时加载失败，请稍后再试。' });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  }
});
