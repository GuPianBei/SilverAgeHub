const {
  getAdminIdentity,
  listAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin
} = require('../../../services/admin');

const RESOURCES = [
  { key: 'guide', label: '教程管理' },
  { key: 'course', label: '课程管理' },
  { key: 'order', label: '预约管理' }
];

const EMPTY_FORM = {
  guide: {
    title: '',
    category: '',
    content: '',
    imagesText: '',
    video: ''
  },
  course: {
    title: '',
    description: '',
    time: '',
    location: '',
    limitCount: ''
  }
};

Page({
  data: {
    resources: RESOURCES,
    resourceIndex: 0,
    resource: 'guide',
    resourceLabel: '教程管理',
    loading: true,
    saving: false,
    error: '',
    adminOpenid: '',
    isAdmin: false,
    list: [],
    editingId: '',
    form: { ...EMPTY_FORM.guide },
    statusOptions: ['未确认', '已确认', '完成']
  },

  onLoad() {
    this.initializeAdmin();
  },

  initializeAdmin() {
    this.setData({ loading: true, error: '' });
    return this.checkAdminIdentity()
      .then((isAdmin) => {
        if (!isAdmin) {
          this.setData({ loading: false });
          return null;
        }
        return this.loadList();
      });
  },

  checkAdminIdentity() {
    return getAdminIdentity()
      .then((res) => {
        const identity = res.data || {};
        this.setData({
          adminOpenid: identity.openid || '',
          isAdmin: !!identity.isAdmin
        });
        return !!identity.isAdmin;
      })
      .catch((error) => {
        this.setData({
          adminOpenid: '',
          isAdmin: false,
          loading: false,
          error: error.message || '管理员身份检查失败'
        });
        return false;
      });
  },

  onPullDownRefresh() {
    const request = this.data.isAdmin ? this.loadList() : this.initializeAdmin();
    request.finally(() => wx.stopPullDownRefresh());
  },

  onResourceChange(event) {
    const resourceIndex = Number(event.detail.value);
    const current = RESOURCES[resourceIndex];
    this.setData({
      resourceIndex,
      resource: current.key,
      resourceLabel: current.label,
      editingId: '',
      form: this.getEmptyForm(current.key)
    });
    this.loadList();
  },

  getEmptyForm(resource) {
    return { ...(EMPTY_FORM[resource] || {}) };
  },

  loadList() {
    if (!this.data.isAdmin) {
      return Promise.resolve();
    }
    const { resource } = this.data;
    this.setData({ loading: true, error: '' });
    return listAdmin(resource)
      .then((res) => {
        this.setData({ list: res.data || [] });
      })
      .catch((error) => {
        this.setData({ error: error.message || '管理数据暂时加载失败，请稍后再试。' });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({
      [`form.${field}`]: event.detail.value
    });
  },

  startCreate() {
    this.setData({
      editingId: '',
      form: this.getEmptyForm(this.data.resource)
    });
  },

  startEdit(event) {
    const item = event.currentTarget.dataset.item;
    const { resource } = this.data;

    if (resource === 'guide') {
      this.setData({
        editingId: item._id,
        form: {
          title: item.title || '',
          category: item.category || '',
          content: item.content || '',
          imagesText: (item.images || []).join('\n'),
          video: item.video || ''
        }
      });
    }

    if (resource === 'course') {
      this.setData({
        editingId: item._id,
        form: {
          title: item.title || '',
          description: item.description || '',
          time: item.time || '',
          location: item.location || '',
          limitCount: item.limitCount || ''
        }
      });
    }
  },

  buildPayload() {
    const { resource, form } = this.data;

    if (resource === 'guide') {
      return {
        title: form.title,
        category: form.category,
        content: form.content,
        images: (form.imagesText || '').split('\n').map((item) => item.trim()).filter(Boolean),
        video: form.video
      };
    }

    if (resource === 'course') {
      return {
        title: form.title,
        description: form.description,
        time: form.time,
        location: form.location,
        limitCount: Number(form.limitCount) || 0
      };
    }

    return {};
  },

  saveForm() {
    const { resource, editingId, saving } = this.data;
    if (resource === 'order' || saving) return;

    const payload = this.buildPayload();
    const validationMessage = this.validatePayload(resource, payload);
    if (validationMessage) {
      wx.showToast({ title: validationMessage, icon: 'none' });
      return;
    }

    this.setData({ saving: true });
    const request = editingId
      ? updateAdmin(resource, editingId, payload)
      : createAdmin(resource, payload);

    request
      .then(() => {
        wx.showToast({ title: editingId ? '已保存' : '已新增' });
        this.setData({
          editingId: '',
          form: this.getEmptyForm(resource)
        });
        return this.loadList();
      })
      .catch((error) => {
        wx.showToast({ title: error.message || '保存失败，请重试', icon: 'none' });
      })
      .finally(() => {
        this.setData({ saving: false });
      });
  },

  validatePayload(resource, payload) {
    if (resource === 'guide') {
      if (!payload.title || !payload.category || !payload.content) {
        return '请完整填写教程信息';
      }
      return '';
    }

    if (resource === 'course') {
      if (
        !payload.title ||
        !payload.description ||
        !payload.time ||
        !payload.location ||
        payload.limitCount <= 0
      ) {
        return '请完整填写课程信息';
      }
    }

    return '';
  },

  deleteItem(event) {
    const id = event.currentTarget.dataset.id;
    const { resource } = this.data;
    if (!id || resource === 'order') return;

    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复，确认继续吗？',
      success: (res) => {
        if (!res.confirm) return;
        deleteAdmin(resource, id)
          .then(() => {
            wx.showToast({ title: '已删除' });
            return this.loadList();
          })
          .catch((error) => {
            wx.showToast({ title: error.message || '删除失败，请重试', icon: 'none' });
          });
      }
    });
  },

  onStatusChange(event) {
    const id = event.currentTarget.dataset.id;
    const status = this.data.statusOptions[Number(event.detail.value)];
    updateAdmin('order', id, { status })
      .then(() => {
        wx.showToast({ title: '状态已更新' });
        return this.loadList();
      })
      .catch((error) => {
        wx.showToast({ title: error.message || '更新失败，请重试', icon: 'none' });
      });
  }
});
