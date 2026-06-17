class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  create() {
    this._ball();
    this._player();
    this._backgrounds();
    this._ground();
    this._platform();
    this._obstacles();
    this._ui();
    this.scene.start('MenuScene');
  }

  _g() { return this.make.graphics({ x: 0, y: 0, add: false }); }

  _ball() {
    const g = this._g();
    g.fillStyle(0x111111); g.fillCircle(14, 14, 14);
    g.fillStyle(0xF5F5F5); g.fillCircle(14, 14, 12);
    g.fillStyle(0x222222); g.fillCircle(14, 14, 3.5);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      g.fillCircle(14 + Math.cos(a) * 7.5, 14 + Math.sin(a) * 7.5, 2.8);
    }
    g.fillStyle(0xFFFFFF, 0.5); g.fillCircle(10, 10, 2.5);
    g.generateTexture('ball', 28, 28); g.destroy();
  }

  _drawBase(g) {
    g.fillStyle(C.skin);    g.fillCircle(14, 8, 8);
    g.fillStyle(0x111111);  g.fillRect(7, 1, 14, 7);
    g.fillStyle(C.verde);   g.fillRect(7, 17, 14, 13);
    g.fillStyle(0x007A2E);  g.fillRect(11, 17, 6, 3);
    g.fillStyle(C.azul);    g.fillRect(6, 30, 16, 10);
    g.fillStyle(C.amarelo); g.fillRect(6, 30, 16, 2);
  }

  _player() {
    const legs = {
      idle: (g) => {
        g.fillStyle(C.skin);
        g.fillRect(7, 40, 6, 7); g.fillRect(15, 40, 6, 7);
        g.fillStyle(C.azul);
        g.fillRect(5, 46, 9, 3); g.fillRect(14, 46, 9, 3);
      },
      run1: (g) => {
        g.fillStyle(C.skin);
        g.fillRect(5, 38, 6, 8); g.fillRect(17, 41, 6, 6);
        g.fillStyle(C.azul);
        g.fillRect(3, 44, 9, 3); g.fillRect(15, 46, 9, 3);
      },
      run2: (g) => {
        g.fillStyle(C.skin);
        g.fillRect(5, 41, 6, 6); g.fillRect(17, 38, 6, 8);
        g.fillStyle(C.azul);
        g.fillRect(3, 46, 9, 3); g.fillRect(15, 44, 9, 3);
      },
      kick: (g) => {
        g.fillStyle(C.skin);
        g.fillRect(7, 40, 6, 7);
        g.fillRect(18, 34, 5, 5); g.fillRect(22, 37, 7, 4);
        g.fillStyle(C.azul);
        g.fillRect(5, 46, 9, 3); g.fillRect(21, 40, 9, 3);
      }
    };
    for (const [key, fn] of Object.entries(legs)) {
      const g = this._g();
      this._drawBase(g);
      fn(g);
      g.generateTexture('player_' + key, 28, 48);
      g.destroy();
    }
  }

  _backgrounds() {
    // Sky gradient
    {
      const g = this._g();
      const cols = [0x0D47A1, 0x1565C0, 0x1976D2, 0x42A5F5, 0x64B5F6, 0x90CAF9];
      const bh = Math.ceil(GAME_HEIGHT / cols.length);
      cols.forEach((c, i) => { g.fillStyle(c); g.fillRect(0, i * bh, GAME_WIDTH, bh + 2); });
      g.generateTexture('sky', GAME_WIDTH, GAME_HEIGHT); g.destroy();
    }
    // Hills
    {
      const g = this._g();
      const W = 1920, H = 130;
      g.fillStyle(C.hill);
      [[0,H],[300,H],[640,H],[980,H],[1320,H],[1680,H],[1920,H]].forEach(([x]) => {
        g.fillEllipse(x, H, 400, H * 2);
      });
      g.generateTexture('bg_hills', W, H); g.destroy();
    }
    // Favela buildings
    {
      const g = this._g();
      const W = 1920, H = 200;
      const cols = [C.fav1, C.fav2, C.fav3, C.fav4, C.fav5];
      let x = 0, ci = 0;
      while (x < W) {
        const bw = 22 + (ci * 13) % 30;
        const bh = 45 + (ci * 17) % 70;
        const by = H - bh;
        g.fillStyle(cols[ci % cols.length]); g.fillRect(x, by, bw - 1, bh);
        g.fillStyle(0x2a2a2a); g.fillRect(x, by, bw - 1, 5);
        if (bh > 50) {
          g.fillStyle(0x1a1a30);
          g.fillRect(x + 3, by + 10, 6, 6);
          if (bw > 25) g.fillRect(x + 13, by + 10, 6, 6);
          if (bh > 70) { g.fillRect(x + 3, by + 25, 6, 6); }
        }
        if (ci % 3 === 0) { g.fillStyle(0xFFEB3B, 0.8); g.fillRect(x + 3, by + 10, 6, 6); }
        x += bw; ci++;
      }
      g.generateTexture('bg_favela', W, H); g.destroy();
    }
  }

  _ground() {
    const g = this._g();
    g.fillStyle(0x546E7A); g.fillRect(0, 0, 64, 80);
    g.fillStyle(0x607D8B); g.fillRect(0, 0, 64, 8);
    g.fillStyle(0x37474F);
    [[20, 0, 1, 28],[44, 12, 1, 38],[0, 33, 22, 1],[38, 48, 26, 1],
     [10, 18, 14, 1],[8, 58, 10, 1],[50, 28, 14, 1]].forEach(([x,y,w,h]) =>
       g.fillRect(x, y, w, h));
    g.generateTexture('ground', 64, 80); g.destroy();
  }

  _platform() {
    const g = this._g();
    g.fillStyle(0x78909C); g.fillRect(0, 0, 64, 16);
    g.fillStyle(0xB0BEC5); g.fillRect(0, 0, 64, 3);
    g.fillStyle(0x455A64); g.fillRect(0, 14, 64, 2);
    g.fillStyle(0x546E7A); g.fillRect(20, 4, 1, 8); g.fillRect(46, 3, 1, 9);
    g.generateTexture('platform', 64, 16); g.destroy();
  }

  _obstacles() {
    // Dog
    {
      const g = this._g();
      g.fillStyle(0xA1673A); g.fillEllipse(24, 18, 30, 16);
      g.fillStyle(0xA1673A); g.fillCircle(8, 14, 9);
      g.fillStyle(0x7B4F2C); g.fillEllipse(4, 17, 10, 7);
      g.fillStyle(0x7B4F2C); g.fillEllipse(11, 7, 8, 10);
      g.fillStyle(0x111111); g.fillCircle(7, 12, 2);
      g.fillStyle(0xA1673A);
      g.fillRect(14, 24, 5, 9); g.fillRect(22, 24, 5, 9);
      g.fillRect(30, 24, 4, 8); g.fillRect(36, 24, 4, 8);
      g.fillStyle(0x7B4F2C); g.fillEllipse(41, 10, 12, 6);
      g.generateTexture('dog', 48, 34); g.destroy();
    }
    // Stall
    {
      const g = this._g();
      g.fillStyle(0x5D4037); g.fillRect(8, 50, 4, 15); g.fillRect(53, 50, 4, 15);
      g.fillStyle(0x8D6E63); g.fillRect(4, 27, 58, 26);
      g.fillStyle(0x6D4C41); g.fillRect(4, 27, 58, 4);
      for (let i = 0; i < 5; i++) {
        g.fillStyle(i % 2 === 0 ? 0xE53935 : 0xFFFFFF);
        g.fillRect(4 + i * 12, 6, 12, 22);
      }
      g.fillStyle(0x5D4037); g.fillRect(29, 3, 4, 25);
      g.fillStyle(0xFF8F00); g.fillRect(8, 21, 10, 8);
      g.fillStyle(0x43A047); g.fillRect(21, 19, 8, 10);
      g.fillStyle(0x1E88E5); g.fillRect(32, 21, 10, 8);
      g.fillStyle(0xE53935); g.fillRect(45, 20, 9, 9);
      g.generateTexture('stall', 66, 65); g.destroy();
    }
    // Pothole
    {
      const g = this._g();
      g.fillStyle(0x37474F); g.fillEllipse(25, 12, 52, 22);
      g.fillStyle(0x1a1a1a); g.fillEllipse(25, 12, 44, 16);
      g.fillStyle(0x0D0D0D); g.fillEllipse(25, 13, 36, 12);
      g.generateTexture('pothole', 52, 24); g.destroy();
    }
    // Mototaxi
    {
      const g = this._g();
      g.fillStyle(0x1a1a1a);
      g.fillCircle(16, 34, 13); g.fillCircle(63, 34, 13);
      g.fillStyle(0x555); g.fillCircle(16, 34, 8); g.fillCircle(63, 34, 8);
      g.fillStyle(0x888); g.fillCircle(16, 34, 3); g.fillCircle(63, 34, 3);
      g.fillStyle(0xF57C00); g.fillRect(22, 18, 37, 18);
      g.fillStyle(0x1a1a1a); g.fillRect(24, 14, 22, 8);
      g.fillStyle(0x444); g.fillRect(57, 10, 6, 12); g.fillRect(54, 10, 12, 4);
      g.fillStyle(0x888); g.fillRect(15, 29, 13, 4);
      g.fillStyle(0xFF8F00); g.fillEllipse(41, 8, 14, 18);
      g.fillStyle(0x1a1a1a); g.fillCircle(41, 2, 6);
      g.generateTexture('mototaxi', 80, 46); g.destroy();
    }
  }

  _ui() {
    // Goal flag
    {
      const g = this._g();
      g.fillStyle(0x888); g.fillRect(10, 0, 4, 84);
      g.fillStyle(C.verde);  g.fillRect(14, 2, 26, 20);
      g.fillStyle(C.amarelo);
      g.fillTriangle(14, 12, 27, 2, 40, 12);
      g.fillTriangle(14, 12, 27, 22, 40, 12);
      g.fillStyle(C.azul);   g.fillCircle(27, 12, 6);
      g.fillStyle(C.brown);  g.fillRect(3, 80, 18, 8);
      g.generateTexture('flag', 46, 88); g.destroy();
    }
    // Heart
    {
      const g = this._g();
      g.fillStyle(0xE53935);
      g.fillCircle(6, 6, 6); g.fillCircle(14, 6, 6);
      g.fillTriangle(0, 8, 20, 8, 10, 19);
      g.generateTexture('heart', 20, 20); g.destroy();
    }
    // Invisible pixel
    {
      const g = this._g();
      g.fillStyle(0xffffff, 0); g.fillRect(0, 0, 1, 1);
      g.generateTexture('px', 1, 1); g.destroy();
    }
  }
}
