export default class RollScene extends Phaser.Scene {
    private classes = [
        {
            key: 'Revenant-jukebox-bg-removed',
            name: 'The Revenant',
            description: 'Vengeful spirit. High risk, high reward.'
        },
        {
            key: 'Specter-jukebox-bg-removed',
            name: 'The Specter',
            description: 'Ethereal marksman. Death from a distance.'
        },
        {
            key: 'Wraith-jukebox-bg-removed',
            name: 'The Wraith',
            description: 'Protective spirit. Outlast everything.'
        }


    ]// class data array
    constructor() {
        super({ key: 'RollScene' });

    }
    private carouselIndex = 0      // tracks which class is in center
    private carouselTimer!: Phaser.Time.TimerEvent
    private sprites: Phaser.GameObjects.Image[] = []
    private scrollText!: Phaser.GameObjects.Text
    private isRolling = false
    create() {
        this.cameras.main.fadeIn(1000)
        this.createScrollBox()
        this.startTypewriter()
    }

    createScrollBox() {
        // dark rectangle + border at bottom
        // typewriter text object inside it, starts empty
        const scrollBox = this.add.rectangle(480, 500, 960, 100, 0x1a1a2e);
        scrollBox.setStrokeStyle(2, 0x7B2FBE);
        const text = this.add.text(240, 460, '', {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'serif',
            wordWrap: { width: 480 - 40 },
            lineSpacing: 6
        });
        this.scrollText = text;

    }

    startTypewriter() {
        // array of lines
        // types each line character by character using a timer
        // when all lines done → fadeout text → startCarousel()
        const lines = ["The underworld stirs...", "Three souls await your call...", "Press SPACE to seal your fate..."]
        let lineIndex = 0;
        let charIndex = 0;
        const typeNextChar = () => {
            if (lineIndex >= lines.length) {
                this.time.delayedCall(1000, () => {
                    this.tweens.add({
                        targets: this.scrollText,
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => this.startCarousel()
                    });
                });
                return;
            }
            const line = lines[lineIndex];
            if (charIndex < line.length) {
                this.scrollText.text += line[charIndex];
                charIndex++;
                this.time.delayedCall(50, typeNextChar);
            } else {
                lineIndex++;
                charIndex = 0;
                this.scrollText.text += '\n';
                this.time.delayedCall(500, typeNextChar);
            }
        };
        typeNextChar();
    }

    createGlow(x: number, y: number) {
        // large soft circle, ADD blend, pulse tween
        const circle = this.add.circle(x, y, 120, 0x7B2FBE, 0.15);
        circle.setBlendMode("ADD");
        this.tweens.add({ targets: circle, alpha: 0.35, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

        const inner = this.add.circle(x, y, 60, 0x9b4fcc, 0.25);
        inner.setBlendMode('ADD');
        this.tweens.add({ targets: inner, alpha: 0.5, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    startCarousel() {
        // spawn three sprites at left/center/right
        // createGlow behind each
        // start rotation timer every 600ms
        // listen for SPACE key
        const positions = [160, 480, 800];

        this.classes.forEach((classData, i) => {
            const sprite = this.add.image(positions[i], 270, classData.key)
            sprite.setScale(i === 1 ? 0.45 : 0.3)  // center one bigger
            sprite.setAlpha(0)                       // start invisible
            this.sprites.push(sprite)               // add to sprites array

            // fade in
            this.tweens.add({ targets: sprite, alpha: 1, duration: 800 })

            // glow behind it
            this.createGlow(positions[i], 270)
        })

        this.isRolling = true;
        this.carouselTimer = this.time.addEvent({
            delay: 600,
            callback: this.rotateCarousel,
            callbackScope: this,
            loop: true
        })
        this.input.keyboard!.once('keydown-SPACE', () => {
            if (this.isRolling) this.selectClass()
        })

    }

    rotateCarousel() {
        const positions = [160, 480, 800]

        // advance the index
        this.carouselIndex = (this.carouselIndex + 1) % 3

        // move each sprite to its new position
        this.sprites.forEach((sprite, i) => {
            // figure out which position slot this sprite now occupies
            const slot = (i - this.carouselIndex + 3) % 3
            const newX = positions[slot]
            const newScale = slot === 1 ? 0.45 : 0.3  // center = bigger

            this.tweens.add({
                targets: sprite,
                x: newX,
                scale: newScale,
                duration: 300,
                ease: 'Sine.easeInOut'
            })
        })
    }
    selectClass() {
        // stop timer
        this.carouselTimer.destroy()
        this.isRolling = false

        // figure out which class is in the center slot
        const centerSpriteIndex = (0 - this.carouselIndex + 3) % 3  // maps back to classes array
        const chosen = this.classes[centerSpriteIndex]

        // fade out left and right sprites
        this.sprites.forEach((sprite, i) => {
            const slot = (i - this.carouselIndex + 3) % 3
            if (slot !== 1) {
                this.tweens.add({ targets: sprite, alpha: 0, duration: 500 })
            } else {
                // scale up center sprite
                this.tweens.add({ targets: sprite, scale: 0.7, duration: 600, ease: 'Back.easeOut' })
            }
        })

        // show class name + description after sprites settle
        this.time.delayedCall(800, () => {
            // add a text box with the class name and description, and a "BEGIN" button that starts GameScene with the chosen class as data
            this.add.rectangle(480, 400, 500, 200, 0x1a1a2e, 0.8).setStrokeStyle(2, 0x7B2FBE);
            this.add.text(480, 420, chosen.name, {
                fontSize: '32px',
                color: '#7B2FBE',
                fontFamily: 'serif'
            }).setOrigin(0.5)

            this.add.text(480, 460, chosen.description, {
                fontSize: '20px',
                color: '#cccccc',
                fontFamily: 'serif'
            }).setOrigin(0.5)

            // BEGIN button
            this.time.delayedCall(500, () => {
                const btn = this.add.text(480, 510, '[ BEGIN ]', {
                    fontSize: '28px',
                    color: '#cccccc',
                    fontFamily: 'serif'
                }).setOrigin(0.5).setInteractive()

                btn.on('pointerover', () => btn.setFill('#ffffff'))
                btn.on('pointerout', () => btn.setFill('#cccccc'))
                btn.on('pointerdown', () => {
                    this.scene.start('GameScene', { playerClass: chosen })
                })
            })
        })
    }
}