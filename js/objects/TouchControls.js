class TouchControls {
  constructor(scene) {
    this.scene = scene;
    this.state = { left: false, right: false };
    this._jumpQueued = false;
    this._kickQueued = null;   // null | { high, low }

    this._buttons = [];
    this._build();
  }

  // Helper: round button with a glyph/label
  _btn(x, y, r, color, label, fontSize) {
    const circ = this.scene.add.circle(x, y, r, color, 0.32)
      .setScrollFactor(0).setDepth(200)
      .setStrokeStyle(3, 0xffffff, 0.55)
      .setInteractive({ useHandCursor: true });

    const txt = this.scene.add.text(x, y, label, {
      fontSize: (fontSize || 22) + 'px', fontFamily: 'Arial Black',
      color: '#ffffff', stroke: '#000000', strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    this._buttons.push(circ, txt);
    return circ;
  }

  _press(btn, on)  { btn.setFillStyle(btn.fillColor, on ? 0.6 : 0.32); }

  _build() {
    const W = GAME_WIDTH, H = GAME_HEIGHT;

    // ── Movement d-pad (bottom-left) ─────────────────────────
    const dy = H - 70;
    const leftBtn  = this._btn(70,  dy, 46, 0x2196F3, '◀', 30);
    const rightBtn = this._btn(180, dy, 46, 0x2196F3, '▶', 30);

    leftBtn.on('pointerdown', () => { this.state.left = true;  this._press(leftBtn, true); });
    leftBtn.on('pointerup',   () => { this.state.left = false; this._press(leftBtn, false); });
    leftBtn.on('pointerout',  () => { this.state.left = false; this._press(leftBtn, false); });

    rightBtn.on('pointerdown', () => { this.state.right = true;  this._press(rightBtn, true); });
    rightBtn.on('pointerup',   () => { this.state.right = false; this._press(rightBtn, false); });
    rightBtn.on('pointerout',  () => { this.state.right = false; this._press(rightBtn, false); });

    // ── Jump (bottom-right) ─────────────────────────────
    const jumpBtn = this._btn(W - 70, H - 70, 48, 0x43A047, 'PULO', 20);
    jumpBtn.on('pointerdown', () => { this._jumpQueued = true; this._press(jumpBtn, true); });
    jumpBtn.on('pointerup',   () => this._press(jumpBtn, false));
    jumpBtn.on('pointerout',  () => this._press(jumpBtn, false));

    // ── Kick buttons (above jump) ───────────────────────
    const kicks = [
      { x: W - 70,  y: H - 175, label: 'CHUTE',    mods: { high: false, low: false }, color: 0xFFB300, fs: 16 },
      { x: W - 175, y: H - 140, label: 'ALTO',     mods: { high: true,  low: false }, color: 0xFB8C00, fs: 17 },
      { x: W - 175, y: H - 55,  label: 'RASTEIRO', mods: { high: false, low: true  }, color: 0xF4511E, fs: 13 },
    ];
    kicks.forEach(k => {
      const b = this._btn(k.x, k.y, 40, k.color, k.label, k.fs);
      b.on('pointerdown', () => { this._kickQueued = k.mods; this._press(b, true); });
      b.on('pointerup',   () => this._press(b, false));
      b.on('pointerout',  () => this._press(b, false));
    });
  }

  // One-shot: returns true once per tap
  consumeJump() {
    if (this._jumpQueued) { this._jumpQueued = false; return true; }
    return false;
  }

  // One-shot: returns { high, low } once per tap, else null
  consumeKick() {
    if (this._kickQueued) { const m = this._kickQueued; this._kickQueued = null; return m; }
    return null;
  }
}
