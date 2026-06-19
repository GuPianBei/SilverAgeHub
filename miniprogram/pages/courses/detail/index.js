const { getCourse } = require('../../../services/course');

Page({
  data: {
    loading: true,
    error: '',
    course: {},
    limitCountText: '暂未设置'
  },

  onLoad(options) {
    if (!options.id) {
      this.setData({ loading: false, error: '没有找到课程编号。' });
      return;
    }
    this.loadCourse(options.id);
  },

  loadCourse(id) {
    this.setData({ loading: true, error: '' });
    getCourse(id)
      .then((res) => {
        const course = res.data || {};
        this.setData({
          course,
          limitCountText: course.limitCount || course.limitCount === 0 ? `${course.limitCount} 人` : '暂未设置'
        });
      })
      .catch(() => {
        this.setData({ error: '课程详情暂时加载失败，请返回后重试。' });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  }
});
