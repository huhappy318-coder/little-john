// components/comp-write/comp-write.js
const QUOTES = require('../../data/foreign-literature-quotes.js');

Component({
  properties: {
    isVisible: {
      type: Boolean,
      value: false
    }
  },

  data: function() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}.${month}.${day}`;

    return {
      inputText: '',
      imgPath: '',
      quoteText: '',
      quoteSource: '',
      isGenerating: false,
      showQuote: false,
      petAvatar: '', // 添加宠物头像路径
      showPoster: false,
      posterImage: '', // 添加海报图片路径
      formattedDate: formattedDate, // 添加格式化日期
      isLongQuote: false,
      saveMode: '' // 添加保存模式
    };
  },

  lifetimes: {
    attached() {
      this.loadPetAvatar(); // 加载宠物头像
      this.formatCurrentDate(); // 格式化日期
    }
  },

  methods: {
    // 格式化日期
    formatCurrentDate() {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}.${month}.${day}`;
      this.setData({
        formattedDate: formattedDate
      });
    },

    // 加载宠物头像
    loadPetAvatar() {
      try {
        const myPetAvatar = wx.getStorageSync('my_pet_avatar');
        if (myPetAvatar) {
          this.setData({
            petAvatar: myPetAvatar
          });
        } else {
          // 使用默认头像路径
          this.setData({
            petAvatar: '/pets/avatar_cat.png'
          });
        }
      } catch (error) {
        console.error('读取宠物头像失败:', error);
        this.setData({
          petAvatar: '/pets/avatar_cat.png'
        });
      }
    },

    // 检查今日记录次数
    checkDailyLimit() {
      const today = new Date().toISOString().split('T')[0];
      try {
        const sparkleRecords = wx.getStorageSync('sparkle_records') || {};
        return sparkleRecords[today] ? sparkleRecords[today].length : 0;
      } catch (error) {
        console.error('读取记录失败:', error);
        return 0;
      }
    },

    // 抽取今日治愈金句
    handleExtractQuote() {
      const recordCount = this.checkDailyLimit();

      if (recordCount >= 3) {
        wx.showToast({
          title: '今天已经闪光 3 次啦，明天再来吧~',
          icon: 'none',
          duration: 3000
        });
        return;
      }

      this.setData({ isGenerating: true });

      // 模拟抽取过程
      setTimeout(() => {
        const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        const isLongQuote = randomQuote.text.length > 20;
        this.setData({
          quoteText: randomQuote.text,
          quoteSource: randomQuote.source,
          showQuote: true,
          isGenerating: false,
          isLongQuote: isLongQuote
        });
      }, 1000);
    },

    // 选择图片
    handleChooseImage() {
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.setData({
            imgPath: res.tempFilePaths[0]
          });
        },
        fail: (err) => {
          console.error('选择图片失败:', err);
        }
      });
    },

    // 清除图片
    handleClearImage() {
      this.setData({
        imgPath: ''
      });
    },

    // 输入内容变化
    handleInputChange(e) {
      this.setData({
        inputText: e.detail.value
      });
    },

    // 文字闪光按钮
    saveAsText() {
      console.log("【文字闪光】按钮被成功触发！");

      const recordCount = this.checkDailyLimit();
      if (recordCount >= 3) {
        wx.showToast({
          title: '今天已经闪光 3 次啦，明天再来吧~',
          icon: 'none',
          duration: 3000
        });
        return;
      }

      // 第一步：文字校验
      const text = this.data.inputText || '';
      if (!text.trim()) {
        wx.showToast({
          title: '写点什么再闪光吧~',
          icon: 'none'
        });
        return;
      }

      // 第二步：强制执行 Canvas，只要有文字就绘图
      // 无视用户是否上传真实照片，直接调用默认装饰图
      this.setData({
        showPoster: true,
        saveMode: 'text' // 文字闪光模式
      });
    },

    // 文字闪光按钮
    handleSaveAsText() {
      const recordCount = this.checkDailyLimit();
      if (recordCount >= 3) {
        wx.showToast({
          title: '今天已经闪光 3 次啦，明天再来吧~',
          icon: 'none',
          duration: 3000
        });
        return;
      }

      const text = this.data.inputText || '';
      if (!text.trim()) {
        wx.showToast({
          title: '请输入闪光内容',
          icon: 'none'
        });
        return;
      }

      if (!this.data.quoteText) {
        wx.showToast({
          title: '请先抽取治愈语录',
          icon: 'none'
        });
        return;
      }

      // 震动反馈
      wx.vibrateShort();

      // 显示预览弹窗，不立即绘制海报
      this.setData({
        showPoster: true,
        saveMode: 'text' // 文字闪光模式
      });
    },

    // 图片闪光按钮
    handleSaveAsImage() {
      const recordCount = this.checkDailyLimit();
      if (recordCount >= 3) {
        wx.showToast({
          title: '今天已经闪光 3 次啦，明天再来吧~',
          icon: 'none',
          duration: 3000
        });
        return;
      }

      if (!this.data.imgPath) {
        wx.showToast({
          title: '请先选择照片哦',
          icon: 'none'
        });
        return;
      }

      const text = this.data.inputText || '';
      if (!text.trim()) {
        wx.showToast({
          title: '请输入闪光内容',
          icon: 'none'
        });
        return;
      }

      if (!this.data.quoteText) {
        wx.showToast({
          title: '请先抽取治愈语录',
          icon: 'none'
        });
        return;
      }

      // 震动反馈
      wx.vibrateShort();

      // 显示预览弹窗，不立即绘制海报
      this.setData({
        showPoster: true,
        saveMode: 'image' // 图片闪光模式
      });
    },

    // 计算是否有图片的类
    getImageClass() {
      return this.data.imgPath ? 'has-image' : 'no-image';
    },

    // 绘制海报 - 修复文字闪光模式
    drawPoster() {
      return new Promise((resolve, reject) => {
        const query = wx.createSelectorQuery().in(this);
        query.select('#posterCanvas').fields({
          node: true,
          size: true
        }).exec((res) => {
          if (!res || !res[0] || !res[0].node) {
            console.error('未找到 Canvas 节点');
            reject(new Error('未找到 Canvas 节点'));
            return;
          }

          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          const dpr = wx.getSystemInfoSync().pixelRatio;

          // 设置 Canvas 尺寸为 3:4 比例 (750rpx x 1000rpx)
          const canvasWidth = 750;
          const canvasHeight = 1000;
          canvas.width = canvasWidth * dpr;
          canvas.height = canvasHeight * dpr;
          ctx.scale(dpr, dpr);

          // 设置背景 - 使用指定的导出背景
          const bgImg = canvas.createImage();
          bgImg.onload = () => {
            ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);

            // 绘制纸张纹理 - 移除不存在的纹理图片
            ctx.globalAlpha = 0.03;
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            ctx.globalAlpha = 1;

            // 绘制时间戳
            ctx.fillStyle = '#8B4513';
            ctx.font = 'bold 12px serif';
            ctx.fillText(this.data.formattedDate, 20, 30);

              // 文字闪光模式 - 不使用任何占位图
              if (this.data.saveMode === 'text') {
                // 直接绘制用户文本
                if (this.data.inputText) {
                  ctx.fillStyle = '#5D4037'; // 深褐色文字
                  ctx.font = '18px serif'; // 加大字号
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'top';
                  ctx.lineHeight = 32;

                  const maxTextWidth = canvasWidth - 80;
                  const textX = canvasWidth / 2;
                  const textY = 100;

                  const textArray = this.splitText(this.data.inputText, ctx, maxTextWidth);
                  textArray.forEach((line, index) => {
                    ctx.fillText(line, textX, textY + index * 32);
                  });
                }

                // 绘制治愈语录
                if (this.data.quoteText) {
                  ctx.fillStyle = '#7FB2E5'; // 淡蓝色语录
                  ctx.font = '14px serif';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'top';
                  ctx.lineHeight = 24;

                  const quoteX = canvasWidth / 2;
                  const quoteY = this.data.inputText ? (100 + this.splitText(this.data.inputText, ctx, canvasWidth - 80).length * 32 + 40) : 100;
                  const maxQuoteWidth = canvasWidth - 80;

                  const quoteArray = this.splitText(this.data.quoteText, ctx, maxQuoteWidth);
                  quoteArray.forEach((line, index) => {
                    ctx.fillText(line, quoteX, quoteY + index * 24);
                  });

                  // 绘制语录来源
                  ctx.fillStyle = '#7FB2E5';
                  ctx.font = '12px serif';
                  ctx.fillText(this.data.quoteSource, quoteX, quoteY + quoteArray.length * 24 + 15);
                }

                // 导出图片
                wx.canvasToTempFilePath({
                  canvas: canvas,
                  success: (res) => {
                    resolve(res.tempFilePath);
                  },
                  fail: reject
                });
              } else {
                // 图片闪光模式或其他模式
                if (this.data.imgPath) {
                  const img = canvas.createImage();
                  img.onload = () => {
                    // 计算图片尺寸 - 3:4 比例下的优化
                    const imgWidth = img.width;
                    const imgHeight = img.height;
                    const maxImgWidth = 200;
                    const maxImgHeight = 250;

                    let drawWidth = imgWidth;
                    let drawHeight = imgHeight;

                    if (imgWidth > maxImgWidth || imgHeight > maxImgHeight) {
                      const ratio = Math.min(maxImgWidth / imgWidth, maxImgHeight / imgHeight);
                      drawWidth = imgWidth * ratio;
                      drawHeight = imgHeight * ratio;
                    }

                    // 图片居中绘制
                    const imgX = (canvasWidth - drawWidth) / 2;
                    const imgY = 100;

                    // 绘制拍立得框架
                    ctx.fillStyle = 'white';
                    ctx.fillRect(imgX - 20, imgY - 20, drawWidth + 40, drawHeight + 60);

                    // 绘制阴影
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
                    ctx.shadowBlur = 4;
                    ctx.shadowOffsetX = 2;
                    ctx.shadowOffsetY = 2;

                    // 绘制图片
                    ctx.drawImage(img, imgX, imgY, drawWidth, drawHeight);

                    // 绘制图片标题
                    ctx.fillStyle = '#666';
                    ctx.font = '14px serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('闪光时刻', imgX + drawWidth / 2, imgY + drawHeight + 35);

                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;

                    // 绘制用户文本 - 图片上方
                    if (this.data.inputText) {
                      ctx.fillStyle = '#5D4037'; // 深褐色文字
                      ctx.font = '18px serif'; // 加大字号
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'top';
                      ctx.lineHeight = 32;

                      const maxTextWidth = canvasWidth - 80;
                      const textX = canvasWidth / 2;
                      const textY = 50;

                      const textArray = this.splitText(this.data.inputText, ctx, maxTextWidth);
                      textArray.forEach((line, index) => {
                        ctx.fillText(line, textX, textY + index * 32);
                      });
                    }

                    // 绘制治愈语录 - 图片下方
                    if (this.data.quoteText) {
                      ctx.fillStyle = '#7FB2E5'; // 淡蓝色语录
                      ctx.font = '14px serif';
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'top';
                      ctx.lineHeight = 24;

                      const quoteX = canvasWidth / 2;
                      const quoteY = imgY + drawHeight + 70;
                      const maxQuoteWidth = canvasWidth - 80;

                      const quoteArray = this.splitText(this.data.quoteText, ctx, maxQuoteWidth);
                      quoteArray.forEach((line, index) => {
                        ctx.fillText(line, quoteX, quoteY + index * 24);
                      });

                      // 绘制语录来源
                      ctx.fillStyle = '#7FB2E5';
                      ctx.font = '12px serif';
                      ctx.fillText(this.data.quoteSource, quoteX, quoteY + quoteArray.length * 24 + 15);
                    }

                    // 导出图片
                    wx.canvasToTempFilePath({
                      canvas: canvas,
                      success: (res) => {
                        resolve(res.tempFilePath);
                      },
                      fail: reject
                    });
                  };
                  img.onerror = reject;
                  img.src = this.data.imgPath;
                } else {
                  // 无图片模式布局
                  if (this.data.inputText) {
                    ctx.fillStyle = '#5D4037'; // 深褐色文字
                    ctx.font = '18px serif'; // 加大字号
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.lineHeight = 32;

                    const maxTextWidth = canvasWidth - 80;
                    const textX = canvasWidth / 2;
                    const textY = 100;

                    const textArray = this.splitText(this.data.inputText, ctx, maxTextWidth);
                    textArray.forEach((line, index) => {
                      ctx.fillText(line, textX, textY + index * 32);
                    });
                  }

                  if (this.data.quoteText) {
                    ctx.fillStyle = '#7FB2E5';
                    ctx.font = '14px serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.lineHeight = 24;

                    const quoteX = canvasWidth / 2;
                    const quoteY = this.data.inputText ? (100 + this.splitText(this.data.inputText, ctx, canvasWidth - 80).length * 32 + 40) : 100;
                    const maxQuoteWidth = canvasWidth - 80;

                    const quoteArray = this.splitText(this.data.quoteText, ctx, maxQuoteWidth);
                    quoteArray.forEach((line, index) => {
                      ctx.fillText(line, quoteX, quoteY + index * 24);
                    });

                    ctx.fillStyle = '#7FB2E5';
                    ctx.font = '12px serif';
                    ctx.fillText(this.data.quoteSource, quoteX, quoteY + quoteArray.length * 24 + 15);
                  }

                  wx.canvasToTempFilePath({
                    canvas: canvas,
                    success: (res) => {
                      resolve(res.tempFilePath);
                    },
                    fail: reject
                  });
                }
              }
          };
          bgImg.onerror = (err) => {
            console.error('加载背景图片失败:', err);
            // 背景图片加载失败时使用默认背景
            ctx.fillStyle = '#FFF9F0';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            // 继续绘制其他内容
          };
          bgImg.src = '../../assets/export_bg.png';
        });
      });
    },

    // 分割文本
    splitText(text, ctx, maxWidth) {
      const result = [];
      let currentLine = '';

      for (let i = 0; i < text.length; i++) {
        currentLine += text[i];
        const metrics = ctx.measureText(currentLine);

        if (metrics.width > maxWidth) {
          // 回退一个字符
          result.push(currentLine.slice(0, -1));
          currentLine = text[i];
        }
      }

      if (currentLine) {
        result.push(currentLine);
      }

      return result;
    },

    // 再改改按钮
    handleEditAgain() {
      this.setData({
        showPoster: false
      });
    },

    // 保存到相册
    handleSaveToAlbum() {
      const recordCount = this.checkDailyLimit();
      if (recordCount >= 3) {
        wx.showToast({
          title: '今天已经闪光 3 次啦，明天再来吧~',
          icon: 'none',
          duration: 3000
        });
        this.setData({
          showPoster: false
        });
        return;
      }

      this.drawPoster().then((tempFilePath) => {
        wx.saveImageToPhotosAlbum({
          filePath: tempFilePath,
          success: () => {
            wx.showToast({
              title: '保存成功',
              icon: 'success'
            });

            // 保存记录到 Storage
            this.saveToStorage();

            // 隐藏预览
            this.setData({
              showPoster: false
            });

            // 清空状态
            this.setData({
              inputText: '',
              imgPath: '',
              quoteText: '',
              quoteSource: '',
              showQuote: false
            });

            // 自动切换到日历组件
            setTimeout(() => {
              this.triggerEvent('switchToArchive');
            }, 500);
          },
          fail: (err) => {
            console.error('保存到相册失败:', err);
            wx.showToast({
              title: '保存失败',
              icon: 'none'
            });
          }
        });
      }).catch((err) => {
        console.error('绘制海报失败:', err);
        wx.showToast({
          title: '绘制海报失败',
          icon: 'none'
        });
      });
    },

    // 保存到 Storage
    saveToStorage() {
      const today = new Date().toISOString().split('T')[0]; // 格式：YYYY-MM-DD
      const records = wx.getStorageSync('sparkle_records') || {};

      // 确保是数组格式
      if (!records[today]) {
        records[today] = [];
      }

      records[today].push({
        date: today,
        text: this.data.inputText,
        quote: {
          text: this.data.quoteText,
          from: this.data.quoteSource
        },
        hasImage: !!this.data.imgPath,
        imagePath: this.data.imgPath,
        timestamp: Date.now()
      });

      wx.setStorageSync('sparkle_records', records);
    },

    // 保存到日历
    saveToCalendar() {
      const text = this.data.inputText || '';
      if (!text.trim()) {
        wx.showToast({
          title: '写点什么再闪光吧~',
          icon: 'none'
        });
        return;
      }

      const today = new Date().toISOString().split('T')[0]; // 格式：YYYY-MM-DD
      const records = wx.getStorageSync('sparkle_records') || {};

      // 检查每日记录数量上限 (每日最多 3 条)
      if (records[today] && records[today].length >= 3) {
        wx.showToast({
          title: '今天已经闪光 3 次啦，明天再来吧~',
          icon: 'none',
          duration: 3000
        });
        return;
      }

      // 初始化当日记录数组
      if (!records[today]) {
        records[today] = [];
      }

      // 添加新记录
      records[today].push({
        date: today,
        text: text.trim(),
        quote: {
          text: this.data.quoteText,
          from: this.data.quoteSource
        },
        hasImage: !!this.data.imgPath,
        imagePath: this.data.imgPath,
        timestamp: Date.now()
      });

      // 保存到本地存储（微信小程序会自动序列化）
      wx.setStorageSync('sparkle_records', records);

      // 清空输入框
      this.setData({
        inputText: ''
      });

      // 成功提示
      wx.showToast({
        title: '✨ 成功记入日历',
        icon: 'success',
        duration: 2000
      });
    },

    // 关闭预览
    handleClosePoster() {
      this.setData({
        showPoster: false
      });
    },

    // 返回按钮
    handleBack() {
      this.triggerEvent('back');
    }
  }
})