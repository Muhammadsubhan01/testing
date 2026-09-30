/**
 * Unit Tests for 1010 Color Match Engine
 */

const assert = require('assert');
const { BLOCK_COLORS, ColorMatchEngine } = require('./levels.js');

console.log('Running 1010 Color Match Engine Tests...');

// 1. Grid Initialization Test
{
  const engine = new ColorMatchEngine(10, 10);
  assert.strictEqual(engine.rows, 10);
  assert.strictEqual(engine.cols, 10);
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      assert.strictEqual(engine.grid[r][c], null);
    }
  }
  console.log('✔ Grid Initialization Test Passed');
}

// 2. Shape Generation Test
{
  const engine = new ColorMatchEngine(10, 10);
  const shape = engine.generateShape();
  assert.ok(shape.id);
  assert.ok(shape.rows > 0);
  assert.ok(shape.cols > 0);
  assert.strictEqual(shape.matrix.length, shape.rows);
  assert.strictEqual(shape.matrix[0].length, shape.cols);
  console.log('✔ Shape Generation Test Passed');
}

// 3. Placement Validation Test
{
  const engine = new ColorMatchEngine(10, 10);
  const testShape = {
    rows: 2,
    cols: 2,
    matrix: [
      [BLOCK_COLORS[0], BLOCK_COLORS[0]],
      [BLOCK_COLORS[0], BLOCK_COLORS[0]]
    ]
  };

  // Valid placement
  assert.strictEqual(engine.canPlaceShape(testShape, 0, 0), true);
  assert.strictEqual(engine.canPlaceShape(testShape, 8, 8), true);

  // Out of bounds
  assert.strictEqual(engine.canPlaceShape(testShape, 9, 8), false);
  assert.strictEqual(engine.canPlaceShape(testShape, 8, 9), false);
  assert.strictEqual(engine.canPlaceShape(testShape, -1, 0), false);

  // Overlap with existing block
  engine.placeShape(testShape, 0, 0);
  assert.strictEqual(engine.canPlaceShape(testShape, 0, 0), false);
  assert.strictEqual(engine.canPlaceShape(testShape, 1, 1), false);
  assert.strictEqual(engine.canPlaceShape(testShape, 2, 2), true);
  console.log('✔ Placement Validation Test Passed');
}

// 4. Color Matching (3+ Connected Blocks) Test
{
  const engine = new ColorMatchEngine(10, 10);
  const redColor = BLOCK_COLORS[0]; // Red
  const blueColor = BLOCK_COLORS[1]; // Blue

  // Place 3 horizontal red blocks
  engine.grid[3][3] = { ...redColor };
  engine.grid[3][4] = { ...redColor };
  engine.grid[3][5] = { ...redColor };

  // Place 2 vertical blue blocks (should not match)
  engine.grid[5][5] = { ...blueColor };
  engine.grid[6][5] = { ...blueColor };

  const { clusters, matchedCoords } = engine.findMatches();
  assert.strictEqual(clusters.length, 1);
  assert.strictEqual(matchedCoords.length, 3);

  // Verify matched coordinates
  const coordKeys = matchedCoords.map(c => `${c.r},${c.c}`);
  assert.ok(coordKeys.includes('3,3'));
  assert.ok(coordKeys.includes('3,4'));
  assert.ok(coordKeys.includes('3,5'));

  // Clear matched blocks
  engine.clearMatchedBlocks(matchedCoords);
  assert.strictEqual(engine.grid[3][3], null);
  assert.strictEqual(engine.grid[3][4], null);
  assert.strictEqual(engine.grid[3][5], null);
  assert.notStrictEqual(engine.grid[5][5], null);
  assert.notStrictEqual(engine.grid[6][5], null);

  console.log('✔ Color Matching & Clearing Test Passed');
}

// 5. Valid Moves Check (Game Over Detection)
{
  const engine = new ColorMatchEngine(2, 2);
  const singleShape = {
    rows: 1,
    cols: 1,
    matrix: [[BLOCK_COLORS[0]]]
  };

  const bigShape = {
    rows: 3,
    cols: 3,
    matrix: [
      [BLOCK_COLORS[0], BLOCK_COLORS[0], BLOCK_COLORS[0]],
      [BLOCK_COLORS[0], BLOCK_COLORS[0], BLOCK_COLORS[0]],
      [BLOCK_COLORS[0], BLOCK_COLORS[0], BLOCK_COLORS[0]]
    ]
  };

  assert.strictEqual(engine.hasAnyValidMove([singleShape]), true);
  assert.strictEqual(engine.hasAnyValidMove([bigShape]), false);

  // Fill 2x2 board
  engine.grid = [
    [{ ...BLOCK_COLORS[0] }, { ...BLOCK_COLORS[1] }],
    [{ ...BLOCK_COLORS[2] }, { ...BLOCK_COLORS[3] }]
  ];
  assert.strictEqual(engine.hasAnyValidMove([singleShape]), false);

  console.log('✔ Valid Moves Check Test Passed');
}

console.log('ALL TESTS PASSED SUCCESSFULLY! 🎉');
