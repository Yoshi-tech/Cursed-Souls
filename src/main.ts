import Phaser from 'phaser'
import BootScene from './scenes/BootScene'
import MenuScene from './scenes/MenuScene'
import RollScene from './scenes/RollScene'
import GameScene from './scenes/GameScene'

new Phaser.Game({
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  backgroundColor: '#1a1a2e',
  physics: {
        default: 'arcade', // Ensure this is here!
        arcade: {
            gravity: { x: 0, y: 300 },
            debug: false
        }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, MenuScene, RollScene, GameScene]
})