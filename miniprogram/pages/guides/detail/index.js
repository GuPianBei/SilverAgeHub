const { getGuide } = require('../../../services/guide');

function isCloudFile(fileID) {
  return typeof fileID === 'string' && fileID.indexOf('cloud://') === 0;
}

function resolveGuideMedia(guide) {
  const images = Array.isArray(guide.images) ? guide.images : [];
  const video = guide.video || '';
  const cloudFiles = images.filter(isCloudFile);
  if (isCloudFile(video)) cloudFiles.push(video);

  if (!cloudFiles.length) {
    return Promise.resolve({
      ...guide,
      displayImages: images,
      displayVideo: video
    });
  }

  return wx.cloud.getTempFileURL({ fileList: cloudFiles })
    .then((result) => {
      const urlMap = {};
      (result.fileList || []).forEach((file) => {
        if (file.fileID && file.tempFileURL) {
          urlMap[file.fileID] = file.tempFileURL;
        }
      });

      return {
        ...guide,
        displayImages: images.map((item) => urlMap[item] || item),
        displayVideo: urlMap[video] || video
      };
    })
    .catch(() => ({
      ...guide,
      displayImages: images,
      displayVideo: video
    }));
}

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
        return resolveGuideMedia(res.data || {});
      })
      .then((guide) => {
        this.setData({ guide });
      })
      .catch(() => {
        this.setData({ error: '教程详情暂时加载失败，请返回后重试。' });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  previewImage(event) {
    const current = event.currentTarget.dataset.src;
    const urls = this.data.guide.displayImages || [];
    if (!current || !urls.length) return;
    wx.previewImage({ current, urls });
  }
});
