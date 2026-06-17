class Ball {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.image(x, y, 'ball');
    const b = this.sprite.body;
    b.setCircle(BALL_R);
    b.setBounce(0.62);
    b.setMaxVelocity(780, 1050);
    b.setCollideWorldBounds(false);
  }

  update(delta) {
    const b = this.sprite.body;
    if (b.blocked.down) {
      b.setVelocityX(b.velocity.x * 0.955);
    } else {
      b.setVelocityX(b.velocity.x * 0.9985);
    }
    // visual roll
    const circ = 2 * Math.PI * BALL_R;
    this.sprite.angle += (b.velocity.x * delta / 1000) * (360 / circ);
  }

  applyKick(vx, vy) {
    this.sprite.body.setVelocity(vx, vy);
  }

  reset(x, y) {
    this.sprite.setPosition(x, y);
    this.sprite.body.setVelocity(0, 0);
  }

  destroy() { this.sprite.destroy(); }
}
