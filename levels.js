/**
 * Tail Swing - Level Configurations
 * Defines 10 levels with swing anchors, platforms, bouncy pads, hazard spikes, coins, and goals.
 */

const LEVELS = [
  // Level 1: Tutorial / Introduction
  {
    id: 1,
    title: "First Swing",
    width: 2400,
    height: 900,
    playerStart: { x: 150, y: 500, vx: 5, vy: -3 },
    anchors: [
      { id: 'a1', x: 450, y: 250 },
      { id: 'a2', x: 900, y: 220 },
      { id: 'a3', x: 1400, y: 250 },
      { id: 'a4', x: 1850, y: 220 }
    ],
    platforms: [
      { x: 50, y: 600, w: 250, h: 40, type: 'standard' },
      { x: 600, y: 650, w: 200, h: 40, type: 'standard' },
      { x: 1100, y: 620, w: 220, h: 40, type: 'standard' },
      { x: 1600, y: 650, w: 200, h: 40, type: 'standard' },
      { x: 2050, y: 550, w: 300, h: 40, type: 'standard' }
    ],
    hazards: [
      { x: 700, y: 850, w: 1000, h: 50, type: 'spikes' }
    ],
    coins: [
      { x: 450, y: 480 },
      { x: 900, y: 450 },
      { x: 1400, y: 480 },
      { x: 1850, y: 430 }
    ],
    goal: { x: 2200, y: 480, radius: 30 }
  },

  // Level 2: Bouncy Platforms
  {
    id: 2,
    title: "Bouncy Springs",
    width: 2600,
    height: 900,
    playerStart: { x: 150, y: 500, vx: 6, vy: -4 },
    anchors: [
      { id: 'a1', x: 500, y: 220 },
      { id: 'a2', x: 1000, y: 200 },
      { id: 'a3', x: 1550, y: 220 },
      { id: 'a4', x: 2050, y: 200 }
    ],
    platforms: [
      { x: 50, y: 600, w: 220, h: 40, type: 'standard' },
      { x: 450, y: 680, w: 120, h: 30, type: 'bouncy' },
      { x: 950, y: 680, w: 120, h: 30, type: 'bouncy' },
      { x: 1450, y: 650, w: 150, h: 40, type: 'standard' },
      { x: 1950, y: 680, w: 120, h: 30, type: 'bouncy' },
      { x: 2300, y: 550, w: 250, h: 40, type: 'standard' }
    ],
    hazards: [
      { x: 280, y: 820, w: 1900, h: 50, type: 'spikes' }
    ],
    coins: [
      { x: 500, y: 450 },
      { x: 750, y: 350 },
      { x: 1000, y: 430 },
      { x: 1250, y: 350 },
      { x: 1550, y: 450 }
    ],
    goal: { x: 2420, y: 480, radius: 30 }
  },

  // Level 3: Spike Pit Crossing
  {
    id: 3,
    title: "Spike Canyon",
    width: 2800,
    height: 950,
    playerStart: { x: 150, y: 480, vx: 6, vy: -3 },
    anchors: [
      { id: 'a1', x: 500, y: 200 },
      { id: 'a2', x: 950, y: 220 },
      { id: 'a3', x: 1400, y: 180 },
      { id: 'a4', x: 1850, y: 220 },
      { id: 'a5', x: 2300, y: 200 }
    ],
    platforms: [
      { x: 50, y: 580, w: 220, h: 40, type: 'standard' },
      { x: 1300, y: 680, w: 200, h: 40, type: 'standard' },
      { x: 2550, y: 520, w: 220, h: 40, type: 'standard' }
    ],
    hazards: [
      { x: 270, y: 880, w: 2280, h: 60, type: 'spikes' },
      { x: 900, y: 550, w: 100, h: 30, type: 'spikes' },
      { x: 1800, y: 550, w: 100, h: 30, type: 'spikes' }
    ],
    coins: [
      { x: 500, y: 420 },
      { x: 950, y: 400 },
      { x: 1400, y: 380 },
      { x: 1850, y: 400 },
      { x: 2300, y: 420 }
    ],
    goal: { x: 2650, y: 450, radius: 30 }
  },

  // Level 4: High Altitude Leaps
  {
    id: 4,
    title: "Sky Leap",
    width: 3000,
    height: 1000,
    playerStart: { x: 150, y: 450, vx: 7, vy: -4 },
    anchors: [
      { id: 'a1', x: 500, y: 180 },
      { id: 'a2', x: 1000, y: 150 },
      { id: 'a3', x: 1500, y: 180 },
      { id: 'a4', x: 2000, y: 150 },
      { id: 'a5', x: 2500, y: 180 }
    ],
    platforms: [
      { x: 50, y: 550, w: 200, h: 40, type: 'standard' },
      { x: 750, y: 650, w: 120, h: 30, type: 'bouncy' },
      { x: 1750, y: 650, w: 120, h: 30, type: 'bouncy' },
      { x: 2750, y: 500, w: 220, h: 40, type: 'standard' }
    ],
    hazards: [
      { x: 250, y: 920, w: 2500, h: 60, type: 'spikes' }
    ],
    coins: [
      { x: 500, y: 380 },
      { x: 1000, y: 350 },
      { x: 1500, y: 380 },
      { x: 2000, y: 350 },
      { x: 2500, y: 380 }
    ],
    goal: { x: 2850, y: 430, radius: 30 }
  },

  // Level 5: Precision Timing
  {
    id: 5,
    title: "Precision Swing",
    width: 3200,
    height: 950,
    playerStart: { x: 150, y: 500, vx: 6, vy: -3 },
    anchors: [
      { id: 'a1', x: 450, y: 220 },
      { id: 'a2', x: 850, y: 200 },
      { id: 'a3', x: 1250, y: 220 },
      { id: 'a4', x: 1650, y: 200 },
      { id: 'a5', x: 2050, y: 220 },
      { id: 'a6', x: 2550, y: 200 }
    ],
    platforms: [
      { x: 50, y: 600, w: 200, h: 40, type: 'standard' },
      { x: 1050, y: 620, w: 150, h: 30, type: 'standard' },
      { x: 1850, y: 620, w: 150, h: 30, type: 'standard' },
      { x: 2950, y: 520, w: 220, h: 40, type: 'standard' }
    ],
    hazards: [
      { x: 250, y: 880, w: 2700, h: 60, type: 'spikes' },
      { x: 600, y: 450, w: 80, h: 200, type: 'spikes' },
      { x: 1450, y: 450, w: 80, h: 200, type: 'spikes' },
      { x: 2250, y: 450, w: 80, h: 200, type: 'spikes' }
    ],
    coins: [
      { x: 450, y: 420 },
      { x: 850, y: 400 },
      { x: 1250, y: 420 },
      { x: 1650, y: 400 },
      { x: 2050, y: 420 },
      { x: 2550, y: 400 }
    ],
    goal: { x: 3050, y: 450, radius: 30 }
  },

  // Levels 6 - 10 with increasing complexity
  {
    id: 6,
    title: "Double Bounce",
    width: 3200,
    height: 950,
    playerStart: { x: 150, y: 480, vx: 6, vy: -3 },
    anchors: [
      { id: 'a1', x: 500, y: 200 },
      { id: 'a2', x: 1200, y: 180 },
      { id: 'a3', x: 1900, y: 200 },
      { id: 'a4', x: 2600, y: 180 }
    ],
    platforms: [
      { x: 50, y: 580, w: 200, h: 40, type: 'standard' },
      { x: 800, y: 680, w: 120, h: 30, type: 'bouncy' },
      { x: 1500, y: 680, w: 120, h: 30, type: 'bouncy' },
      { x: 2200, y: 680, w: 120, h: 30, type: 'bouncy' },
      { x: 2950, y: 500, w: 220, h: 40, type: 'standard' }
    ],
    hazards: [{ x: 250, y: 880, w: 2700, h: 60, type: 'spikes' }],
    coins: [{ x: 500, y: 400 }, { x: 800, y: 450 }, { x: 1200, y: 380 }, { x: 1500, y: 450 }, { x: 1900, y: 400 }],
    goal: { x: 3050, y: 430, radius: 30 }
  },

  {
    id: 7,
    title: "Minefield Run",
    width: 3400,
    height: 950,
    playerStart: { x: 150, y: 500, vx: 7, vy: -4 },
    anchors: [
      { id: 'a1', x: 450, y: 200 },
      { id: 'a2', x: 900, y: 180 },
      { id: 'a3', x: 1350, y: 200 },
      { id: 'a4', x: 1800, y: 180 },
      { id: 'a5', x: 2250, y: 200 },
      { id: 'a6', x: 2700, y: 180 }
    ],
    platforms: [
      { x: 50, y: 600, w: 200, h: 40, type: 'standard' },
      { x: 1100, y: 650, w: 150, h: 40, type: 'standard' },
      { x: 2000, y: 650, w: 150, h: 40, type: 'standard' },
      { x: 3150, y: 520, w: 220, h: 40, type: 'standard' }
    ],
    hazards: [
      { x: 250, y: 880, w: 2900, h: 60, type: 'spikes' },
      { x: 650, y: 300, w: 60, h: 350, type: 'spikes' },
      { x: 1550, y: 300, w: 60, h: 350, type: 'spikes' },
      { x: 2450, y: 300, w: 60, h: 350, type: 'spikes' }
    ],
    coins: [{ x: 450, y: 400 }, { x: 900, y: 380 }, { x: 1350, y: 400 }, { x: 1800, y: 380 }, { x: 2250, y: 400 }],
    goal: { x: 3250, y: 450, radius: 30 }
  },

  {
    id: 8,
    title: "Ascension",
    width: 3600,
    height: 1000,
    playerStart: { x: 150, y: 600, vx: 7, vy: -4 },
    anchors: [
      { id: 'a1', x: 500, y: 300 },
      { id: 'a2', x: 1000, y: 250 },
      { id: 'a3', x: 1500, y: 200 },
      { id: 'a4', x: 2000, y: 180 },
      { id: 'a5', x: 2500, y: 150 },
      { id: 'a6', x: 3000, y: 120 }
    ],
    platforms: [
      { x: 50, y: 700, w: 200, h: 40, type: 'standard' },
      { x: 3350, y: 350, w: 220, h: 40, type: 'standard' }
    ],
    hazards: [{ x: 250, y: 920, w: 3100, h: 60, type: 'spikes' }],
    coins: [{ x: 500, y: 500 }, { x: 1000, y: 450 }, { x: 1500, y: 400 }, { x: 2000, y: 350 }, { x: 2500, y: 300 }],
    goal: { x: 3450, y: 280, radius: 30 }
  },

  {
    id: 9,
    title: "The Gauntlet",
    width: 3800,
    height: 1000,
    playerStart: { x: 150, y: 500, vx: 7, vy: -3 },
    anchors: [
      { id: 'a1', x: 450, y: 200 },
      { id: 'a2', x: 850, y: 180 },
      { id: 'a3', x: 1250, y: 200 },
      { id: 'a4', x: 1650, y: 180 },
      { id: 'a5', x: 2050, y: 200 },
      { id: 'a6', x: 2450, y: 180 },
      { id: 'a7', x: 2850, y: 200 },
      { id: 'a8', x: 3250, y: 180 }
    ],
    platforms: [
      { x: 50, y: 600, w: 200, h: 40, type: 'standard' },
      { x: 1450, y: 680, w: 120, h: 30, type: 'bouncy' },
      { x: 2650, y: 680, w: 120, h: 30, type: 'bouncy' },
      { x: 3550, y: 500, w: 220, h: 40, type: 'standard' }
    ],
    hazards: [
      { x: 250, y: 920, w: 3300, h: 60, type: 'spikes' },
      { x: 850, y: 450, w: 80, h: 300, type: 'spikes' },
      { x: 2050, y: 450, w: 80, h: 300, type: 'spikes' }
    ],
    coins: [{ x: 450, y: 380 }, { x: 1250, y: 380 }, { x: 1650, y: 360 }, { x: 2450, y: 360 }, { x: 3250, y: 360 }],
    goal: { x: 3650, y: 430, radius: 30 }
  },

  {
    id: 10,
    title: "Master Swing",
    width: 4000,
    height: 1000,
    playerStart: { x: 150, y: 500, vx: 8, vy: -4 },
    anchors: [
      { id: 'a1', x: 500, y: 180 },
      { id: 'a2', x: 1000, y: 150 },
      { id: 'a3', x: 1500, y: 180 },
      { id: 'a4', x: 2000, y: 150 },
      { id: 'a5', x: 2500, y: 180 },
      { id: 'a6', x: 3000, y: 150 },
      { id: 'a7', x: 3500, y: 180 }
    ],
    platforms: [
      { x: 50, y: 600, w: 200, h: 40, type: 'standard' },
      { x: 1250, y: 700, w: 100, h: 30, type: 'bouncy' },
      { x: 2250, y: 700, w: 100, h: 30, type: 'bouncy' },
      { x: 3250, y: 700, w: 100, h: 30, type: 'bouncy' },
      { x: 3750, y: 500, w: 220, h: 40, type: 'standard' }
    ],
    hazards: [
      { x: 250, y: 920, w: 3500, h: 60, type: 'spikes' }
    ],
    coins: [
      { x: 500, y: 350 }, { x: 1000, y: 320 }, { x: 1500, y: 350 },
      { x: 2000, y: 320 }, { x: 2500, y: 350 }, { x: 3000, y: 320 }, { x: 3500, y: 350 }
    ],
    goal: { x: 3850, y: 430, radius: 30 }
  }
];

if (typeof module !== 'undefined') {
  module.exports = LEVELS;
} else {
  window.LEVELS = LEVELS;
}
