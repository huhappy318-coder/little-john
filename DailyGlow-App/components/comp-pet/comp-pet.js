// components/comp-pet/comp-pet.js
const { PET_REPLIES } = require('../../data/replies.js');

const PETS = [
  { id: 'cat', name: '喵阿咪', fullBackground: '/backgrounds/backgroundsbg_adopt_home_cat.png.png' },
  { id: 'dog', name: '旺旺财', fullBackground: '/backgrounds/backgroundsbg_adopt_home_dog.png.png' },
  { id: 'frog', name: '摆烂蛙', fullBackground: '/backgrounds/backgroundsbg_adopt_home_frog.png.png' },
  { id: 'panda', name: '老吃家', fullBackground: '/backgrounds/backgroundsbg_adopt_home_panda.png.png' }
];

Component({
  properties: {
    isVisible: {
      type: Boolean,
      value: false
    }
  },

  data: {
    currentPetIndex: 0,
    customName: '',
    isAdopted: false,
    adoptionTime: 0,
    cooldownDays: 0,
    cooldownText: '',
    petBubbleText: '',
    showBubble: false,
    showNamingModal: false,
    tempName: '',
    pets: PETS,
    hasInteracted: false
  },

  lifetimes: {
    attached() {
      this.loadUserPetInfo();
    }
  },

  methods: {
    loadUserPetInfo() {
      try {
        const userPetInfo = wx.getStorageSync('userPetInfo');
        if (userPetInfo) {
          const { petId, customName, adoptionTime } = JSON.parse(userPetInfo);

          if (!customName || customName.includes('undefined') || !petId) {
            wx.removeStorageSync('userPetInfo');
            this.setData({
              isAdopted: false,
              adoptionTime: 0,
              cooldownDays: 0,
              cooldownText: '',
              customName: PETS[0].name
            });
            return;
          }

          const currentTime = Date.now();
          const timeDiff = currentTime - adoptionTime;
          const weekInMs = 7 * 24 * 60 * 60 * 1000;

          if (timeDiff < weekInMs) {
            const daysLeft = Math.ceil((weekInMs - timeDiff) / (24 * 60 * 60 * 1000));
            this.setData({
              isAdopted: true,
              adoptionTime: adoptionTime,
              cooldownDays: daysLeft,
              cooldownText: '剩余' + daysLeft + '天',
              currentPetIndex: PETS.findIndex(pet => pet.id === petId),
              customName: customName || PETS.find(pet => pet.id === petId).name
            });
          } else {
            this.setData({
              isAdopted: false,
              adoptionTime: 0,
              cooldownDays: 0,
              cooldownText: '',
              customName: PETS[0].name
            });
          }
        } else {
          this.setData({
            customName: PETS[0].name
          });
        }
      } catch (error) {
        console.error('读取用户宠物信息失败:', error);
        try {
          wx.removeStorageSync('userPetInfo');
        } catch (e) {}
        this.setData({
          customName: PETS[0].name,
          isAdopted: false
        });
      }
    },

    handleBack() {
      this.triggerEvent('back');
    },

    handlePrevPet() {
      if (this.data.isAdopted) return;

      const prevIndex = (this.data.currentPetIndex - 1 + PETS.length) % PETS.length;
      this.setData({
        currentPetIndex: prevIndex,
        customName: PETS[prevIndex].name,
        hasInteracted: false
      });
    },

    handleNextPet() {
      if (this.data.isAdopted) return;

      const nextIndex = (this.data.currentPetIndex + 1) % PETS.length;
      this.setData({
        currentPetIndex: nextIndex,
        customName: PETS[nextIndex].name,
        hasInteracted: false
      });
    },

    handleNameInput(e) {
      this.setData({
        tempName: e.detail.value
      });
    },

    handleAdoptPet() {
      if (this.data.isAdopted) {
        wx.showToast({
          title: this.data.cooldownText,
          icon: 'none',
          duration: 2000
        });
        return;
      }

      this.setData({
        tempName: PETS[this.data.currentPetIndex].name,
        showNamingModal: true
      });
    },

    handleNamingConfirm() {
      if (!this.data.tempName.trim()) {
        wx.showToast({
          title: '请输入宠物名字',
          icon: 'none'
        });
        return;
      }

      const currentPet = PETS[this.data.currentPetIndex];
      const userPetInfo = {
        petId: currentPet.id,
        customName: this.data.tempName.trim(),
        adoptionTime: Date.now()
      };

      try {
        wx.setStorageSync('userPetInfo', JSON.stringify(userPetInfo));

        // 存储宠物头像路径
        const petAvatars = {
          'cat': '/pets/avatar_cat.png',
          'dog': '/pets/avatar_dog.png',
          'frog': '/pets/avatar_frog.png',
          'panda': '/pets/avatar_panda.png'
        };
        wx.setStorageSync('my_pet_avatar', petAvatars[currentPet.id] || '/pets/avatar_cat.png');

        this.setData({
          isAdopted: true,
          adoptionTime: userPetInfo.adoptionTime,
          cooldownDays: 7,
          cooldownText: '剩余7天',
          customName: this.data.tempName.trim(),
          showNamingModal: false
        });
        wx.showToast({
          title: '领养成功！',
          icon: 'success'
        });
      } catch (error) {
        console.error('保存宠物信息失败:', error);
        wx.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        });
      }
    },

    handleNamingCancel() {
      this.setData({
        showNamingModal: false
      });
    },

    handlePetInteract() {
      // 不管是否领养，都可以触发互动
      const currentPetId = PETS[this.data.currentPetIndex].id;
      const petReplies = PET_REPLIES[currentPetId];

      const replyKeys = Object.keys(petReplies);
      const randomKey = replyKeys[Math.floor(Math.random() * replyKeys.length)];
      const randomReply = petReplies[randomKey][Math.floor(Math.random() * petReplies[randomKey].length)];

      this.setData({
        petBubbleText: randomReply,
        showBubble: true,
        hasInteracted: true
      });

      setTimeout(() => {
        this.setData({
          showBubble: false
        });
      }, 3000);
    },

    getCurrentPet() {
      return PETS[this.data.currentPetIndex];
    }
  }
})
