/**
 * 1010 Color Match - Board & Color Matching Engine
 */

const BLOCK_COLORS = [
  { id: 1, name: 'red', fill: '#ff5252', stroke: '#d32f2f', light: '#ff8a80' },
  { id: 2, name: 'blue', fill: '#448aff', stroke: '#1976d2', light: '#82b1ff' },
  { id: 3, name: 'green', fill: '#66bb6a', stroke: '#388e3c', light: '#a5d6a7' },
  { id: 4, name: 'yellow', fill: '#ffd54f', stroke: '#f57f17', light: '#ffe082' },
  { id: 5, name: 'purple', fill: '#ab47bc', stroke: '#7b1fa2', light: '#ce93d8' },
  { id: 6, name: 'orange', fill: '#ff9800', stroke: '#e65100', light: '#ffcc80' }
];

// Shape templates relative matrix offsets
const SHAPE_TEMPLATES = [
  // Single
  { name: '1x1', matrix: [[1]] },
  // 2x1 & 1x2
  { name: '2x1_H', matrix: [[1, 1]] },
  { name: '2x1_V', matrix: [[1], [1]] },
  // 3x1 & 1x3
  { name: '3x1_H', matrix: [[1, 1, 1]] },
  { name: '3x1_V', matrix: [[1], [1], [1]] },
  // 2x2 Square
  { name: '2x2', matrix: [[1, 1], [1, 1]] },
  // L-Shapes
  { name: 'L_TL', matrix: [[1, 0], [1, 1]] },
  { name: 'L_TR', matrix: [[0, 1], [1, 1]] },
  { name: 'L_BL', matrix: [[1, 1], [1, 0]] },
  { name: 'L_BR', matrix: [[1, 1], [0, 1]] },
  // T-Shapes
  { name: 'T_UP', matrix: [[0, 1, 0], [1, 1, 1]] },
  { name: 'T_DOWN', matrix: [[1, 1, 1], [0, 1, 0]] },
  // Diagonal 2
  { name: 'Diag2_1', matrix: [[1, 0], [0, 1]] },
  { name: 'Diag2_2', matrix: [[0, 1], [1, 0]] }
];

class ColorMatchEngine {
  constructor(rows = 10, cols = 10) {
    this.rows = rows;
    this.cols = cols;
    this.grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  }

  reset() {
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
  }

  // Generate a random piece shape populated with random bright colors per block cell
  generateShape() {
    const template = SHAPE_TEMPLATES[Math.floor(Math.random() * SHAPE_TEMPLATES.length)];
    const shapeMatrix = [];

    for (let r = 0; r < template.matrix.length; r++) {
      const row = [];
      for (let c = 0; c < template.matrix[r].length; c++) {
        if (template.matrix[r][c] === 1) {
          const colorObj = BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
          row.push(colorObj);
        } else {
          row.push(null);
        }
      }
      shapeMatrix.push(row);
    }

    return {
      id: Math.random().toString(36).substring(2, 9),
      name: template.name,
      matrix: shapeMatrix,
      rows: shapeMatrix.length,
      cols: shapeMatrix[0].length
    };
  }

  // Check if shape can be placed at grid position (startRow, startCol)
  canPlaceShape(shape, startRow, startCol) {
    for (let r = 0; r < shape.rows; r++) {
      for (let c = 0; c < shape.cols; c++) {
        if (shape.matrix[r][c]) {
          const gridR = startRow + r;
          const gridC = startCol + c;

          if (gridR < 0 || gridR >= this.rows || gridC < 0 || gridC >= this.cols) {
            return false;
          }
          if (this.grid[gridR][gridC] !== null) {
            return false;
          }
        }
      }
    }
    return true;
  }

  // Place shape onto grid at (startRow, startCol)
  placeShape(shape, startRow, startCol) {
    if (!this.canPlaceShape(shape, startRow, startCol)) return false;

    let blocksPlaced = 0;
    for (let r = 0; r < shape.rows; r++) {
      for (let c = 0; c < shape.cols; c++) {
        const block = shape.matrix[r][c];
        if (block) {
          this.grid[startRow + r][startCol + c] = { ...block };
          blocksPlaced++;
        }
      }
    }
    return blocksPlaced;
  }

  // Check if any shape in tray can fit anywhere on the board
  hasAnyValidMove(trayShapes) {
    for (const shape of trayShapes) {
      if (!shape) continue;
      for (let r = 0; r <= this.rows - shape.rows; r++) {
        for (let c = 0; c <= this.cols - shape.cols; c++) {
          if (this.canPlaceShape(shape, r, c)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Find all connected components of 3 or more same-color adjacent blocks (using BFS / Flood Fill)
  findMatches() {
    const visited = Array.from({ length: this.rows }, () => Array(this.cols).fill(false));
    const matchedCoords = new Set();
    const clusters = [];

    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1] // UP, DOWN, LEFT, RIGHT
    ];

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const block = this.grid[r][c];
        if (block !== null && !visited[r][c]) {
          // Start BFS cluster detection
          const cluster = [];
          const queue = [[r, c]];
          visited[r][c] = true;
          const colorId = block.id;

          while (queue.length > 0) {
            const [currR, currC] = queue.shift();
            cluster.push({ r: currR, c: currC, block });

            for (const [dr, dc] of directions) {
              const nr = currR + dr;
              const nc = currC + dc;

              if (
                nr >= 0 && nr < this.rows &&
                nc >= 0 && nc < this.cols &&
                !visited[nr][nc] &&
                this.grid[nr][nc] !== null &&
                this.grid[nr][nc].id === colorId
              ) {
                visited[nr][nc] = true;
                queue.push([nr, nc]);
              }
            }
          }

          if (cluster.length >= 3) {
            clusters.push(cluster);
            for (const item of cluster) {
              matchedCoords.add(`${item.r},${item.c}`);
            }
          }
        }
      }
    }

    return {
      clusters,
      matchedCoords: Array.from(matchedCoords).map(key => {
        const [r, c] = key.split(',').map(Number);
        return { r, c };
      })
    };
  }

  // Clear matched blocks from grid
  clearMatchedBlocks(matchedCoords) {
    for (const { r, c } of matchedCoords) {
      this.grid[r][c] = null;
    }
  }
}

if (typeof module !== 'undefined') {
  module.exports = { BLOCK_COLORS, SHAPE_TEMPLATES, ColorMatchEngine };
} else {
  window.BLOCK_COLORS = BLOCK_COLORS;
  window.SHAPE_TEMPLATES = SHAPE_TEMPLATES;
  window.ColorMatchEngine = ColorMatchEngine;
}
