window.GAME_WIDTH  = 960;
window.GAME_HEIGHT = 540;
window.GROUND_Y    = 460;
window.LEVEL_LEN   = 6000;
window.BALL_R      = 14;
window.PLAYER_H    = 48;

window.C = {
  verde:    0x009C3B,
  amarelo:  0xFFDF00,
  azul:     0x002776,
  skin:     0xC68642,
  sky1:     0x1565C0,
  sky2:     0x42A5F5,
  hill:     0x2E7D32,
  brown:    0x6D4C41,
  fav1:     0xE57373,
  fav2:     0x4DB6AC,
  fav3:     0xFFB74D,
  fav4:     0x7986CB,
  fav5:     0xA5D6A7,
  concrete: 0x607D8B,
  asphalt:  0x455A64,
};

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1565C0',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 800 }, debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene]
};

new Phaser.Game(config);
