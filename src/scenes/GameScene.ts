import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // spawn player, set up arena, start wave 1
  }

  update() {
    // runs every frame — player input, enemy AI, collision
  }
}