"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = (name) =>
  fs.readFileSync(path.join(__dirname, "../js", name), "utf8");

const Keyboard = new Function(
  `${read("models/Keyboard.class.js")}\nreturn Keyboard;`,
)();
const Game = new Function(
  "LoadingScene",
  `${read("models/Game.class.js")}\nreturn Game;`,
)(class LoadingScene {
  start() {}
});

function gameWithKeyboard() {
  const game = Object.create(Game.prototype);
  game.state = "playing";
  game.world = { keyboard: new Keyboard() };
  return game;
}

function pointerHandlers() {
  const listeners = {};
  const windowMock = {
    game: null,
    addEventListener(type, handler) {
      listeners[type] = handler;
    },
  };
  const documentMock = { querySelectorAll: () => [] };
  const handlers = new Function(
    "window",
    "document",
    `${read("eventListeners.js")}\nreturn { bindTouchButton };`,
  )(windowMock, documentMock);
  return { ...handlers, windowMock };
}

test("keyboard keydown and keyup map all gameplay controls", () => {
  const game = gameWithKeyboard();
  for (const event of [
    { key: "ArrowLeft", control: "left" },
    { key: "ArrowRight", control: "right" },
    { key: "ArrowUp", control: "jump" },
    { code: "Space", control: "throw" },
  ]) {
    const keydown = { ...event, preventDefault() {} };
    game.handlePlayingKeyDown(keydown);
    assert.equal(game.world.keyboard[event.control], true);
    game.updateGameplayKey(event, false);
    assert.equal(game.world.keyboard[event.control], false);
  }
});

test("space keydown still prevents the browser default action", () => {
  const game = gameWithKeyboard();
  let prevented = false;
  game.handlePlayingKeyDown({
    code: "Space",
    preventDefault() {
      prevented = true;
    },
  });
  assert.equal(prevented, true);
});

test("two and three different pointers remain active independently", () => {
  const keyboard = new Keyboard();
  keyboard.pressPointer(1, "left");
  keyboard.pressPointer(2, "jump");
  keyboard.pressPointer(3, "throw");
  assert.deepEqual(
    [keyboard.left, keyboard.jump, keyboard.throw],
    [true, true, true],
  );
  keyboard.releasePointer(2);
  assert.deepEqual(
    [keyboard.left, keyboard.jump, keyboard.throw],
    [true, false, true],
  );
});

test("multiple pointers on one control do not deactivate each other", () => {
  const keyboard = new Keyboard();
  keyboard.pressPointer(1, "right");
  keyboard.pressPointer(2, "right");
  keyboard.releasePointer(1);
  assert.equal(keyboard.right, true);
  keyboard.releasePointer(2);
  assert.equal(keyboard.right, false);
});

test("keyboard and touch ownership coexist on one control", () => {
  const keyboard = new Keyboard();
  keyboard.setKeyboardControl("left", true);
  keyboard.pressPointer(1, "left");
  keyboard.setKeyboardControl("left", false);
  assert.equal(keyboard.left, true);
  keyboard.releasePointer(1);
  assert.equal(keyboard.left, false);
});

test("releasing touch does not revive a consumed throw input", () => {
  const keyboard = new Keyboard();
  keyboard.setKeyboardControl("throw", true);
  keyboard.pressPointer(1, "throw");
  keyboard.throw = false;
  keyboard.releasePointer(1);
  assert.equal(keyboard.throw, false);
});

test("pointercancel and lostpointercapture release only their pointer", () => {
  const { bindTouchButton, windowMock } = pointerHandlers();
  const keyboard = new Keyboard();
  windowMock.game = { state: "playing", world: { keyboard } };
  const button = {
    dataset: { control: "left" },
    handlers: {},
    addEventListener(type, handler) {
      this.handlers[type] = handler;
    },
    setPointerCapture() {},
  };
  bindTouchButton(button);
  button.handlers.pointerdown({
    pointerId: 1,
    preventDefault() {},
  });
  button.handlers.pointerdown({
    pointerId: 2,
    preventDefault() {},
  });
  button.handlers.pointercancel({ pointerId: 1, preventDefault() {} });
  assert.equal(keyboard.left, true);
  button.handlers.lostpointercapture({ pointerId: 2, preventDefault() {} });
  assert.equal(keyboard.left, false);
});

test("reset returns a mixed input state to neutral", () => {
  const keyboard = new Keyboard();
  keyboard.setKeyboardControl("right", true);
  keyboard.pressPointer(1, "jump");
  keyboard.reset();
  assert.deepEqual(
    [keyboard.left, keyboard.right, keyboard.jump, keyboard.throw],
    [false, false, false, false],
  );
  assert.equal(keyboard.pointerControls.size, 0);
});

test("loading transition clears active input ownership", () => {
  const game = gameWithKeyboard();
  game.state = "intro";
  game.world.keyboard.pressPointer(1, "left");
  game.setStoryOverlayVisible = () => {};
  game.syncStoryButton = () => {};
  game.intro = { stop() {} };
  game.startLoadingPhase();
  assert.equal(game.world.keyboard.left, false);
});

test("victory text speed controls remain lifecycle-bound", () => {
  const game = gameWithKeyboard();
  const changes = [];
  game.state = "gameWon";
  game.victoryScene = {
    endingText: { changeSpeed: (amount) => changes.push(amount) },
  };
  game.adjustVictoryTextSpeed("left");
  game.adjustVictoryTextSpeed("right");
  game.state = "playing";
  game.adjustVictoryTextSpeed("right");
  assert.deepEqual(changes, [-20, 20]);
});
