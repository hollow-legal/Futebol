class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  init(data) {
    this.score = data.score || 0;
    this.lives = data.lives !== undefined ? data.lives : 3;
  }

  create() {
    this.physics.world.setBounds(0, -300, LEVEL_LEN, GAME_HEIGHT + 400);

    this._bg();
    this._ground();
    this._platforms();
    this._goal();

    this.player = new Player(this, 80, GROUND_Y - 22);
    this.ball   = new Ball(this, 160, GROUND_Y - BALL_R - 1);

    this._obstacles();
    this._colliders();
    this._camera();
    this._hud();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.kickKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Touch controls (mobile only) — allow simultaneous touches
    this.input.addPointer(3);
    const hasTouch = this.sys.game.device.input.touch ||
                     ('ontouchstart' in window) ||
                     (navigator.maxTouchPoints > 0);
    this.touch = hasTouch ? new TouchControls(this) : null;

    this.timeLeft = 90;
    this.timerEv  = this.time.addEvent({
      delay: 1000, loop: true,
      callback: this._tick, callbackScope: this
    });

    this.state      = 'play';
    this.invincible = false;
    this.kickCount  = 0;
  }

  // ─── Background ───────────────────────────────────────────────
  _bg() {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'sky').setScrollFactor(0).setDepth(-10);

    // sun
    this.add.circle(800, 75, 44, 0xFFF176).setScrollFactor(0).setDepth(-9);
    this.add.circle(800, 75, 36, 0xFFEB3B).setScrollFactor(0).setDepth(-9);

    this.bgHills = this.add.tileSprite(0, GROUND_Y - 130, GAME_WIDTH, 130, 'bg_hills')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-8);

    this.bgFavela = this.add.tileSprite(0, GROUND_Y - 200, GAME_WIDTH, 200, 'bg_favela')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-7);
  }

  // ─── Ground ───────────────────────────────────────────────────
  _ground() {
    // visual
    this.add.tileSprite(0, GROUND_Y, LEVEL_LEN, 80, 'ground').setOrigin(0, 0).setDepth(0);

    // physics body — center at (LEVEL_LEN/2, GROUND_Y+40), top at GROUND_Y
    this.groundGroup = this.physics.add.staticGroup();
    const g = this.groundGroup.create(LEVEL_LEN / 2, GROUND_Y + 40, 'px');
    g.setVisible(false).setDisplaySize(LEVEL_LEN, 80);
    g.body.setSize(LEVEL_LEN, 80);
    g.refreshBody();
  }

  // ─── Platforms ────────────────────────────────────────────────
  _platforms() {
    const PD = [
      { x:  600, y: GROUND_Y-100, w: 120 },
      { x:  900, y: GROUND_Y-120, w: 100 },
      { x: 1350, y: GROUND_Y-110, w: 140 },
      { x: 1700, y: GROUND_Y-130, w: 120 },
      { x: 2100, y: GROUND_Y-100, w: 100 },
      { x: 2500, y: GROUND_Y-130, w: 160 },
      { x: 2900, y: GROUND_Y-110, w: 160 },
      { x: 3300, y: GROUND_Y-120, w: 120 },
      { x: 3800, y: GROUND_Y-100, w: 120 },
      { x: 4200, y: GROUND_Y-130, w: 140 },
      { x: 4650, y: GROUND_Y-110, w: 120 },
      { x: 5100, y: GROUND_Y-120, w: 100 },
      { x: 5500, y: GROUND_Y-100, w: 120 },
    ];

    this.platGroup = this.physics.add.staticGroup();
    PD.forEach(pd => {
      // visual
      this.add.tileSprite(pd.x - pd.w / 2, pd.y, pd.w, 16, 'platform')
        .setOrigin(0, 0).setDepth(1);
      // physics — center is pd.y+8 so top = pd.y
      const p = this.platGroup.create(pd.x, pd.y + 8, 'px');
      p.setVisible(false).setDisplaySize(pd.w, 16);
      p.body.setSize(pd.w, 16);
      p.refreshBody();
    });
  }

  // ─── Goal ─────────────────────────────────────────────────────
  _goal() {
    const gx = LEVEL_LEN - 180;
    this.add.image(gx, GROUND_Y, 'flag').setOrigin(0.5, 1).setDepth(2);
    this.add.text(gx, GROUND_Y - 100, 'META!', {
      fontSize: '22px', fontFamily: 'Arial Black',
      color: '#FFDF00', stroke: '#002776', strokeThickness: 4
    }).setOrigin(0.5).setDepth(2);

    this.goalZone = this.add.zone(gx, GROUND_Y - 44, 80, 88);
    this.physics.world.enable(this.goalZone);
    this.goalZone.body.setAllowGravity(false);
  }

  // ─── Obstacles ────────────────────────────────────────────────
  _obstacles() {
    this.stalls   = [];
    this.dogs     = [];
    this.potholes = [];
    this.motos    = [];

    const OD = [
      { t:'stall',   x: 800  },
      { t:'pothole', x:1100  },
      { t:'dog',     x:1400  },
      { t:'stall',   x:1750  },
      { t:'moto',    x:2200  },
      { t:'pothole', x:2600  },
      { t:'stall',   x:2950  },
      { t:'dog',     x:3250  },
      { t:'moto',    x:3650  },
      { t:'pothole', x:4050  },
      { t:'stall',   x:4350  },
      { t:'dog',     x:4700  },
      { t:'moto',    x:5050  },
      { t:'stall',   x:5350  },
      { t:'pothole', x:5600  },
    ];

    OD.forEach(od => {
      switch (od.t) {
        case 'stall': {
          const s = this.physics.add.staticImage(od.x, GROUND_Y - 33, 'stall');
          s.refreshBody();
          this.stalls.push(s);
          break;
        }
        case 'dog': {
          const d = this.physics.add.image(od.x, GROUND_Y - 17, 'dog');
          d.body.setAllowGravity(false).setImmovable(true);
          d.body.setSize(40, 28);
          d._sx = od.x; d._spd = 55 + (od.x % 25);
          d.body.setVelocityX(d._spd);
          this.dogs.push(d);
          break;
        }
        case 'pothole': {
          const p = this.physics.add.staticImage(od.x, GROUND_Y - 5, 'pothole');
          p.body.setSize(44, 14);
          p.refreshBody();
          this.potholes.push(p);
          break;
        }
        case 'moto': {
          const m = this.physics.add.image(od.x + 400, GROUND_Y - 23, 'mototaxi');
          m.body.setAllowGravity(false).setImmovable(false);
          m.body.setSize(72, 38);
          m.body.setVelocityX(-295);
          this.motos.push(m);
          break;
        }
      }
    });
  }

  // ─── Colliders / Overlaps ─────────────────────────────────────
  _colliders() {
    const ps = this.player.sprite, bs = this.ball.sprite;

    this.physics.add.collider(ps, this.groundGroup);
    this.physics.add.collider(bs, this.groundGroup);
    this.physics.add.collider(ps, this.platGroup);
    this.physics.add.collider(bs, this.platGroup);

    this.stalls.forEach(s => {
      this.physics.add.collider(ps, s);
      this.physics.add.collider(bs, s); // ball bounces via setBounce
    });

    this.dogs.forEach(d => {
      this.physics.add.overlap(ps, d, () => this._hurt());
      this.physics.add.collider(bs, d, (ball, dog) => {
        const kx = ball.body.velocity.x * 0.45;
        dog.body.setVelocity(kx, -220);
        dog.body.setAllowGravity(true);
        this.time.delayedCall(700, () => {
          if (dog.active) {
            dog.body.setAllowGravity(false);
            dog.y = GROUND_Y - 17;
            dog.body.setVelocity(dog._spd, 0);
          }
        });
      });
    });

    this.potholes.forEach(p => {
      this.physics.add.overlap(ps, p, () => this._hurt());
      this.physics.add.overlap(bs, p, () => this._respawnBall());
    });

    this.motos.forEach(m => {
      this.physics.add.overlap(ps, m, () => this._hurt());
      this.physics.add.collider(bs, m);
    });

    this.physics.add.overlap(ps, this.goalZone, () => this._win());
  }

  // ─── Camera ───────────────────────────────────────────────────
  _camera() {
    this.cameras.main.setBounds(0, -300, LEVEL_LEN, GAME_HEIGHT + 300);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(GAME_WIDTH * 0.22, GAME_HEIGHT * 0.5);
  }

  // ─── HUD ──────────────────────────────────────────────────────
  _hud() {
    const ts = { fontSize:'22px', fontFamily:'Arial Black',
                 color:'#FFDF00', stroke:'#002776', strokeThickness:4 };

    this.hearts = [];
    for (let i = 0; i < 3; i++) {
      const h = this.add.image(22 + i * 28, 22, 'heart')
        .setScrollFactor(0).setDepth(100).setScale(1.2);
      this.hearts.push(h);
    }

    this.timerTxt = this.add.text(GAME_WIDTH / 2, 8, 'TEMPO: 90', ts)
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    this.scoreTxt = this.add.text(GAME_WIDTH - 8, 8, 'PLACAR: 0', ts)
      .setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    this.add.text(GAME_WIDTH / 2, 36, 'FAVELA — FASE 1', {
      fontSize:'13px', fontFamily:'Arial', color:'#fff', stroke:'#000', strokeThickness:2
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    // controls hint (fades after 6s) — desktop only; on touch the buttons explain themselves
    const hasTouch = this.sys.game.device.input.touch ||
                     ('ontouchstart' in window) ||
                     (navigator.maxTouchPoints > 0);
    if (!hasTouch) {
      const hint = this.add.text(GAME_WIDTH / 2, 56,
        'ESPAÇO = Chutar  |  ↑+ESPAÇO = Chute Alto  |  ↓+ESPAÇO = Rasteiro',
        { fontSize:'13px', fontFamily:'Arial', color:'#ddd', stroke:'#000', strokeThickness:2 }
      ).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);
      this.time.delayedCall(5500, () =>
        this.tweens.add({ targets: hint, alpha: 0, duration: 1200 }));
    }

    this.flashTxt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 'CHEGOU!', {
      fontSize:'80px', fontFamily:'Arial Black',
      color:'#FFDF00', stroke:'#002776', strokeThickness:10
    }).setOrigin(0.5).setScrollFactor(0).setDepth(110).setAlpha(0);

    // Ball off-screen arrow
    this.ballArrow = this.add.text(0, GAME_HEIGHT / 2 - 10, '', {
      fontSize:'26px', fontFamily:'Arial', color:'#FFDF00',
      stroke:'#000', strokeThickness:3
    }).setScrollFactor(0).setDepth(100);
  }

  // ─── Main loop ────────────────────────────────────────────────
  update(time, delta) {
    if (this.state !== 'play') return;

    // Unified input (keyboard OR touch)
    const k = this.cursors, t = this.touch ? this.touch.state : null;
    const left  = k.left.isDown  || (t && t.left);
    const right = k.right.isDown || (t && t.right);
    const jump  = Phaser.Input.Keyboard.JustDown(k.up) ||
                  (this.touch && this.touch.consumeJump());
    this.player.update({ left, right, jump });

    // Kick: keyboard (SPACE + held ↑/↓) or touch (one-shot per button)
    let doKick = false, high = false, low = false;
    if (Phaser.Input.Keyboard.JustDown(this.kickKey)) {
      doKick = true; high = k.up.isDown; low = k.down.isDown;
    }
    if (this.touch) {
      const kc = this.touch.consumeKick();
      if (kc) { doKick = true; high = kc.high; low = kc.low; }
    }
    if (doKick && this.player.tryKick(this.ball, { high, low })) {
      this.kickCount++;
      this.score += 10;
    }

    this.ball.update(delta);

    // Dog patrol
    this.dogs.forEach(d => {
      if (!d.active || !d.body) return;
      const dx = d.x - d._sx;
      if (dx > 85)  { d.body.setVelocityX(-d._spd); d.setFlipX(true);  }
      if (dx < -85) { d.body.setVelocityX( d._spd); d.setFlipX(false); }
    });

    // Moto cleanup (once off-screen left)
    this.motos = this.motos.filter(m => {
      if (!m.active) return false;
      if (m.x < this.cameras.main.scrollX - 200) { m.destroy(); return false; }
      return true;
    });

    // Parallax
    const sx = this.cameras.main.scrollX;
    this.bgHills.tilePositionX   = sx * 0.14;
    this.bgFavela.tilePositionX  = sx * 0.34;

    this._checkBall();

    // Left boundary
    if (this.player.sprite.x < 40) {
      this.player.sprite.x = 40;
      this.player.sprite.body.setVelocityX(0);
    }

    // Fell off world
    if (this.player.sprite.y > GAME_HEIGHT + 120) {
      this._hurt(true);
      this.player.sprite.setPosition(
        Math.max(80, this.player.sprite.x - 80), GROUND_Y - 22);
      this.player.sprite.body.setVelocity(0, 0);
    }

    // HUD updates
    this.scoreTxt.setText('PLACAR: ' + this.score);
    this._ballArrow();
  }

  _checkBall() {
    const bx = this.ball.sprite.x, by = this.ball.sprite.y;
    const cam = this.cameras.main;

    if (by > GAME_HEIGHT + 120
     || bx > cam.scrollX + GAME_WIDTH + 80
     || this.player.sprite.x - bx > GAME_WIDTH * 0.65) {
      this._respawnBall();
    }
  }

  _respawnBall() {
    const px = this.player.sprite.x;
    this.ball.reset(px + this.player.facing * 55, GROUND_Y - BALL_R - 1);
    this.score = Math.max(0, this.score - 5);
  }

  _hurt(noFlash = false) {
    if (this.invincible || this.state !== 'play') return;
    this.lives--;
    this.score = Math.max(0, this.score - 50);

    this._updateHearts();
    this._respawnBall();

    if (this.lives <= 0) { this._lose(); return; }

    this.invincible = true;
    if (!noFlash) this.cameras.main.flash(400, 255, 60, 60);

    this.tweens.add({
      targets: this.player.sprite,
      alpha: { from: 0.15, to: 1 },
      duration: 110, repeat: 9, yoyo: true,
      onComplete: () => {
        this.player.sprite.setAlpha(1);
        this.invincible = false;
      }
    });
  }

  _updateHearts() {
    this.hearts.forEach((h, i) => h.setAlpha(i < this.lives ? 1 : 0.2));
  }

  _ballArrow() {
    const bx = this.ball.sprite.x - this.cameras.main.scrollX;
    if (bx < 10) {
      this.ballArrow.setText('⬅ ⚽').setPosition(12, GAME_HEIGHT / 2 - 10);
    } else if (bx > GAME_WIDTH - 10) {
      this.ballArrow.setText('⚽ ➡').setPosition(GAME_WIDTH - 70, GAME_HEIGHT / 2 - 10);
    } else {
      this.ballArrow.setText('');
    }
  }

  _tick() {
    if (this.state !== 'play') return;
    this.timeLeft--;
    this.timerTxt.setText('TEMPO: ' + this.timeLeft);
    if (this.timeLeft <= 15) this.timerTxt.setColor('#FF4444');
    if (this.timeLeft <= 0)  this._lose();
  }

  _win() {
    if (this.state !== 'play') return;
    this.state = 'won';
    this.timerEv.remove(false);
    this.score += 500 + this.timeLeft * 10;

    this.cameras.main.flash(900, 255, 220, 0);
    this.tweens.add({
      targets: this.flashTxt,
      alpha: 1, y: GAME_HEIGHT / 2 - 30,
      duration: 700, ease: 'Back.easeOut'
    });
    this.time.delayedCall(2600, () =>
      this.scene.start('GameOverScene', {
        won: true, score: this.score,
        timeLeft: this.timeLeft, kicks: this.kickCount
      })
    );
  }

  _lose() {
    if (this.state !== 'play') return;
    this.state = 'lost';
    if (this.timerEv) this.timerEv.remove(false);
    this.cameras.main.shake(500, 0.018);
    this.time.delayedCall(900, () =>
      this.scene.start('GameOverScene', {
        won: false, score: this.score,
        timeLeft: this.timeLeft, kicks: this.kickCount
      })
    );
  }
}
