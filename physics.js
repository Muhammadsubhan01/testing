/**
 * Tail Swing - Physics Engine
 * Handles Player Movement, Pendulum Rope Physics, Gravity, Auto-Hooking, and Collisions.
 */

class PhysicsEngine {
  constructor() {
    this.gravity = 0.42;
    this.airResistance = 0.994;
    this.swingBoost = 0.0035; // Acceleration when input held
  }

  // Main update step
  updatePlayer(player, level) {
    if (player.state === 'DEAD') return;

    // --- CONTINUOUS AUTO-HOOK LOGIC WHILE INPUT IS HELD ---
    if (player.isInputActive && !player.isSwinging) {
      const bestAnchor = this.findBestAnchor(player, level.anchors);
      if (bestAnchor) {
        this.attachRope(player, bestAnchor);
      }
    }

    if (player.isSwinging && player.ropeAnchor) {
      // --- SWINGING / PENDULUM PHYSICS ---
      const anchor = player.ropeAnchor;
      const dx = player.x - anchor.x;
      const dy = player.y - anchor.y;
      let angle = Math.atan2(dy, dx);
      let length = player.ropeLength;

      // Angular acceleration: tangential gravity
      let angularAccel = (-this.gravity / length) * Math.cos(angle);

      // Forward swing momentum boost
      if (player.isInputActive) {
        angularAccel += 0.002;
      }

      player.angularVelocity += angularAccel;
      player.angularVelocity *= 0.9985; // Air damping
      angle += player.angularVelocity;

      const nextX = anchor.x + length * Math.cos(angle);
      const nextY = anchor.y + length * Math.sin(angle);

      player.vx = nextX - player.x;
      player.vy = nextY - player.y;

      player.x = nextX;
      player.y = nextY;
      player.angle = angle;
      player.rotation = angle + Math.PI / 2;
    } else {
      // --- FREE FALL / AIR PHYSICS ---
      player.vy += this.gravity;
      player.vx *= this.airResistance;
      player.vy *= this.airResistance;

      player.x += player.vx;
      player.y += player.vy;

      if (Math.abs(player.vx) > 0.5 || Math.abs(player.vy) > 0.5) {
        const targetAngle = Math.atan2(player.vy, player.vx) + Math.PI / 2;
        player.rotation += (targetAngle - player.rotation) * 0.15;
      }
    }

    // --- COLLISION DETECTION ---
    this.checkCollisions(player, level);
  }

  attachRope(player, anchor) {
    player.isSwinging = true;
    player.ropeAnchor = anchor;

    const dx = player.x - anchor.x;
    const dy = player.y - anchor.y;
    player.ropeLength = Math.hypot(dx, dy);

    const angle = Math.atan2(dy, dx);
    const tangentX = -Math.sin(angle);
    const tangentY = Math.cos(angle);
    const dot = player.vx * tangentX + player.vy * tangentY;

    player.angularVelocity = dot / player.ropeLength;
    player.angle = angle;
    player.state = 'SWINGING';

    if (window.audioEngine) window.audioEngine.playSwing();
  }

  detachRope(player) {
    if (!player.isSwinging) return;

    player.isSwinging = false;
    player.ropeAnchor = null;
    player.state = 'FALLING';

    // Release momentum boost forwards
    player.vx = Math.max(player.vx * 1.3, 4);
    player.vy *= 1.1;
  }

  checkCollisions(player, level) {
    const pr = player.radius || 18;

    // 1. Pit Death Zone
    if (player.y > level.height + 150) {
      player.state = 'DEAD';
      if (window.audioEngine) window.audioEngine.playDeath();
      return;
    }

    // 2. Platforms & Bouncy Springs
    if (level.platforms) {
      for (const plat of level.platforms) {
        if (this.circleBoxCollision(player.x, player.y, pr, plat)) {
          if (plat.type === 'bouncy') {
            player.vy = -Math.abs(player.vy) * 1.35 - 9;
            player.vx = Math.max(player.vx * 1.2, 6);
            if (player.isSwinging) this.detachRope(player);
            if (window.audioEngine) window.audioEngine.playBounce();
          } else {
            this.resolveBoxCollision(player, plat);
            player.isGrounded = true;
          }
        }
      }
    }

    // 3. Spikes / Hazards
    if (level.hazards) {
      for (const haz of level.hazards) {
        if (this.circleBoxCollision(player.x, player.y, pr - 4, haz)) {
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
          if (dist < pr + 16) {
            coin.collected = true;
            player.coinsCollected = (player.coinsCollected || 0) + 1;
            if (window.audioEngine) window.audioEngine.playCoin();
          }
        }
      }
    }
  }

  circleBoxCollision(cx, cy, radius, box) {
    const closestX = Math.max(box.x, Math.min(cx, box.x + box.w));
    const closestY = Math.max(box.y, Math.min(cy, box.y + box.h));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) < (radius * radius);
  }

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

    const dot = player.vx * nx + player.vy * ny;
    if (dot < 0) {
      player.vx -= dot * nx * 1.2;
      player.vy -= dot * ny * 1.2;
    }
  }

  // Find best anchor point ahead of player
  findBestAnchor(player, anchors, maxDistance = 380) {
    let bestAnchor = null;
    let minDistance = maxDistance;

    for (const anchor of anchors) {
      const dx = anchor.x - player.x;
      const dy = anchor.y - player.y;
      const dist = Math.hypot(dx, dy);

      // Must be ahead of player or close by
      if (dist < minDistance && dx > -50 && anchor.y < player.y + 120) {
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
