import Phaser from 'phaser'
import BootScene from './scenes/BootScene.ts'
import MenuScene from './scenes/MenuScene.ts'
import GameScene from './scenes/GameScene.ts'


new Phaser.Game({
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  scene: [BootScene, MenuScene, GameScene]
})