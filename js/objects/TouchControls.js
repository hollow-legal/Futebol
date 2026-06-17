// Controles touch para mobile.
// Em vez de depender de setInteractive/pointerout (que falha ao "segurar"
// botão em celular real), faz rastreamento manual de ponteiros: hit-test
// por distância contra cada botão, com suporte a múltiplos toques simultâneos.
class TouchControls {
  constructor(scene) {
    this.scene = scene;
    this.state = { left: false, right: false };
    this._jumpQueued = false;
    this._kickQueued = null;          // null | { high, low }

    this._btns = [];                  // { x, y, r, hit, type, mods, circ }
    this._holders = {};               // pointerId -> botão de movimento que está segurando

    this._build();
    this._bindInput();
  }

  // ── Visual de um botão (círculo + rótulo) ──────────────────────
  _addBtn(x, y, r, color, label, fontSize, type, mods) {
    const circ = this.scene.add.circle(x, y, r, color, 0.32)
      .setScrollFactor(0).setDepth(200)
      .setStrokeStyle(3, 0xffffff, 0.55);

    this.scene.add.text(x, y, label, {
      fontSize: (fontSize || 22) + 'px', fontFamily: 'Arial Black',
      color: '#ffffff', stroke: '#000000', strokeThickness: 3, align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    // Área de toque um pouco maior que o visual, para acerto fácil
    const b = { x, y, r, hit: r + 10, type, mods, circ };
    this._btns.push(b);
    return b;
  }

  _press(b, on) { b.circ.setFillStyle(b.circ.fillColor, on ? 0.6 : 0.32); }

  _build() {
    const W = GAME_WIDTH, H = GAME_HEIGHT;

    // Direcional (canto inferior esquerdo)
    this._addBtn(70,  H - 70, 46, 0x2196F3, '◀', 30, 'left');
    this._addBtn(180, H - 70, 46, 0x2196F3, '▶', 30, 'right');

    // Pulo (canto inferior direito)
    this._addBtn(W - 70, H - 70, 48, 0x43A047, 'PULO', 20, 'jump');

    // Chutes (acima do pulo)
    this._addBtn(W - 70,  H - 175, 40, 0xFFB300, 'CHUTE',    16, 'kick', { high: false, low: false });
    this._addBtn(W - 175, H - 140, 40, 0xFB8C00, 'ALTO',     17, 'kick', { high: true,  low: false });
    this._addBtn(W - 175, H - 55,  40, 0xF4511E, 'RASTEIRO', 13, 'kick', { high: false, low: true  });
  }

  // ── Entrada (nível de cena, multi-toque) ───────────────────────
  _bindInput() {
    const input = this.scene.input;
    input.on('pointerdown',       (p) => this._onDown(p));
    input.on('pointermove',       (p) => this._onMove(p));
    input.on('pointerup',         (p) => this._onUp(p));
    input.on('pointerupoutside',  (p) => this._onUp(p));
  }

  _hit(px, py) {
    for (const b of this._btns) {
      if (Phaser.Math.Distance.Between(px, py, b.x, b.y) <= b.hit) return b;
    }
    return null;
  }

  _onDown(p) {
    const b = this._hit(p.x, p.y);
    if (!b) return;
    if (b.type === 'left' || b.type === 'right') {
      this._holders[p.id] = b;
      this._recomputeMove();
    } else if (b.type === 'jump') {
      this._jumpQueued = true;
      this._flash(b);
    } else if (b.type === 'kick') {
      this._kickQueued = b.mods;
      this._flash(b);
    }
  }

  _onMove(p) {
    // Só relevante se este ponteiro estiver (ou entrar) num botão de movimento
    if (!(p.id in this._holders) && !this._hit(p.x, p.y)) return;
    const b = this._hit(p.x, p.y);
    if (b && (b.type === 'left' || b.type === 'right')) {
      this._holders[p.id] = b;
    } else {
      delete this._holders[p.id];
    }
    this._recomputeMove();
  }

  _onUp(p) {
    if (p.id in this._holders) {
      delete this._holders[p.id];
      this._recomputeMove();
    }
  }

  _recomputeMove() {
    const held = Object.values(this._holders);
    this.state.left  = held.some(b => b.type === 'left');
    this.state.right = held.some(b => b.type === 'right');
    this._btns.forEach(b => {
      if (b.type === 'left')  this._press(b, this.state.left);
      if (b.type === 'right') this._press(b, this.state.right);
    });
  }

  _flash(b) {
    this._press(b, true);
    this.scene.time.delayedCall(120, () => this._press(b, false));
  }

  // One-shot: true uma vez por toque
  consumeJump() {
    if (this._jumpQueued) { this._jumpQueued = false; return true; }
    return false;
  }

  // One-shot: { high, low } uma vez por toque, senão null
  consumeKick() {
    if (this._kickQueued) { const m = this._kickQueued; this._kickQueued = null; return m; }
    return null;
  }
}
