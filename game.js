/**
 * 1010 Color Match - Main Game Controller & Interaction Handler
 */

class Game {
  constructor() {
    this.engine = new ColorMatchEngine(10, 10);
    this.ui = new UIManager(this);

    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('1010_colormatch_highscore')) || 0;

    this.trayShapes = [null, null, null];
    this.draggingShapeIndex = -1;
    this.dragOffset = { x: 0, y: 0 };
    this.dragPos = { x: 0, y: 0 };
    this.hoverCell = null;

    this.isRunning = false;
    this.isPaused = false;
    this.comboCount = 0;

    this.particles = [];
    this.scorePopups = [];

    this.initTray();
    this.setupEvents();
    this.ui.updateScores(this.score, this.highScore);
  }

  initTray() {
    for (let i = 0; i < 3; i++) {
      if (!this.trayShapes[i]) {
        this.trayShapes[i] = this.engine.generateShape();
      }
    }
  }

  refillTrayIfNeeded() {
    const allEmpty = this.trayShapes.every(shape => shape === null);
    if (allEmpty) {
      for (let i = 0; i < 3; i++) {
        this.trayShapes[i] = this.engine.generateShape();
      }
    }
  }

  startNewGame() {
    this.engine.reset();
    this.score = 0;
    this.comboCount = 0;
    this.particles = [];
    this.scorePopups = [];
    this.trayShapes = [null, null, null];
    this.initTray();

    this.isRunning = true;
    this.isPaused = false;

    this.ui.updateScores(this.score, this.highScore);
    this.ui.renderTray(this.trayShapes);
    this.ui.renderBoard(this.engine, null, this.draggingShapeIndex >= 0 ? this.trayShapes[this.draggingShapeIndex] : null, this.hoverCell);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  setupEvents() {
    const canvas = document.getElementById('gameCanvas');

    const getCanvasPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
      };
    };

    const handlePointerDownTray = (index, e) => {
      if (!this.isRunning || this.isPaused || !this.trayShapes[index]) return;
      this.draggingShapeIndex = index;

      const pos = getCanvasPos(e);
      this.dragPos = pos;
      if (window.audioEngine) window.audioEngine.playPickup();
    };

    for (let i = 0; i < 3; i++) {
      const shapeCanvas = document.getElementById(`shapeCanvas${i}`);
      shapeCanvas.addEventListener('mousedown', (e) => handlePointerDownTray(i, e));
      shapeCanvas.addEventListener('touchstart', (e) => handlePointerDownTray(i, e), { passive: true });
    }

    const handlePointerMove = (e) => {
      if (this.draggingShapeIndex < 0) return;

      const pos = getCanvasPos(e);
      this.dragPos = pos;

      // Calculate grid cell hover
      const shape = this.trayShapes[this.draggingShapeIndex];
      const cellSize = canvas.width / 10;

      // Center offset alignment for shape drag preview
      const targetCol = Math.round((pos.x - (shape.cols * cellSize) / 2) / cellSize);
      const targetRow = Math.round((pos.y - (shape.rows * cellSize) / 2) / cellSize);

      if (targetRow >= 0 && targetRow <= 10 - shape.rows && targetCol >= 0 && targetCol <= 10 - shape.cols) {
        this.hoverCell = { r: targetRow, c: targetCol, valid: this.engine.canPlaceShape(shape, targetRow, targetCol) };
      } else {
        this.hoverCell = null;
      }
    };

    const handlePointerUp = (e) => {
      if (this.draggingShapeIndex < 0) return;

      const shape = this.trayShapes[this.draggingShapeIndex];
      if (this.hoverCell && this.hoverCell.valid) {
        const blocksPlaced = this.engine.placeShape(shape, this.hoverCell.r, this.hoverCell.c);
        if (blocksPlaced > 0) {
          this.score += blocksPlaced * 10;
          this.trayShapes[this.draggingShapeIndex] = null;
          if (window.audioEngine) window.audioEngine.playPlace();

          this.checkAndProcessMatches();
          this.refillTrayIfNeeded();

          // Check for Game Over
          if (!this.engine.hasAnyValidMove(this.trayShapes)) {
            setTimeout(() => this.gameOver(), 500);
          }
        }
      }

      this.draggingShapeIndex = -1;
      this.hoverCell = null;
      this.ui.renderTray(this.trayShapes);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp, { passive: true });

    // Game Animation Loop
    const loop = () => {
      this.updateAnimations();
      if (this.isRunning) {
        this.ui.renderBoard(
          this.engine,
          this.particles,
          this.draggingShapeIndex >= 0 ? this.trayShapes[this.draggingShapeIndex] : null,
          this.hoverCell,
          this.dragPos,
          this.scorePopups
        );
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  checkAndProcessMatches() {
    const { clusters, matchedCoords } = this.engine.findMatches();

    if (matchedCoords.length > 0) {
      this.comboCount++;
      const basePoints = matchedCoords.length * 20;
      const comboBonus = this.comboCount > 1 ? (this.comboCount - 1) * 50 : 0;
      const pointsEarned = basePoints + comboBonus;

      this.score += pointsEarned;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('1010_colormatch_highscore', this.highScore);
      }

      this.ui.updateScores(this.score, this.highScore);

      // Create burst particles for matched blocks
      const cellSize = 500 / 10;
      for (const { r, c } of matchedCoords) {
        const block = this.engine.grid[r][c];
        const cx = c * cellSize + cellSize / 2;
        const cy = r * cellSize + cellSize / 2;

        for (let p = 0; p < 8; p++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 4 + 2;
          this.particles.push({
            x: cx,
            y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 5 + 3,
            color: block ? block.fill : '#ffd54f',
            life: 1.0
          });
        }
      }

      // Add floating score text popup
      const firstCoord = matchedCoords[0];
      this.scorePopups.push({
        text: this.comboCount > 1 ? `COMBO x${this.comboCount}! +${pointsEarned}` : `+${pointsEarned}`,
        x: firstCoord.c * cellSize + cellSize,
        y: firstCoord.r * cellSize + cellSize / 2,
        life: 1.0
      });

      if (window.audioEngine) {
        if (this.comboCount > 1) {
          window.audioEngine.playCombo(this.comboCount);
        } else {
          window.audioEngine.playMatch();
        }
      }

      this.engine.clearMatchedBlocks(matchedCoords);
    } else {
      this.comboCount = 0;
    }
  }

  updateAnimations() {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.03;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update score popups
    for (let i = this.scorePopups.length - 1; i >= 0; i--) {
      const pop = this.scorePopups[i];
      pop.y -= 1;
      pop.life -= 0.02;
      if (pop.life <= 0) {
        this.scorePopups.splice(i, 1);
      }
    }
  }

  gameOver() {
    this.isRunning = false;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('1010_colormatch_highscore', this.highScore);
    }
    if (window.audioEngine) window.audioEngine.playGameOver();
    this.ui.showGameOverScreen(this.score, this.highScore);
  }
}

window.addEventListener('load', () => {
  window.game = new Game();
});
