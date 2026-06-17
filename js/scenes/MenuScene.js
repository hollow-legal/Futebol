class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    // Sky background
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'sky');

    // Hills + favela silhouette
    this.add.tileSprite(0, GAME_HEIGHT - 130, GAME_WIDTH, 130, 'bg_hills').setOrigin(0, 0);
    this.add.tileSprite(0, GAME_HEIGHT - 200, GAME_WIDTH, 200, 'bg_favela').setOrigin(0, 0);

    // Ground strip
    this.add.tileSprite(0, GAME_HEIGHT - 80, GAME_WIDTH, 80, 'ground').setOrigin(0, 0);

    // Sun
    this.add.circle(820, 80, 44, 0xFFF176);
    this.add.circle(820, 80, 36, 0xFFEB3B);

    // Title shadow
    this.add.text(GAME_WIDTH / 2 + 4, 124, 'BOLA NA RUA', {
      fontSize: '72px', fontFamily: 'Arial Black', color: '#001050'
    }).setOrigin(0.5);

    // Title
    this.add.text(GAME_WIDTH / 2, 120, 'BOLA NA RUA', {
      fontSize: '72px', fontFamily: 'Arial Black',
      color: '#FFDF00', stroke: '#002776', strokeThickness: 8
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 188, 'Um jogo de futebol de rua', {
      fontSize: '22px', fontFamily: 'Arial', color: '#FFFFFF',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);

    // Animated ball
    const ball = this.add.image(GAME_WIDTH / 2, 300, 'ball').setScale(4);
    this.tweens.add({ targets: ball, angle: 360, duration: 2200, repeat: -1 });

    // Goal flag decoration
    this.add.image(820, GAME_HEIGHT - 80, 'flag').setOrigin(0.5, 1).setScale(1.2);

    // Blinking start text
    const startTxt = this.add.text(GAME_WIDTH / 2, 390, 'Pressione ESPAÇO para jogar', {
      fontSize: '24px', fontFamily: 'Arial Black', color: '#FFFFFF',
      stroke: '#002776', strokeThickness: 4
    }).setOrigin(0.5);
    this.tweens.add({ targets: startTxt, alpha: 0, duration: 600, yoyo: true, repeat: -1 });

    // Controls hint
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 30,
      '← → Mover   |   ↑ Pular   |   ESPAÇO Chutar   |   ↑+ESPAÇO Chute Alto   |   ↓+ESPAÇO Chute Rasteiro',
      { fontSize: '13px', fontFamily: 'Arial', color: '#CCCCCC', stroke: '#000', strokeThickness: 2 }
    ).setOrigin(0.5);

    // Input
    const start = () => this.scene.start('GameScene', { score: 0, lives: 3 });
    this.input.keyboard.once('keydown-SPACE', start);
    this.input.keyboard.once('keydown-ENTER', start);
    this.input.once('pointerdown', start);
  }
}
