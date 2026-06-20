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

const MAX_GUIDE_IMAGES = 20;
const MAX_IMAGES_PER_PICK = 9;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

const EMPTY_FORM = {
  guide: {
    title: '',
    category: '',
    content: '',
    images: [],
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

function chooseMedia(options) {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      ...options,
      success: resolve,
      fail: reject
    });
  });
}

function getExtension(filePath, fallback) {
  const match = String(filePath || '').match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return match ? match[1].toLowerCase() : fallback;
}

function createCloudPath(owner, kind, filePath, fallbackExtension) {
  const ownerPath = String(owner || 'admin').replace(/[^a-zA-Z0-9_-]/g, '');
  const extension = getExtension(filePath, fallbackExtension);
  const random = Math.random().toString(36).slice(2, 10);
  return `guides/${ownerPath}/${kind}/${Date.now()}-${random}.${extension}`;
}

function uploadMedia(owner, filePath, kind, fallbackExtension, onProgress) {
  const task = wx.cloud.uploadFile({
    cloudPath: createCloudPath(owner, kind, filePath, fallbackExtension),
    filePath
  });

  if (task && typeof task.onProgressUpdate === 'function' && onProgress) {
    task.onProgressUpdate(onProgress);
  }

  return task.then((result) => result.fileID);
}

Page({
  data: {
    resources: RESOURCES,
    maxGuideImages: MAX_GUIDE_IMAGES,
    resourceIndex: 0,
    resource: 'guide',
    resourceLabel: '教程管理',
    loading: true,
    saving: false,
    uploadingImages: false,
    uploadingVideo: false,
    uploadProgress: '',
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
    const form = { ...(EMPTY_FORM[resource] || {}) };
    if (resource === 'guide') form.images = [];
    return form;
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
          images: Array.isArray(item.images) ? item.images : [],
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
        images: Array.isArray(form.images) ? form.images : [],
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
    const {
      resource,
      editingId,
      saving,
      uploadingImages,
      uploadingVideo
    } = this.data;
    if (resource === 'order' || saving) return;
    if (uploadingImages || uploadingVideo) {
      wx.showToast({ title: '请等待文件上传完成', icon: 'none' });
      return;
    }

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

  chooseGuideImages() {
    const { uploadingImages, uploadingVideo, form, adminOpenid } = this.data;
    if (uploadingImages || uploadingVideo) return;

    const images = Array.isArray(form.images) ? form.images : [];
    const remaining = MAX_GUIDE_IMAGES - images.length;
    if (remaining <= 0) {
      wx.showToast({ title: `最多上传 ${MAX_GUIDE_IMAGES} 张图片`, icon: 'none' });
      return;
    }

    chooseMedia({
      count: Math.min(remaining, MAX_IMAGES_PER_PICK),
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed']
    })
      .then((result) => {
        const files = result.tempFiles || [];
        const oversized = files.some((file) => Number(file.size) > MAX_IMAGE_SIZE);
        if (oversized) {
          throw new Error('单张图片不能超过 10MB');
        }

        this.setData({
          uploadingImages: true,
          uploadProgress: files.length ? `正在上传第 1/${files.length} 张图片` : ''
        });

        const uploaded = [];
        let chain = Promise.resolve();
        files.forEach((file, index) => {
          chain = chain.then(() => {
            this.setData({
              uploadProgress: `正在上传第 ${index + 1}/${files.length} 张图片`
            });
            return uploadMedia(adminOpenid, file.tempFilePath, 'images', 'jpg', (progress) => {
              this.setData({
                uploadProgress: `第 ${index + 1}/${files.length} 张：${progress.progress}%`
              });
            }).then((fileID) => {
              uploaded.push(fileID);
              this.setData({
                'form.images': images.concat(uploaded)
              });
            });
          });
        });

        return chain.then(() => {
          wx.showToast({ title: '图片上传完成' });
        });
      })
      .catch((error) => {
        const message = error && (error.errMsg || error.message) || '';
        if (message.indexOf('cancel') === -1) {
          wx.showToast({ title: message || '图片上传失败', icon: 'none' });
        }
      })
      .finally(() => {
        this.setData({
          uploadingImages: false,
          uploadProgress: ''
        });
      });
  },

  chooseGuideVideo() {
    const { uploadingImages, uploadingVideo, adminOpenid } = this.data;
    if (uploadingImages || uploadingVideo) return;

    chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album', 'camera'],
      maxDuration: 120
    })
      .then((result) => {
        const file = (result.tempFiles || [])[0];
        if (!file) return null;
        if (Number(file.size) > MAX_VIDEO_SIZE) {
          throw new Error('视频不能超过 50MB');
        }

        this.setData({
          uploadingVideo: true,
          uploadProgress: '正在上传视频'
        });

        return uploadMedia(adminOpenid, file.tempFilePath, 'videos', 'mp4', (progress) => {
          this.setData({
            uploadProgress: `视频上传中：${progress.progress}%`
          });
        }).then((fileID) => {
          this.setData({ 'form.video': fileID });
          wx.showToast({ title: '视频上传完成' });
        });
      })
      .catch((error) => {
        const message = error && (error.errMsg || error.message) || '';
        if (message.indexOf('cancel') === -1) {
          wx.showToast({ title: message || '视频上传失败', icon: 'none' });
        }
      })
      .finally(() => {
        this.setData({
          uploadingVideo: false,
          uploadProgress: ''
        });
      });
  },

  previewGuideImage(event) {
    const current = event.currentTarget.dataset.src;
    const images = this.data.form.images || [];
    if (!current || !images.length) return;
    wx.previewImage({ current, urls: images });
  },

  removeGuideImage(event) {
    const index = Number(event.currentTarget.dataset.index);
    const images = (this.data.form.images || []).slice();
    if (index < 0 || index >= images.length) return;
    images.splice(index, 1);
    this.setData({ 'form.images': images });
  },

  removeGuideVideo() {
    this.setData({ 'form.video': '' });
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
