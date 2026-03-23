import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // load all sprites, audio, tilemaps here
    // this.load.image('gaki', 'assets/sprites/gaki.png');
  }

  create() {
    this.scene.start('MenuScene');
  }
}