Page({
  data: {
    bgList: ['sunset', 'night', 'rainy', 'snowy'],
    currentBgIndex: 0,
    bgImage: '/assets/bg_room_sunset.png',
    isFading: false,
    activeComponent: ''
  },

  onLoad() {
    // 页面加载时初始化背景
  },

  handleWeatherChange() {
    // 开始淡出动画
    this.setData({ isFading: true });

    // 等待淡出完成后切换图片
    setTimeout(() => {
      const nextIndex = (this.data.currentBgIndex + 1) % this.data.bgList.length;
      const nextBg = `/assets/bg_room_${this.data.bgList[nextIndex]}.png`;

      this.setData({
        currentBgIndex: nextIndex,
        bgImage: nextBg,
        isFading: false
      });
    }, 800); // 与CSS动画时间一致
  },

  handleTabClick(e) {
    const component = e.currentTarget.dataset.component;
    this.setData({ activeComponent: component });
  },

  handleComponentBack() {
    this.setData({ activeComponent: '' });
  },

  // 切换到日历组件并刷新数据
  handleSwitchToArchive() {
    this.setData({
      activeComponent: 'archive'
    });

    // 通知 comp-archive 组件刷新数据
    const compArchive = this.selectComponent('#comp-archive');
    if (compArchive) {
      compArchive.onRefresh();
    }
  }
})