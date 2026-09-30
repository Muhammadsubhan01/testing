/**
 * 1010 Color Match - UI Manager & Renderer
 */

class UIManager {
  constructor(game) {
    this.game = game;
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('btn-play').addEventListener('click', () => {
      this.game.startNewGame();
      this.showScreen(null);
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
      this.game.startNewGame();
      this.showScreen(null);
    });

    document.getElementById('btn-menu-pause').addEventListener('click', () => {
      this.showScreen('menu-overlay');
    });

    document.getElementById('btn-restart-result').addEventListener('click', () => {
      this.game.startNewGame();
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
    const overlays = ['menu-overlay', 'pause-overlay', 'result-overlay'];
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

  updateScores(score, highScore) {
    document.getElementById('score-count').textContent = score;
    document.getElementById('best-score').textContent = highScore;
    document.getElementById('best-score-menu').textContent = highScore;
  }

  showGameOverScreen(score, highScore) {
    document.getElementById('final-score').textContent = score;
    document.getElementById('best-dist').textContent = highScore;
    this.showScreen('result-overlay');
  }

  // Render shapes inside tray canvases
  renderTray(trayShapes) {
    for (let i = 0; i < 3; i++) {
      const shapeCanvas = document.getElementById(`shapeCanvas${i}`);
      if (!shapeCanvas) continue;
      const ctx = shapeCanvas.getContext('2d');
      ctx.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);

      const shape = trayShapes[i];
      if (!shape) continue;

      const maxDim = Math.max(shape.rows, shape.cols);
      const blockSize = Math.min(100 / maxDim, 32);

      const offsetX = (shapeCanvas.width - shape.cols * blockSize) / 2;
      const offsetY = (shapeCanvas.height - shape.rows * blockSize) / 2;

      for (let r = 0; r < shape.rows; r++) {
        for (let c = 0; c < shape.cols; c++) {
          const block = shape.matrix[r][c];
          if (block) {
            this.drawBlock(ctx, offsetX + c * blockSize, offsetY + r * blockSize, blockSize, block);
          }
        }
      }
    }
  }

  // Draw 10x10 board, placed blocks, hover preview, drag preview, particles & popups
  renderBoard(engine, particles = [], draggingShape = null, hoverCell = null, dragPos = { x: 0, y: 0 }, scorePopups = []) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const rows = engine.rows;
    const cols = engine.cols;
    const cellSize = this.canvas.width / cols;

    // Draw Grid Background Cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cellSize;
        const y = r * cellSize;

        this.ctx.fillStyle = (r + c) % 2 === 0 ? '#f0f4f8' : '#e1e8ed';
        this.ctx.beginPath();
        this.ctx.roundRect(x + 2, y + 2, cellSize - 4, cellSize - 4, 8);
        this.ctx.fill();
      }
    }

    // Draw Placed Blocks
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const block = engine.grid[r][c];
        if (block) {
          const x = c * cellSize;
          const y = r * cellSize;
          this.drawBlock(this.ctx, x + 2, y + 2, cellSize - 4, block);
        }
      }
    }

    // Draw Hover Preview
    if (draggingShape && hoverCell) {
      const { r: startRow, c: startCol, valid } = hoverCell;
      for (let r = 0; r < draggingShape.rows; r++) {
        for (let c = 0; c < draggingShape.cols; c++) {
          const block = draggingShape.matrix[r][c];
          if (block) {
            const gridR = startRow + r;
            const gridC = startCol + c;
            if (gridR >= 0 && gridR < rows && gridC >= 0 && gridC < cols) {
              const x = gridC * cellSize;
              const y = gridR * cellSize;

              this.ctx.fillStyle = valid ? 'rgba(76, 175, 80, 0.4)' : 'rgba(244, 67, 54, 0.4)';
              this.ctx.strokeStyle = valid ? '#2e7d32' : '#c62828';
              this.ctx.lineWidth = 3;
              this.ctx.beginPath();
              this.ctx.roundRect(x + 3, y + 3, cellSize - 6, cellSize - 6, 8);
              this.ctx.fill();
              this.ctx.stroke();
            }
          }
        }
      }
    }

    // Draw Dragging Shape attached to cursor/pointer
    if (draggingShape && dragPos) {
      const shapeWidth = draggingShape.cols * cellSize;
      const shapeHeight = draggingShape.rows * cellSize;
      const startX = dragPos.x - shapeWidth / 2;
      const startY = dragPos.y - shapeHeight / 2;

      for (let r = 0; r < draggingShape.rows; r++) {
        for (let c = 0; c < draggingShape.cols; c++) {
          const block = draggingShape.matrix[r][c];
          if (block) {
            this.drawBlock(this.ctx, startX + c * cellSize, startY + r * cellSize, cellSize - 4, block, 0.85);
          }
        }
      }
    }

    // Draw Burst Particles
    if (particles) {
      for (const p of particles) {
        this.ctx.save();
        this.ctx.globalAlpha = p.life;
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    // Draw Score Popups
    if (scorePopups) {
      for (const pop of scorePopups) {
        this.ctx.save();
        this.ctx.globalAlpha = pop.life;
        this.ctx.font = 'bold 22px Fredoka One, sans-serif';
        this.ctx.fillStyle = '#ff9800';
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 4;
        this.ctx.textAlign = 'center';
        this.ctx.strokeText(pop.text, pop.x, pop.y);
        this.ctx.fillText(pop.text, pop.x, pop.y);
        this.ctx.restore();
      }
    }
  }

  // Helper method to draw a single rounded colorful block
  drawBlock(ctx, x, y, size, block, alpha = 1.0) {
    ctx.save();
    ctx.globalAlpha = alpha;

    // Main Fill
    ctx.fillStyle = block.fill;
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, 10);
    ctx.fill();

    // Border
    ctx.strokeStyle = block.stroke;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner Highlight Top Curve
    ctx.fillStyle = block.light;
    ctx.beginPath();
    ctx.roundRect(x + 4, y + 4, size - 8, (size - 8) * 0.35, [6, 6, 2, 2]);
    ctx.fill();

    ctx.restore();
  }
}

if (typeof module !== 'undefined') {
  module.exports = UIManager;
} else {
  window.UIManager = UIManager;
}
