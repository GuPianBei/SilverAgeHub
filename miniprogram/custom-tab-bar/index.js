Component({
  data: {
    selected: 0,
    tabs: [
      { pagePath: 'pages/index/index', text: '首页' },
      { pagePath: 'pages/guides/list/index', text: '教程' },
      { pagePath: 'pages/courses/list/index', text: '课程' },
      { pagePath: 'pages/mine/index/index', text: '我的' }
    ]
  },

  lifetimes: {
    attached() {
      this.syncSelected();
    }
  },

  pageLifetimes: {
    show() {
      this.syncSelected();
    }
  },

  methods: {
    syncSelected() {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const currentRoute = currentPage && currentPage.route;
      const selected = this.data.tabs.findIndex((item) => item.pagePath === currentRoute);

      if (selected >= 0 && selected !== this.data.selected) {
        this.setData({ selected });
      }
    },

    switchTab(event) {
      const index = Number(event.currentTarget.dataset.index);
      const item = this.data.tabs[index];

      if (!item || index === this.data.selected) return;

      this.setData({ selected: index });
      wx.switchTab({
        url: `/${item.pagePath}`
      });
    }
  }
});
