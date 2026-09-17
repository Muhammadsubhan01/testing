/**
 * Tail Swing - UI & Character Shop Manager
 */

class UIManager {
  constructor(game) {
    this.game = game;
    this.characterImages = {};
    this.unlockedSkins = JSON.parse(localStorage.getItem('tailswing_unlocked_skins')) || [1];
    this.selectedSkin = parseInt(localStorage.getItem('tailswing_selected_skin')) || 1;
    this.coins = parseInt(localStorage.getItem('tailswing_coins')) || 0;
    this.unlockedLevels = parseInt(localStorage.getItem('tailswing_unlocked_levels')) || 1;

    this.skinCosts = {};
    for (let i = 1; i <= 20; i++) {
      this.skinCosts[i] = i === 1 ? 0 : (i - 1) * 10;
    }

    this.preloadCharacterImages();
    this.setupEventListeners();
  }

  preloadCharacterImages() {
    for (let i = 1; i <= 20; i++) {
      this.characterImages[i] = {
        head: new Image(),
        torso: new Image(),
        leftHand: new Image(),
        rightHand: new Image(),
        leftFoot: new Image(),
        rightFoot: new Image()
      };

      const basePath = `assets/players/player_${i}`;
      this.characterImages[i].head.src = `${basePath}/HEAD.png`;
      this.characterImages[i].torso.src = `${basePath}/TORSO.png`;
      this.characterImages[i].leftHand.src = `${basePath}/LEFT HAND.png`;
      this.characterImages[i].rightHand.src = `${basePath}/RIGHT HAND.png`;
      this.characterImages[i].leftFoot.src = `${basePath}/LEFT FOOT.png`;
      this.characterImages[i].rightFoot.src = `${basePath}/RIGHT FOOT.png`;
    }
  }

  saveData() {
    localStorage.setItem('tailswing_unlocked_skins', JSON.stringify(this.unlockedSkins));
    localStorage.setItem('tailswing_selected_skin', this.selectedSkin);
    localStorage.setItem('tailswing_coins', this.coins);
    localStorage.setItem('tailswing_unlocked_levels', this.unlockedLevels);
  }

  addCoins(amount) {
    this.coins += amount;
    this.saveData();
    this.updateHUD();
  }

  updateHUD() {
    document.getElementById('coin-count').textContent = this.coins;
    document.getElementById('shop-coin-count').textContent = this.coins;
    document.getElementById('hud-level').textContent = `Level ${this.game.currentLevelIndex + 1}`;
  }

  setupEventListeners() {
    document.getElementById('btn-play').addEventListener('click', () => {
      this.game.startLevel(this.game.currentLevelIndex);
      this.showScreen(null);
    });

    document.getElementById('btn-levels-menu').addEventListener('click', () => {
      this.renderLevelGrid();
      this.showScreen('level-overlay');
    });

    document.getElementById('btn-level-back').addEventListener('click', () => {
      this.showScreen('menu-overlay');
    });

    document.getElementById('btn-shop-menu').addEventListener('click', () => {
      this.renderShopGrid();
      this.showScreen('shop-overlay');
    });

    document.getElementById('btn-shop-back').addEventListener('click', () => {
      this.showScreen('menu-overlay');
    });

    document.getElementById('btn-pause').addEventListener('click', () => {
      this.game.pause();
      this.showScreen('pause-overlay');
    });

    document.getElementById('btn-resume').addEventListener('click', () => {
      this.game.resume();
      this.showScreen(null);
    });

    document.getElementById('btn-restart-pause').addEventListener('click', () => {
      this.game.startLevel(this.game.currentLevelIndex);
      this.showScreen(null);
    });

    document.getElementById('btn-menu-pause').addEventListener('click', () => {
      this.showScreen('menu-overlay');
    });

    document.getElementById('btn-restart-result').addEventListener('click', () => {
      this.game.startLevel(this.game.currentLevelIndex);
      this.showScreen(null);
    });

    document.getElementById('btn-next-level').addEventListener('click', () => {
      let nextIdx = this.game.currentLevelIndex + 1;
      if (nextIdx >= LEVELS.length) nextIdx = 0;
      this.game.startLevel(nextIdx);
      this.showScreen(null);
    });

    document.getElementById('btn-menu-result').addEventListener('click', () => {
      this.showScreen('menu-overlay');
    });

    document.getElementById('btn-sound').addEventListener('click', () => {
      if (window.audioEngine) {
        const enabled = window.audioEngine.toggleSound();
        document.getElementById('btn-sound').textContent = enabled ? '🔊' : '🔇';
      }
    });
  }

  showScreen(screenId) {
    const overlays = ['menu-overlay', 'level-overlay', 'shop-overlay', 'pause-overlay', 'result-overlay'];
    overlays.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (id === screenId) {
          el.classList.remove('hidden');
          el.classList.add('active');
        } else {
          el.classList.add('hidden');
          el.classList.remove('active');
        }
      }
    });
  }

  showResultScreen(isWin, earnedCoins) {
    const title = document.getElementById('result-title');
    const subtitle = document.getElementById('result-subtitle');
    const btnNext = document.getElementById('btn-next-level');

    if (isWin) {
      title.textContent = "LEVEL COMPLETE! 🎉";
      subtitle.textContent = `Coins Earned: +${earnedCoins}`;
      btnNext.style.display = "inline-block";
      this.addCoins(earnedCoins);

      if (this.game.currentLevelIndex + 2 > this.unlockedLevels) {
        this.unlockedLevels = Math.min(LEVELS.length, this.game.currentLevelIndex + 2);
        this.saveData();
      }
    } else {
      title.textContent = "GAME OVER";
      subtitle.textContent = "Try again!";
      btnNext.style.display = "none";
    }

    this.showScreen('result-overlay');
  }

  renderLevelGrid() {
    const grid = document.getElementById('level-grid');
    grid.innerHTML = '';

    LEVELS.forEach((lvl, idx) => {
      const btn = document.createElement('button');
      btn.className = 'level-btn';
      const isUnlocked = idx + 1 <= this.unlockedLevels;

      if (!isUnlocked) {
        btn.classList.add('locked');
        btn.textContent = '🔒';
      } else {
        btn.textContent = idx + 1;
        btn.addEventListener('click', () => {
          this.game.startLevel(idx);
          this.showScreen(null);
        });
      }
      grid.appendChild(btn);
    });
  }

  renderShopGrid() {
    const grid = document.getElementById('shop-grid');
    grid.innerHTML = '';
    document.getElementById('shop-coin-count').textContent = this.coins;

    for (let i = 1; i <= 20; i++) {
      const card = document.createElement('div');
      card.className = 'shop-card';
      const isUnlocked = this.unlockedSkins.includes(i);
      const isSelected = this.selectedSkin === i;

      if (isSelected) card.classList.add('selected');
      if (!isUnlocked) card.classList.add('locked');

      const img = document.createElement('img');
      img.className = 'shop-preview';
      img.src = `assets/players/player_${i}/HEAD.png`;

      const costText = document.createElement('div');
      costText.className = 'shop-cost';

      if (isSelected) {
        costText.textContent = 'EQUIPPED';
      } else if (isUnlocked) {
        costText.textContent = 'SELECT';
      } else {
        costText.textContent = `🪙 ${this.skinCosts[i]}`;
      }

      card.appendChild(img);
      card.appendChild(costText);

      card.addEventListener('click', () => {
        if (isUnlocked) {
          this.selectedSkin = i;
          this.saveData();
          this.renderShopGrid();
        } else if (this.coins >= this.skinCosts[i]) {
          this.coins -= this.skinCosts[i];
          this.unlockedSkins.push(i);
          this.selectedSkin = i;
          this.saveData();
          this.renderShopGrid();
        }
      });

      grid.appendChild(card);
    }
  }

  // Helper method to composite and render player avatar onto canvas
  drawPlayerAvatar(ctx, x, y, skinId, angle, scale = 1, isSwinging = false) {
    const imgs = this.characterImages[skinId] || this.characterImages[1];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    const head = imgs.head;
    const torso = imgs.torso;
    const lHand = imgs.leftHand;
    const rHand = imgs.rightHand;
    const lFoot = imgs.leftFoot;
    const rFoot = imgs.rightFoot;

    // Draw feet
    if (lFoot.complete) ctx.drawImage(lFoot, -16, 10, 16, 16);
    if (rFoot.complete) ctx.drawImage(rFoot, 0, 10, 16, 16);

    // Draw torso
    if (torso.complete) ctx.drawImage(torso, -16, -16, 32, 32);

    // Draw head
    if (head.complete) ctx.drawImage(head, -20, -38, 40, 40);

    // Draw hands / tail
    if (lHand.complete) ctx.drawImage(lHand, -26, -10, 16, 16);
    if (rHand.complete) ctx.drawImage(rHand, 10, -10, 16, 16);

    ctx.restore();
  }
}

if (typeof module !== 'undefined') {
  module.exports = UIManager;
} else {
  window.UIManager = UIManager;
}
