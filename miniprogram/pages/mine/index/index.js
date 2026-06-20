const { listOrders } = require('../../../services/order');
const { listCourses } = require('../../../services/course');
const { enableAdminEntry } = require('../../../utils/config');

const STATUS_TEXT = {
  '未确认': '未确认',
  '已确认': '已确认',
  '完成': '完成'
};

Page({
  data: {
    loading: true,
    error: '',
    orders: [],
    enableAdminEntry
  },

  onShow() {
    this.loadOrders();
  },

  onPullDownRefresh() {
    this.loadOrders().finally(() => wx.stopPullDownRefresh());
  },

  loadOrders() {
    this.setData({ loading: true, error: '' });
    return Promise.all([
      listOrders(),
      listCourses().catch(() => ({ data: [] }))
    ])
      .then(([orderResult, courseResult]) => {
        const courseMap = {};
        (courseResult.data || []).forEach((course) => {
          courseMap[course._id] = course;
        });

        const orders = (orderResult.data || []).map((item) => {
          const course = courseMap[item.courseId] || {};
          return {
          ...item,
            statusText: STATUS_TEXT[item.status] || '未确认',
            courseTitle: course.title || '课程信息待确认',
            courseTime: course.time || '请等待工作人员通知',
            courseLocation: course.location || '请等待工作人员通知'
          };
        });
        this.setData({ orders });
      })
      .catch(() => {
        this.setData({ error: '预约记录暂时加载失败，请稍后再试。' });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  openAdmin() {
    wx.navigateTo({
      url: '/admin/pages/index/index'
    });
  }
});
