const { listGuides } = require('../../services/guide');

const RECOMMEND_LIMIT = 3;

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
    recommendationLoading: true,
    recommendationError: '',
    recommendedGuides: []
  },

  onLoad() {
    this.loadRecommendedGuides();
  },

  loadRecommendedGuides() {
    this.setData({
      recommendationLoading: true,
      recommendationError: ''
    });

    return listGuides()
      .then((res) => {
        const guides = Array.isArray(res.data) ? res.data : [];
        return resolveGuideCovers(guides.slice(0, RECOMMEND_LIMIT));
      })
      .then((recommendedGuides) => {
        this.setData({
          recommendedGuides
        });
      })
      .catch(() => {
        this.setData({
          recommendationError: '推荐教程暂时加载失败，请稍后再试。'
        });
      })
      .finally(() => {
        this.setData({ recommendationLoading: false });
      });
  }
});
