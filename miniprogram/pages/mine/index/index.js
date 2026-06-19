const { listOrders } = require('../../../services/order');
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
    return listOrders()
      .then((res) => {
        const orders = (res.data || []).map((item) => ({
          ...item,
          statusText: STATUS_TEXT[item.status] || '未确认'
        }));
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
