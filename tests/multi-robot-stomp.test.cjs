"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const readModel = (name) =>
  fs.readFileSync(path.join(__dirname, "../js/models", name), "utf8");

// Load actual game classes without a browser. Prototypes are used below to
// avoid starting animation timers or loading sprite/audio assets.
const Robot = class Robot {};
const { Character, MiniRobot, MovableObject } = new Function(
  "DrawableObject",
  "Robot",
  "createAnimationImages",
  [
    readModel("MovableObject.class.js"),
    readModel("MiniRobot.class.js"),
    readModel("Character.class.js"),
    "return { Character, MiniRobot, MovableObject };",
  ].join("\n"),
)(class DrawableObject {}, Robot, () => []);

function robot(x = 230, y = 360) {
  const enemy = Object.create(MiniRobot.prototype);
  Object.assign(enemy, {
    x, y, width: 120, height: 120,
    leftOffset: 40, rightOffset: 40, topOffset: 35, bottomOffset: 0,
    nativeDirection: 1, direction: 1,
    speedY: 0, acceleration: 0.8,
    isKnockedOut: false, knockOutCount: 0,
    knockOut() {
      this.isKnockedOut = true;
      this.knockOutCount++;
    },
  });
  return enemy;
}

function character(enemies, speedY = 8) {
  const player = Object.create(Character.prototype);
  Object.assign(player, {
    x: 200, y: 271, width: 120, height: 180,
    leftOffset: 12, rightOffset: 36, topOffset: 10, bottomOffset: 55,
    nativeDirection: -1, direction: 1,
    speedY, acceleration: 0.8, lastHit: 0, damage: 0,
    takeDamage(amount) { this.damage += amount; },
    world: { level: { enemies } },
  });
  return player;
}

test("one mini-robot: normal stomp and one rebound", () => {
  const a = robot();
  const player = character([a]);
  player.handleCollision();
  assert.equal(a.knockOutCount, 1);
  assert.equal(player.speedY, -12);
  assert.equal(player.damage, 0);
});

for (const reversed of [false, true]) {
  test(`two overlapping robots: both stomped, regardless of order (${reversed})`, () => {
    const a = robot(230, 360);
    const b = robot(230, 350); // B is already overlapped, but not a valid solo stomp.
    const player = character(reversed ? [b, a] : [a, b]);
    player.handleCollision();
    assert.equal(a.knockOutCount, 1);
    assert.equal(b.knockOutCount, 1);
    assert.equal(player.speedY, -12);
    assert.equal(player.damage, 0);
  });
}

test("connected robot joins the group without direct player overlap", () => {
  const a = robot(230, 360);
  const b = robot(260, 360);
  const player = character([a, b]);
  player.handleCollision();
  assert.equal(a.knockOutCount, 1);
  assert.equal(b.knockOutCount, 1);
  assert.equal(player.damage, 0);
});

test("side collision with a mini-robot still causes damage", () => {
  const a = robot();
  const player = character([a], 0);
  player.handleCollision();
  assert.equal(a.knockOutCount, 0);
  assert.equal(player.damage, 10);
});

test("separate robot side contact is not protected by another stomp", () => {
  const a = robot(180, 360);
  const b = robot(225, 350); // Both touch player, but their hitboxes do not overlap.
  const player = character([a, b]);
  player.handleCollision();
  assert.equal(a.knockOutCount, 1);
  assert.equal(b.knockOutCount, 0);
  assert.equal(player.damage, 10);
});

test("already knocked-out mini-robots are harmless", () => {
  const a = robot();
  a.isKnockedOut = true;
  const player = character([a], 0);
  player.handleCollision();
  assert.equal(player.damage, 0);
});

test("other enemy types can still damage during a mini-robot stomp", () => {
  const a = robot();
  const gnome = Object.create(MovableObject.prototype);
  Object.assign(gnome, {
    x: 230, y: 360, width: 120, height: 120,
    leftOffset: 40, rightOffset: 40, topOffset: 35, bottomOffset: 0,
    nativeDirection: 1, direction: 1,
  });
  const player = character([a, gnome]);
  player.handleCollision();
  assert.equal(a.knockOutCount, 1);
  assert.equal(player.damage, 10);
});

test("existing contact-damage cooldown is preserved", () => {
  const player = character([robot()], 0);
  player.lastHit = Date.now() - 500;
  player.handleCollision();
  assert.equal(player.damage, 0);
});

test("non-activated boss remains excluded from collision candidates", () => {
  const boss = new Robot();
  boss.isActivated = false;
  boss.getCollisionBounds = () => ({ left: 240, right: 280, top: 385, bottom: 470 });
  const player = character([boss], 0);
  player.handleCollision();
  assert.equal(player.damage, 0);

  boss.isActivated = true;
  player.handleCollision();
  assert.equal(player.damage, 10);
});
