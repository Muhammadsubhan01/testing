/**
 * Tail Swing - Physics Engine
 * Handles Player Movement, Pendulum Rope Physics, Gravity, and Collision Detection.
 */

class PhysicsEngine {
  constructor() {
    this.gravity = 0.45;
    this.airResistance = 0.992;
    this.swingBoost = 0.0025; // Force applied when input held while swinging
  }

  // Update player physics state for a time step
  updatePlayer(player, level) {
    if (player.state === 'DEAD' || player.state === 'WIN') return;

    if (player.isSwinging && player.ropeAnchor) {
      // --- SWINGING / PENDULUM PHYSICS ---
      const anchor = player.ropeAnchor;
      const dx = player.x - anchor.x;
      const dy = player.y - anchor.y;
      let angle = Math.atan2(dy, dx); // Angle from anchor to player

      // Pendulum length
      let length = player.ropeLength;

      // Angular acceleration calculation
      // tangential gravity force = -g * cos(angle)
      let angularAccel = (-this.gravity / length) * Math.cos(angle);

      // Apply swing acceleration boost if input active
      if (player.isInputActive) {
        // Boost momentum in swing direction
        const swingDir = player.angularVelocity > 0 ? 1 : -1;
        angularAccel += swingDir * this.swingBoost;
      }

      player.angularVelocity += angularAccel;
      player.angularVelocity *= 0.998; // Pendulum damping
      angle += player.angularVelocity;

      // Calculate new position
      const nextX = anchor.x + length * Math.cos(angle);
      const nextY = anchor.y + length * Math.sin(angle);

      // Linear velocity derived from angular velocity
      player.vx = nextX - player.x;
      player.vy = nextY - player.y;

      player.x = nextX;
      player.y = nextY;
      player.angle = angle;
    } else {
      // --- FREE FALL / AIR PHYSICS ---
      player.vy += this.gravity;
      player.vx *= this.airResistance;
      player.vy *= this.airResistance;

      player.x += player.vx;
      player.y += player.vy;

      // Rotate player according to velocity
      if (Math.abs(player.vx) > 0.5 || Math.abs(player.vy) > 0.5) {
        const targetAngle = Math.atan2(player.vy, player.vx) + Math.PI / 2;
        player.rotation += (targetAngle - player.rotation) * 0.15;
      }
    }

    // --- COLLISION DETECTION ---
    this.checkCollisions(player, level);
  }

  // Check player collisions with platforms, hazards, bouncy pads, coins, and finish flag
  checkCollisions(player, level) {
    const pr = player.radius || 18;

    // 1. Level Bounds & Ground Death Zone
    if (player.y > level.height + 100 || player.x < -100 || player.x > level.width + 100) {
      player.state = 'DEAD';
      return;
    }

    // 2. Platform Collisions (Solid & Bouncy)
    if (level.platforms) {
      for (const plat of level.platforms) {
        if (this.circleBoxCollision(player.x, player.y, pr, plat)) {
          // Resolve collision if solid
          if (plat.type === 'bouncy') {
            // Bounce player upwards / backwards
            player.vy = -Math.abs(player.vy) * 1.3 - 8;
            player.isSwinging = false;
            if (window.audioEngine) window.audioEngine.playBounce();
          } else {
            // Standard platform
            this.resolveBoxCollision(player, plat);
            player.isGrounded = true;
          }
        }
      }
    }

    // 3. Spikes / Hazards
    if (level.hazards) {
      for (const haz of level.hazards) {
        if (this.circleBoxCollision(player.x, player.y, pr - 3, haz)) {
          player.state = 'DEAD';
          if (window.audioEngine) window.audioEngine.playDeath();
          return;
        }
      }
    }

    // 4. Collectible Coins
    if (level.coins) {
      for (const coin of level.coins) {
        if (!coin.collected) {
          const dist = Math.hypot(player.x - coin.x, player.y - coin.y);
          if (dist < pr + (coin.radius || 14)) {
            coin.collected = true;
            player.coinsCollected = (player.coinsCollected || 0) + 1;
            if (window.audioEngine) window.audioEngine.playCoin();
          }
        }
      }
    }

    // 5. Finish Portal / Flag
    if (level.goal) {
      const g = level.goal;
      const dist = Math.hypot(player.x - g.x, player.y - g.y);
      if (dist < pr + (g.radius || 25)) {
        player.state = 'WIN';
        if (window.audioEngine) window.audioEngine.playWin();
      }
    }
  }

  // Circle vs AABB (Axis-Aligned Bounding Box) Collision Test
  circleBoxCollision(cx, cy, radius, box) {
    const closestX = Math.max(box.x, Math.min(cx, box.x + box.w));
    const closestY = Math.max(box.y, Math.min(cy, box.y + box.h));
    const distanceX = cx - closestX;
    const distanceY = cy - closestY;
    const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    return distanceSquared < (radius * radius);
  }

  // Resolve player collision against box platform
  resolveBoxCollision(player, box) {
    const pr = player.radius || 18;
    const closestX = Math.max(box.x, Math.min(player.x, box.x + box.w));
    const closestY = Math.max(box.y, Math.min(player.y, box.y + box.h));

    const dx = player.x - closestX;
    const dy = player.y - closestY;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) return;

    const overlap = pr - dist;
    const nx = dx / dist;
    const ny = dy / dist;

    player.x += nx * overlap;
    player.y += ny * overlap;

    // Dampen velocity along normal
    const dot = player.vx * nx + player.vy * ny;
    if (dot < 0) {
      player.vx -= dot * nx * 1.2;
      player.vy -= dot * ny * 1.2;
    }
  }

  // Find closest swing anchor point in range ahead of player
  findBestAnchor(player, anchors, maxDistance = 320) {
    let bestAnchor = null;
    let minDistance = maxDistance;

    for (const anchor of anchors) {
      const dx = anchor.x - player.x;
      const dy = anchor.y - player.y;
      const dist = Math.hypot(dx, dy);

      // Prioritize anchors above or ahead of player
      if (dist < minDistance && anchor.y < player.y + 100) {
        minDistance = dist;
        bestAnchor = anchor;
      }
    }

    return bestAnchor;
  }
}

if (typeof module !== 'undefined') {
  module.exports = PhysicsEngine;
} else {
  window.PhysicsEngine = PhysicsEngine;
}
