/**
 * Tail Swing - Infinite Level Generator
 * Procedurally generates an infinite level with swing anchors, platforms, bouncy pads, hazards, and coins.
 */

class InfiniteLevelGenerator {
  constructor() {
    this.reset();
  }

  reset() {
    this.generatedX = 0;
    this.width = 1000000; // Virtually infinite level width
    this.height = 1000;
    this.anchors = [];
    this.platforms = [];
    this.hazards = [];
    this.coins = [];
    this.nextAnchorId = 1;

    // Initial starting platform for the player
    this.platforms.push({ x: 0, y: 550, w: 350, h: 40, type: 'standard' });
    this.generatedX = 350;

    // Pre-generate chunk up to 3000px
    this.generateAhead(3000);
  }

  generateAhead(targetX) {
    while (this.generatedX < targetX) {
      this.generateChunk();
    }
  }

  generateChunk() {
    const chunkWidth = Math.floor(Math.random() * 200) + 350; // 350 - 550 px
    const startX = this.generatedX;
    const endX = startX + chunkWidth;

    // Anchor point height variation
    const anchorY = Math.floor(Math.random() * 120) + 160; // 160 - 280 px
    const anchorX = startX + chunkWidth * 0.5;

    this.anchors.push({
      id: `a_${this.nextAnchorId++}`,
      x: anchorX,
      y: anchorY
    });

    // Randomize element type for this chunk
    const roll = Math.random();

    if (roll < 0.35) {
      // Platform with coins
      const platW = Math.floor(Math.random() * 120) + 120;
      const platY = Math.floor(Math.random() * 100) + 550;
      this.platforms.push({ x: startX + 50, y: platY, w: platW, h: 40, type: 'standard' });

      // Spawn coins above platform
      for (let i = 0; i < 3; i++) {
        this.coins.push({ x: startX + 70 + i * 35, y: platY - 40, collected: false });
      }
    } else if (roll < 0.65) {
      // Bouncy trampoline spring
      const bounceX = startX + 100;
      const bounceY = Math.floor(Math.random() * 80) + 620;
      this.platforms.push({ x: bounceX, y: bounceY, w: 120, h: 30, type: 'bouncy' });

      // Coins forming an arc above spring
      this.coins.push({ x: bounceX + 30, y: bounceY - 80, collected: false });
      this.coins.push({ x: bounceX + 60, y: bounceY - 110, collected: false });
      this.coins.push({ x: bounceX + 90, y: bounceY - 80, collected: false });
    } else {
      // Spike hazard pit with coins high above
      const hazardW = chunkWidth - 100;
      this.hazards.push({ x: startX + 50, y: 880, w: hazardW, h: 60, type: 'spikes' });

      // Coins along swing arc
      this.coins.push({ x: anchorX - 50, y: anchorY + 160, collected: false });
      this.coins.push({ x: anchorX, y: anchorY + 180, collected: false });
      this.coins.push({ x: anchorX + 50, y: anchorY + 160, collected: false });
    }

    // Always ensure spikes exist in the bottom pit gap
    this.hazards.push({ x: startX, y: 920, w: chunkWidth, h: 60, type: 'spikes' });

    this.generatedX = endX;
  }

  // Cleanup old elements far behind camera to maintain performance
  cleanupBehind(minX) {
    this.anchors = this.anchors.filter(a => a.x >= minX);
    this.platforms = this.platforms.filter(p => p.x + p.w >= minX);
    this.hazards = this.hazards.filter(h => h.x + h.w >= minX);
    this.coins = this.coins.filter(c => c.x >= minX);
  }
}

if (typeof module !== 'undefined') {
  module.exports = InfiniteLevelGenerator;
} else {
  window.InfiniteLevelGenerator = InfiniteLevelGenerator;
}
