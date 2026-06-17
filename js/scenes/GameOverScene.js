class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOverScene' }); }

  init(data) {
    this.won      = data.won;
    this.score    = data.score    || 0;
    this.timeLeft = data.timeLeft || 0;
    this.kicks    = data.kicks    || 0;
  }

  create() {
    // Dimmed background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.72);

    const titleTxt = this.won ? 'CHEGOU!' : 'ACABOU O TEMPO!';
    const subTxt   = this.won
      ? 'Você levou a bola até o fim!'
      : 'A rua venceu hoje...';
    const titleCol = this.won ? '#FFDF00' : '#FF5252';

    // Title
    this.add.text(GAME_WIDTH / 2, 110, titleTxt, {
      fontSize: '64px', fontFamily: 'Arial Black',
      color: titleCol, stroke: '#002776', strokeThickness: 9
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 190, subTxt, {
      fontSize: '24px', fontFamily: 'Arial',
      color: '#FFFFFF', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);

    // Trophy or sad ball
    if (this.won) {
      this._trophy(GAME_WIDTH / 2, 300);
    } else {
      const b = this.add.image(GAME_WIDTH / 2, 285, 'ball').setScale(4);
      this.tweens.add({ targets: b, angle: -15, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }

    // Stats
    const statCfg = {
      fontSize: '22px', fontFamily: 'Arial',
      color: '#FFFFFF', stroke: '#000', strokeThickness: 3
    };
    this.add.text(GAME_WIDTH / 2, 370, `Chutes: ${this.kicks}`, statCfg).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 400, `Tempo restante: ${this.timeLeft}s`, statCfg).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 440, `PONTUAÇÃO FINAL: ${this.score}`, {
      fontSize: '32px', fontFamily: 'Arial Black',
      color: '#FFDF00', stroke: '#002776', strokeThickness: 5
    }).setOrigin(0.5);

    // Prompt
    const hasTouch = this.sys.game.device.input.touch ||
                     ('ontouchstart' in window) ||
                     (navigator.maxTouchPoints > 0);
    const p = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 38,
      hasTouch ? 'Toque para Jogar de Novo' : 'ESPAÇO — Jogar de Novo   |   ESC — Menu', {
        fontSize: '18px', fontFamily: 'Arial',
        color: '#CCCCCC', stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5);
    this.tweens.add({ targets: p, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    this.input.keyboard.once('keydown-SPACE', () =>
      this.scene.start('GameScene', { score: 0, lives: 3 }));
    this.input.keyboard.once('keydown-ESC', () =>
      this.scene.start('MenuScene'));
    this.input.once('pointerdown', () =>
      this.scene.start('GameScene', { score: 0, lives: 3 }));
  }

  _trophy(cx, cy) {
    const g = this.add.graphics();
    g.fillStyle(0xFFDF00);
    // Cup body
    g.fillRect(cx - 28, cy - 38, 56, 44);
    // Handles
    g.fillRect(cx - 40, cy - 30, 14, 20);
    g.fillRect(cx + 26, cy - 30, 14, 20);
    // Stem
    g.fillRect(cx - 8, cy + 6, 16, 18);
    // Base
    g.fillRect(cx - 26, cy + 24, 52, 10);
    // Inner cup darker
    g.fillStyle(0xFFC200);
    g.fillRect(cx - 20, cy - 30, 40, 36);
    // Star on cup
    g.fillStyle(0xFFFFFF);
    g.fillCircle(cx, cy - 12, 10);
    g.fillStyle(0x009C3B);
    g.fillCircle(cx, cy - 12, 7);
  }
}
