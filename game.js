/**
 * Tail Swing - Main Game Controller & Infinite Game Loop
 */

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.physics = new PhysicsEngine();
    this.ui = new UIManager(this);

    this.levelGen = new InfiniteLevelGenerator();
    this.player = null;

    this.camera = { x: 0, y: 0 };
    this.isRunning = false;
    this.isPaused = false;

    this.inputActive = false;
    this.distanceScore = 0;

    this.initCanvasSize();
    this.setupInputs();
    this.resetGame();

    requestAnimationFrame(this.loop.bind(this));
  }

  initCanvasSize() {
    const container = document.getElementById('game-container');
    this.canvas.width = container.clientWidth || 1280;
    this.canvas.height = container.clientHeight || 720;

    window.addEventListener('resize', () => {
      this.canvas.width = container.clientWidth || 1280;
      this.canvas.height = container.clientHeight || 720;
    });
  }

  setupInputs() {
    const handleStart = (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('.screen-overlay')) return;
      this.inputActive = true;
      if (this.player) {
        this.player.isInputActive = true;
      }
    };

    const handleEnd = (e) => {
      this.inputActive = false;
      if (this.player) {
        this.player.isInputActive = false;
        if (this.player.isSwinging) {
          this.physics.detachRope(this.player);
        }
      }
    };

    window.addEventListener('mousedown', handleStart);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchstart', handleStart, { passive: true });
    window.addEventListener('touchend', handleEnd, { passive: true });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !e.repeat) {
        handleStart(e);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        handleEnd(e);
      }
    });
  }

  resetGame() {
    this.levelGen.reset();

    this.player = {
      x: 100,
      y: 480,
      vx: 6,
      vy: -2,
      radius: 20,
      state: 'FALLING',
      isSwinging: false,
      ropeAnchor: null,
      ropeLength: 0,
      angularVelocity: 0,
      angle: 0,
      rotation: 0,
      coinsCollected: 0,
      isInputActive: this.inputActive
    };

    this.distanceScore = 0;
    this.camera.x = 0;
    this.camera.y = 0;
    this.ui.updateHUD();
  }

  startLevel() {
    this.resetGame();
    this.isRunning = true;
    this.isPaused = false;
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  update() {
    if (!this.isRunning || this.isPaused) return;

    // Procedural level generation ahead of player
    this.levelGen.generateAhead(this.player.x + 2500);
    this.levelGen.cleanupBehind(this.camera.x - 500);

    // Physics step
    this.physics.updatePlayer(this.player, this.levelGen);

    // Update Distance Score (meters)
    this.distanceScore = Math.max(this.distanceScore, Math.floor(this.player.x / 10));
    this.ui.updateHUD();

    // Smooth Camera Follow
    const targetCamX = this.player.x - this.canvas.width / 3;
    const targetCamY = Math.max(0, this.player.y - this.canvas.height / 2);
    this.camera.x += (targetCamX - this.camera.x) * 0.1;
    this.camera.y += (targetCamY - this.camera.y) * 0.1;

    // Check Player Death
    if (this.player.state === 'DEAD') {
      this.isRunning = false;
      setTimeout(() => this.ui.showGameOverScreen(this.distanceScore, this.player.coinsCollected), 400);
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.player) return;

    this.ctx.save();
    this.ctx.translate(-this.camera.x, -this.camera.y);

    // 1. Sky Background & Parallax Clouds
    this.renderBackground();

    // 2. Platforms
    if (this.levelGen.platforms) {
      for (const p of this.levelGen.platforms) {
        if (p.type === 'bouncy') {
          this.ctx.fillStyle = '#ff4081';
          this.ctx.strokeStyle = '#c2185b';
          this.ctx.lineWidth = 4;
          this.ctx.beginPath();
          this.ctx.roundRect(p.x, p.y, p.w, p.h, 10);
          this.ctx.fill();
          this.ctx.stroke();
        } else {
          this.ctx.fillStyle = '#4caf50';
          this.ctx.strokeStyle = '#2e7d32';
          this.ctx.lineWidth = 4;
          this.ctx.beginPath();
          this.ctx.roundRect(p.x, p.y, p.w, p.h, 8);
          this.ctx.fill();
          this.ctx.stroke();
        }
      }
    }

    // 3. Hazard Spikes
    if (this.levelGen.hazards) {
      this.ctx.fillStyle = '#e53935';
      for (const h of this.levelGen.hazards) {
        const spikeCount = Math.floor(h.w / 20);
        for (let i = 0; i < spikeCount; i++) {
          this.ctx.beginPath();
          this.ctx.moveTo(h.x + i * 20, h.y + h.h);
          this.ctx.lineTo(h.x + i * 20 + 10, h.y);
          this.ctx.lineTo(h.x + (i + 1) * 20, h.y + h.h);
          this.ctx.closePath();
          this.ctx.fill();
        }
      }
    }

    // 4. Swing Anchors & Target Indicator
    const bestAnchor = this.physics.findBestAnchor(this.player, this.levelGen.anchors);
    for (const a of this.levelGen.anchors) {
      this.ctx.beginPath();
      this.ctx.arc(a.x, a.y, 14, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffb74d';
      this.ctx.fill();
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = '#f57c00';
      this.ctx.stroke();

      if (a === bestAnchor && !this.player.isSwinging) {
        this.ctx.beginPath();
        this.ctx.arc(a.x, a.y, 22, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#00e676';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([6, 6]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
      }
    }

    // 5. Swing Tail / Rope
    if (this.player.isSwinging && this.player.ropeAnchor) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.player.ropeAnchor.x, this.player.ropeAnchor.y);
      this.ctx.lineTo(this.player.x, this.player.y);
      this.ctx.lineWidth = 5;
      this.ctx.strokeStyle = '#3e2723';
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(this.player.ropeAnchor.x, this.player.ropeAnchor.y, 6, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ff5722';
      this.ctx.fill();
    }

    // 6. Collectible Coins
    if (this.levelGen.coins) {
      for (const c of this.levelGen.coins) {
        if (!c.collected) {
          this.ctx.beginPath();
          this.ctx.arc(c.x, c.y, 14, 0, Math.PI * 2);
          this.ctx.fillStyle = '#ffd54f';
          this.ctx.fill();
          this.ctx.lineWidth = 2;
          this.ctx.strokeStyle = '#ff8f00';
          this.ctx.stroke();

          this.ctx.fillStyle = '#ff8f00';
          this.ctx.font = 'bold 12px sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('$', c.x, c.y);
        }
      }
    }

    // 7. Player Avatar
    this.ui.drawPlayerAvatar(
      this.ctx,
      this.player.x,
      this.player.y,
      this.ui.selectedSkin,
      this.player.rotation,
      1.2,
      this.player.isSwinging
    );

    this.ctx.restore();
  }

  renderBackground() {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    const cloudPositions = [
      { x: 200, y: 150, r: 40 },
      { x: 600, y: 100, r: 60 },
      { x: 1100, y: 180, r: 50 },
      { x: 1700, y: 120, r: 70 },
      { x: 2300, y: 160, r: 45 },
      { x: 2900, y: 110, r: 65 }
    ];

    for (const c of cloudPositions) {
      const parallaxX = c.x + this.camera.x * 0.3;
      this.ctx.beginPath();
      this.ctx.arc(parallaxX, c.y, c.r, 0, Math.PI * 2);
      this.ctx.arc(parallaxX + c.r * 0.6, c.y - c.r * 0.2, c.r * 0.7, 0, Math.PI * 2);
      this.ctx.arc(parallaxX - c.r * 0.6, c.y - c.r * 0.2, c.r * 0.7, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  loop() {
    this.update();
    this.render();
    requestAnimationFrame(this.loop.bind(this));
  }
}

window.addEventListener('load', () => {
  window.game = new Game();
});
