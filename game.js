/**
 * Tail Swing - Main Game Controller & Canvas Loop
 */

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.physics = new PhysicsEngine();
    this.ui = new UIManager(this);

    this.currentLevelIndex = 0;
    this.level = null;
    this.player = null;

    this.camera = { x: 0, y: 0 };
    this.isRunning = false;
    this.isPaused = false;

    this.inputActive = false;

    this.platformImage = new Image();
    this.platformImage.src = 'assets/platforms/6_Mini Pals Tag platforms-01.png';

    this.initCanvasSize();
    this.setupInputs();
    this.loadLevel(0);

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
        this.triggerSwing();
      }
    };

    const handleEnd = (e) => {
      this.inputActive = false;
      if (this.player) {
        this.player.isInputActive = false;
        this.releaseSwing();
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

  loadLevel(index) {
    this.currentLevelIndex = index;
    const template = LEVELS[index] || LEVELS[0];

    // Deep clone level state
    this.level = {
      ...template,
      coins: template.coins.map(c => ({ ...c, collected: false }))
    };

    this.player = {
      x: template.playerStart.x,
      y: template.playerStart.y,
      vx: template.playerStart.vx,
      vy: template.playerStart.vy,
      radius: 20,
      state: 'IDLE', // IDLE, SWINGING, FALLING, DEAD, WIN
      isSwinging: false,
      ropeAnchor: null,
      ropeLength: 0,
      angularVelocity: 0,
      angle: 0,
      rotation: 0,
      coinsCollected: 0,
      isInputActive: false
    };

    this.camera.x = this.player.x - this.canvas.width / 3;
    this.camera.y = this.player.y - this.canvas.height / 2;
    this.ui.updateHUD();
  }

  startLevel(index) {
    this.loadLevel(index);
    this.isRunning = true;
    this.isPaused = false;
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  triggerSwing() {
    if (!this.player || this.player.state === 'DEAD' || this.player.state === 'WIN') return;

    // Find best anchor ahead
    const bestAnchor = this.physics.findBestAnchor(this.player, this.level.anchors);
    if (bestAnchor) {
      this.player.isSwinging = true;
      this.player.ropeAnchor = bestAnchor;

      const dx = this.player.x - bestAnchor.x;
      const dy = this.player.y - bestAnchor.y;
      this.player.ropeLength = Math.hypot(dx, dy);

      // Convert current linear velocity into angular velocity
      const angle = Math.atan2(dy, dx);
      // Tangential velocity component
      const tangentX = -Math.sin(angle);
      const tangentY = Math.cos(angle);
      const dot = this.player.vx * tangentX + this.player.vy * tangentY;

      this.player.angularVelocity = dot / this.player.ropeLength;
      this.player.angle = angle;
      this.player.state = 'SWINGING';

      if (window.audioEngine) window.audioEngine.playSwing();
    }
  }

  releaseSwing() {
    if (!this.player || !this.player.isSwinging) return;

    this.player.isSwinging = false;
    this.player.ropeAnchor = null;
    this.player.state = 'FALLING';

    // Boost release velocity
    this.player.vx *= 1.25;
    this.player.vy *= 1.15;
  }

  update() {
    if (!this.isRunning || this.isPaused) return;

    // Physics step
    this.physics.updatePlayer(this.player, this.level);

    // Update camera smooth follow
    const targetCamX = this.player.x - this.canvas.width / 3;
    const targetCamY = Math.max(0, this.player.y - this.canvas.height / 2);
    this.camera.x += (targetCamX - this.camera.x) * 0.1;
    this.camera.y += (targetCamY - this.camera.y) * 0.1;

    // Check game outcome state transitions
    if (this.player.state === 'DEAD') {
      this.isRunning = false;
      setTimeout(() => this.ui.showResultScreen(false, 0), 400);
    } else if (this.player.state === 'WIN') {
      this.isRunning = false;
      setTimeout(() => this.ui.showResultScreen(true, this.player.coinsCollected), 400);
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.level || !this.player) return;

    this.ctx.save();
    // Apply Camera Translation
    this.ctx.translate(-this.camera.x, -this.camera.y);

    // 1. Render Sky Background & Clouds
    this.renderBackground();

    // 2. Render Platforms
    if (this.level.platforms) {
      for (const p of this.level.platforms) {
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

    // 3. Render Hazards / Spikes
    if (this.level.hazards) {
      this.ctx.fillStyle = '#e53935';
      for (const h of this.level.hazards) {
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

    // 4. Render Swing Anchors & Targeted Anchor Ring
    const bestAnchor = this.physics.findBestAnchor(this.player, this.level.anchors);
    for (const a of this.level.anchors) {
      this.ctx.beginPath();
      this.ctx.arc(a.x, a.y, 14, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffb74d';
      this.ctx.fill();
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = '#f57c00';
      this.ctx.stroke();

      // Highlight closest active target anchor
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

    // 5. Render Rope / Tail
    if (this.player.isSwinging && this.player.ropeAnchor) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.player.ropeAnchor.x, this.player.ropeAnchor.y);
      this.ctx.lineTo(this.player.x, this.player.y);
      this.ctx.lineWidth = 5;
      this.ctx.strokeStyle = '#3e2723';
      this.ctx.stroke();

      // Rope Joint Anchor Point
      this.ctx.beginPath();
      this.ctx.arc(this.player.ropeAnchor.x, this.player.ropeAnchor.y, 6, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ff5722';
      this.ctx.fill();
    }

    // 6. Render Collectible Coins
    if (this.level.coins) {
      for (const c of this.level.coins) {
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

    // 7. Render Goal / Flag
    if (this.level.goal) {
      const g = this.level.goal;
      this.ctx.beginPath();
      this.ctx.arc(g.x, g.y, g.radius || 25, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(0, 230, 118, 0.4)';
      this.ctx.fill();
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = '#00e676';
      this.ctx.stroke();

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 20px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('🏁', g.x, g.y);
    }

    // 8. Render Player Avatar
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
    // Parallax background clouds
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
