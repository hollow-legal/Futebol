// Controles touch para mobile.
// Usa eventos DOM nativos (touchstart/move/end) diretamente no canvas,
// convertendo clientX/Y → coordenadas do jogo via getBoundingClientRect().
// Isso evita qualquer problema de escala do Phaser ScaleManager em dispositivos reais.
class TouchControls {
  constructor(scene) {
    this.scene = scene;
    this.state = { left: false, right: false };
    this._jumpQueued = false;
    this._kickQueued = null;          // null | { high, low }

    this._btns = [];                  // { x, y, r, hit, type, mods, circ }
    this._activeTouches = {};         // touchIdentifier -> botão de movimento que está segurando

    this._build();
    this._bindRawTouch();
  }

  // Converte coordenadas DOM (clientX/Y) para espaço do jogo (game coords)
  _toGame(clientX, clientY) {
    const canvas = this.scene.sys.game.canvas;
    const rect   = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / rect.width  * GAME_WIDTH,
      y: (clientY - rect.top)  / rect.height * GAME_HEIGHT
    };
  }

  // ── Visual de um botão (círculo + rótulo) ───────────────────
  _addBtn(x, y, r, color, label, fontSize, type, mods) {
    const circ = this.scene.add.circle(x, y, r, color, 0.35)
      .setScrollFactor(0).setDepth(200)
      .setStrokeStyle(3, 0xffffff, 0.65);

    this.scene.add.text(x, y, label, {
      fontSize: (fontSize || 22) + 'px', fontFamily: 'Arial Black',
      color: '#ffffff', stroke: '#000000', strokeThickness: 3, align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    // Área de toque generosa para acerto fácil em dedos de tamanho variado
    const b = { x, y, r, hit: r + 22, type, mods, circ };
    this._btns.push(b);
    return b;
  }

  _press(b, on) { b.circ.setFillStyle(b.circ.fillColor, on ? 0.65 : 0.35); }

  _build() {
    const W = GAME_WIDTH, H = GAME_HEIGHT;

    // Direcional (canto inferior esquerdo)
    this._addBtn(70,  H - 70, 46, 0x2196F3, '◄', 30, 'left');
    this._addBtn(185, H - 70, 46, 0x2196F3, '►', 30, 'right');

    // Pulo (canto inferior direito)
    this._addBtn(W - 70, H - 70, 48, 0x43A047, 'PULO', 20, 'jump');

    // Chutes (acima do pulo)
    this._addBtn(W - 70,  H - 180, 40, 0xFFB300, 'CHUTE',    16, 'kick', { high: false, low: false });
    this._addBtn(W - 180, H - 140, 40, 0xFB8C00, 'ALTO',     17, 'kick', { high: true,  low: false });
    this._addBtn(W - 180, H - 50,  40, 0xF4511E, 'RASTEIRO', 13, 'kick', { high: false, low: true  });
  }

  _hit(gx, gy) {
    for (const b of this._btns) {
      const dx = gx - b.x, dy = gy - b.y;
      if (Math.sqrt(dx * dx + dy * dy) <= b.hit) return b;
    }
    return null;
  }

  // ── Eventos DOM nativos (touchstart / touchmove / touchend) ─────
  _bindRawTouch() {
    const canvas = this.scene.sys.game.canvas;

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        const g = this._toGame(t.clientX, t.clientY);
        const b = this._hit(g.x, g.y);
        if (!b) continue;
        if (b.type === 'left' || b.type === 'right') {
          this._activeTouches[t.identifier] = b;
          this._recomputeMove();
        } else if (b.type === 'jump') {
          this._jumpQueued = true;
          this._flash(b);
        } else if (b.type === 'kick') {
          this._kickQueued = b.mods;
          this._flash(b);
        }
      }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        // Só rastreia se este toque já segurava um botão de movimento
        if (!(t.identifier in this._activeTouches)) continue;
        const g = this._toGame(t.clientX, t.clientY);
        const b = this._hit(g.x, g.y);
        if (b && (b.type === 'left' || b.type === 'right')) {
          this._activeTouches[t.identifier] = b;
        } else {
          delete this._activeTouches[t.identifier];
        }
        this._recomputeMove();
      }
    }, { passive: false });

    const onEnd = (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier in this._activeTouches) {
          delete this._activeTouches[t.identifier];
          this._recomputeMove();
        }
      }
    };
    canvas.addEventListener('touchend',    onEnd, { passive: false });
    canvas.addEventListener('touchcancel', onEnd, { passive: false });
  }

  _recomputeMove() {
    const held = Object.values(this._activeTouches);
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
