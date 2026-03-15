// components/comp-archive/comp-archive.js
Component({
  properties: {
    isVisible: {
      type: Boolean,
      value: false
    }
  },

  data: {
    currentYear: 0,
    currentMonth: 0,
    calendarDays: [],
    showPopup: false,
    currentRecords: [],
    currentRecordDate: ''
  },

  lifetimes: {
    attached() {
      this.initCalendar();
    }
  },

  methods: {
    // 初始化日历
    initCalendar() {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      this.setData({
        currentYear: year,
        currentMonth: month
      });

      this.generateCalendar(year, month);
    },

    // 生成 42 宫格完整日历
    generateCalendar(year, month) {
      const calendarDays = [];

      // 获取今天的真实日期
      const today = new Date();
      const todayYear = today.getFullYear();
      const todayMonth = today.getMonth() + 1;
      const todayDay = today.getDate();

      // 计算当前月第一天和最后一天
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);

      // 计算第一天是星期几 (0=日, 1=一, ..., 6=六)
      const firstDayWeek = firstDay.getDay();

      // 上月填充
      const prevMonthLastDate = new Date(year, month - 1, 0).getDate();
      for (let i = firstDayWeek - 1; i >= 0; i--) {
        const prevDay = prevMonthLastDate - i;
        const prevDayYear = (month === 1) ? year - 1 : year;
        const prevDayMonth = (month === 1) ? 12 : month - 1;
        const dateKey = `${prevDayYear}-${String(prevDayMonth).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;
        const recordCount = this.getRecordCount(dateKey);

        calendarDays.push({
          day: prevDay,
          type: 'prev',
          recordCount: recordCount,
          year: prevDayYear,
          month: prevDayMonth
        });
      }

      // 本月填充
      const daysInMonth = lastDay.getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const recordCount = this.getRecordCount(dateKey);
        const isToday = (year === todayYear && month === todayMonth && i === todayDay);

        calendarDays.push({
          day: i,
          type: 'current',
          recordCount: recordCount,
          year: year,
          month: month,
          isToday: isToday
        });
      }

      // 下月填充，直到数组长度达到 42
      const remainingDays = 42 - calendarDays.length;
      for (let i = 1; i <= remainingDays; i++) {
        const nextDayYear = (month === 12) ? year + 1 : year;
        const nextDayMonth = (month === 12) ? 1 : month + 1;
        const dateKey = `${nextDayYear}-${String(nextDayMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const recordCount = this.getRecordCount(dateKey);

        calendarDays.push({
          day: i,
          type: 'next',
          recordCount: recordCount,
          year: nextDayYear,
          month: nextDayMonth
        });
      }

      this.setData({
        calendarDays: calendarDays
      });
    },

    // 获取指定日期的记录数量
    getRecordCount(dateKey) {
      try {
        const sparkleRecords = wx.getStorageSync('sparkle_records') || {};
        return sparkleRecords[dateKey] ? sparkleRecords[dateKey].length : 0;
      } catch (error) {
        console.error('读取记录失败:', error);
        return 0;
      }
    },

    // 查看记录
    viewRecord(e) {
      const day = e.currentTarget.dataset.day;
      const year = e.currentTarget.dataset.year;
      const month = e.currentTarget.dataset.month;

      // 拼接完整日期字符串，与 comp-write.js 保持一致
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // 从缓存中获取记录
      try {
        const sparkleRecords = wx.getStorageSync('sparkle_records') || {};
        const records = sparkleRecords[dateStr] || [];

        if (records.length > 0) {
          this.setData({
            showPopup: true,
            currentRecords: records,
            currentRecordDate: `${year}年${month}月${day}日`
          });
        }
      } catch (error) {
        console.error('读取记录失败:', error);
      }
    },

    // 关闭弹窗
    closePopup() {
      this.setData({
        showPopup: false,
        currentRecords: [],
        currentRecordDate: ''
      });
    },

    // 上月切换
    prevMonth() {
      let { currentYear, currentMonth } = this.data;
      currentMonth -= 1;

      if (currentMonth < 1) {
        currentMonth = 12;
        currentYear -= 1;
      }

      this.setData({
        currentYear,
        currentMonth
      });

      this.generateCalendar(currentYear, currentMonth);
    },

    // 下月切换
    nextMonth() {
      let { currentYear, currentMonth } = this.data;
      currentMonth += 1;

      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear += 1;
      }

      this.setData({
        currentYear,
        currentMonth
      });

      this.generateCalendar(currentYear, currentMonth);
    },

    // 刷新日历数据
    onRefresh() {
      this.generateCalendar(this.data.currentYear, this.data.currentMonth);
    },

    // 返回按钮
    handleBack() {
      this.triggerEvent('back');
    }
  }
})