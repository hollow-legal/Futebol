class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.facing = 1;
    this._runFrame = 0;
    this._lastKick = -9999;
    this.isKicking = false;

    this.WALK  = 220;
    this.JUMP  = -530;
    this.REACH = 72;
    this.CD    = 480;

    this.sprite = scene.physics.add.sprite(x, y, 'player_idle');
    this.sprite.body.setSize(20, 44).setOffset(4, 2);
    this.sprite.setCollideWorldBounds(false);
    this.sprite.body.setDragX(600);

    this._runTimer = scene.time.addEvent({
      delay: 130, loop: true,
      callback: () => { this._runFrame ^= 1; }
    });
  }

  update(input) {
    const body = this.sprite.body;
    const onGround = body.blocked.down;

    if (input.left) {
      body.setVelocityX(-this.WALK);
      this.facing = -1;
      this.sprite.setFlipX(true);
    } else if (input.right) {
      body.setVelocityX(this.WALK);
      this.facing = 1;
      this.sprite.setFlipX(false);
    }

    if (input.jump && onGround) {
      body.setVelocityY(this.JUMP);
    }

    if (!this.isKicking) {
      if (!onGround) {
        this.sprite.setTexture('player_run1');
      } else if (Math.abs(body.velocity.x) > 15) {
        this.sprite.setTexture(this._runFrame ? 'player_run1' : 'player_run2');
      } else {
        this.sprite.setTexture('player_idle');
      }
    }
  }

  tryKick(ball, mods) {
    const now = this.scene.time.now;
    if (now - this._lastKick < this.CD) return false;
    if (!this.isNearBall(ball)) return false;

    this._lastKick = now;
    this.isKicking = true;
    this.sprite.setTexture('player_kick');
    this.scene.time.delayedCall(200, () => { this.isKicking = false; });

    const high = mods && mods.high;
    const low  = mods && mods.low;
    const run  = Math.sign(this.sprite.body.velocity.x) === this.facing;

    let vx = this.facing * 560, vy = -340;
    if (high) { vx = this.facing * 280; vy = -700; }
    if (low)  { vx = this.facing * 780; vy =  -60; }
    if (run)  { vx *= 1.25; }

    ball.applyKick(vx, vy);
    return true;
  }

  isNearBall(ball) {
    return Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      ball.sprite.x, ball.sprite.y
    ) < this.REACH;
  }

  destroy() {
    this._runTimer.remove();
    this.sprite.destroy();
  }
}
