import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        const bar = this.add.rectangle(480, 270, 0, 20, 0x7B2FBE);

        this.load.on('progress', (progress: number) => {
            bar.width = 960 * progress;
        });
        this.load.image('Ammit-jukebox-bg-removed', 'assets/Ammit-jukebox-bg-removed.png');
        this.load.image('Anubis-jukebox-bg-removed', 'assets/Anubis-jukebox-bg-removed.png');
        this.load.image('Apep-jukebox-bg-removed', 'assets/Apep-jukebox-bg-removed.png');
        this.load.image('Backdraft-jukebox-bg-removed', 'assets/Backdraft-jukebox-bg-removed.png');
        this.load.image('Blunted-jukebox-bg-removed', 'assets/Blunted-jukebox-bg-removed.png');
        this.load.image('Bramharakshas-jukebox-bg-removed', 'assets/Bramharakshas-jukebox-bg-removed.png');
        this.load.image('Cyclops-jukebox-bg-removed', 'assets/Cyclops-jukebox-bg-removed.png');
        this.load.image('Empusa-jukebox-bg-removed', 'assets/Empusa-jukebox-bg-removed.png');
        this.load.image('Gaki-jukebox-bg-removed', 'assets/Gaki-jukebox-bg-removed.png');
        this.load.image('Gashadokuro-jukebox-bg-removed', 'assets/Gashadokuro-jukebox-bg-removed.png');
        this.load.image('Hauntin Strikes-jukebox-bg-removed', 'assets/Hauntin Strikes-jukebox-bg-removed.png');
        this.load.image('Khaibut-jukebox-bg-removed', 'assets/Khaibut-jukebox-bg-removed.png');
        this.load.image('Kumbhakarna-jukebox-bg-removed', 'assets/Kumbhakarna-jukebox-bg-removed.png');
        this.load.image('Medusa-jukebox-bg-removed', 'assets/Medusa-jukebox-bg-removed.png');
        this.load.image('Oni-jukebox-bg-removed', 'assets/Oni-jukebox-bg-removed.png');
        this.load.image('Phantom-Fists-jukebox-bg-removed', 'assets/Phantom-Fists-jukebox-bg-removed.png');
        this.load.image('Preta-jukebox-bg-removed', 'assets/Preta-jukebox-bg-removed.png');
        this.load.image('Rakshas-jukebox-bg-removed', 'assets/Rakshas-jukebox-bg-removed.png');
        this.load.image('Revenant-jukebox-bg-removed', 'assets/Revenant-jukebox-bg-removed.png');
        this.load.image('Shade-jukebox-bg-removed', 'assets/Shade-jukebox-bg-removed.png');
        this.load.image('Soulburn-jukebox-bg-removed', 'assets/Soulburn-jukebox-bg-removed.png');
        this.load.image('Specter-jukebox-bg-removed', 'assets/Specter-jukebox-bg-removed.png');
        this.load.image('Tengu-jukebox-bg-removed', 'assets/Tengu-jukebox-bg-removed.png');
        this.load.image('Wraith Blade-jukebox-bg-removed', 'assets/Wraith Blade-jukebox-bg-removed.png');
        this.load.image('Wraith-jukebox-bg-removed', 'assets/Wraith-jukebox-bg-removed.png');
        this.load.image('TitleCard', 'assets/TitleCard.png');

    }

    create() {
        this.scene.start('MenuScene');
    }
}