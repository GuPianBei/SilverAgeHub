const { listGuides } = require('../../../services/guide');

function isCloudFile(fileID) {
  return typeof fileID === 'string' && fileID.indexOf('cloud://') === 0;
}

function resolveGuideCovers(guides) {
  const values = guides.map((guide) => {
    const images = Array.isArray(guide.images) ? guide.images : [];
    return images[0] || '';
  });
  const cloudFiles = values.filter(isCloudFile);

  if (!cloudFiles.length) {
    return Promise.resolve(guides.map((guide, index) => ({
      ...guide,
      coverImage: values[index]
    })));
  }

  return wx.cloud.getTempFileURL({ fileList: cloudFiles })
    .then((result) => {
      const urlMap = {};
      (result.fileList || []).forEach((file) => {
        if (file.fileID && file.tempFileURL) {
          urlMap[file.fileID] = file.tempFileURL;
        }
      });

      return guides.map((guide, index) => ({
        ...guide,
        coverImage: urlMap[values[index]] || values[index]
      }));
    })
    .catch(() => guides.map((guide, index) => ({
      ...guide,
      coverImage: values[index]
    })));
}

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
        return resolveGuideCovers(res.data || []);
      })
      .then((guides) => {
        this.setData({ guides });
      })
      .catch(() => {
        this.setData({ error: '教程暂时加载失败，请稍后再试。' });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  }
});
