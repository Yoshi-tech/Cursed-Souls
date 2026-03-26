import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
    //     this.anims.create({
    //     key: 'titleCardIdle',
    //     frames: this.anims.generateFrameNumbers('TitleCard', { start: 0, end: 35 }),
    //     frameRate: 10,
    //     repeat: -1
    // });
    //     // title card
    //     const img = this.add.sprite(480, 270, 'TitleCard');
    //     const scale = Math.min(960 / img.width, 540 / img.height);
    //     img.setScale(scale).setOrigin(0.5, 0.5);

    //     img.play('titleCardIdle');
    this.add.image(480, 270, 'TitleCardStatic');

        // // bob tween
        // this.tweens.add({
        //     targets: img,
        //     y: 210,
        //     duration: 1500,
        //     yoyo: true,
        //     repeat: -1,
        //     ease: 'Sine.easeInOut'
        // });

        // flame particle texture
        const graphics = this.make.graphics({ x: 0, y: 0 });
        graphics.fillStyle(0xffffff);
        graphics.fillTriangle(8, 0, 0, 16, 16, 16);
        graphics.generateTexture('flame', 16, 16);
        graphics.destroy();

        // particles
        this.add.particles(0, 0, 'flame', {
            x: { min: -50, max: 1010 },
            y: { min: 520, max: 580 },
            speedY: { min: -250, max: -100 },
            speedX: { min: -20, max: 20 },
            scale: { start: 1.4, end: 0 },
            alpha: { start: 0.9, end: 0 },
            tint: [0x800080, 0xff4444, 0xffffff, 0x4488ff, 0x0044ff],
            lifespan: 2500,
            frequency: 30,
            quantity: 8,
            rotate: { min: -30, max: 30 },
            blendMode: 'ADD'
        });

        // buttons
        const createButton = (x: number, y: number, label: string, callback: () => void) => {
            this.add.rectangle(x, y, 220, 44, 0x2a2a3a)
                .setStrokeStyle(1, 0x7B2FBE)
                .setAlpha(0.85);
            const text = this.add.text(x, y, label, {
                fontSize: '28px',
                color: '#cccccc',
                fontFamily: 'serif',
                letterSpacing: 4
            }).setOrigin(0.5).setInteractive();

            text.on('pointerover', () => {
                this.tweens.add({ targets: text, scale: 1.1, duration: 200, ease: 'Sine.easeInOut' });
                text.setFill('#ffffff');
            });

            text.on('pointerout', () => {
                this.tweens.add({ targets: text, scale: 1, duration: 200, ease: 'Sine.easeInOut' });
                text.setFill('#cccccc');
            });

            text.on('pointerdown', () => callback());
        };

        createButton(480, 420, '[ ENTER ]', () =>{ 
            console.log("Attempting to start RollScene...");
            this.scene.start('RollScene'); 
        });
        createButton(480, 480, '[ OPTIONS ]', () => this.scene.start('OptionsScene'));
    }

    update() { }
}