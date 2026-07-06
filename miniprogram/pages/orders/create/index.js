const { createOrder } = require('../../../services/order');

Page({
  data: {
    courseId: '',
    userName: '',
    phone: '',
    submitting: false
  },

  onLoad(options) {
    this.setData({ courseId: options.courseId || '' });
  },

  onUserNameInput(event) {
    this.setData({ userName: event.detail.value });
  },

  onPhoneInput(event) {
    this.setData({ phone: event.detail.value });
  },

  submit() {
    const { courseId, userName, phone, submitting } = this.data;
    if (submitting) return;

    if (!courseId) {
      wx.showToast({ title: '缺少课程信息', icon: 'none' });
      return;
    }

    if (!userName || !phone) {
      wx.showToast({ title: '请填写姓名和电话', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    createOrder({ courseId, userName, phone })
      .then((res) => {
        if (res && res.code) {
          throw new Error(res.message);
        }
        wx.showToast({ title: '预约成功' });
        setTimeout(() => {
          wx.switchTab({ url: '/pages/mine/index/index' });
        }, 800);
      })
      .catch((error) => {
        const isCourseFull = Number(error && error.code) === 409;
        wx.showToast({
          title: isCourseFull ? '课程名额已满' : '提交失败，请重试',
          icon: 'none'
        });
      })
      .finally(() => {
        this.setData({ submitting: false });
      });
  }
});
