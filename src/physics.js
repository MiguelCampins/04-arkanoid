const LAUNCH_ANGLE = Math.PI / 12; // ±15° respecto a la vertical
const CEILING_Y = BRICKS_TOP; // la bola no entra en la franja del HUD

function updatePaddle( dt ) {
  const p = state.paddle;
  let dir = 0;
  if ( keys.left ) dir -= 1;
  if ( keys.right ) dir += 1;

  p.x += dir * p.speed * dt;
  if ( p.x < 0 ) p.x = 0;
  if ( p.x + p.w > CANVAS_W ) p.x = CANVAS_W - p.w;
}

function stickBallToPaddle() {
  const b = state.ball;
  const p = state.paddle;
  b.x = p.x + p.w / 2 - b.size / 2;
  b.y = p.y - b.size;
}

function launchBall() {
  const b = state.ball;
  const angle = ( Math.random() * 2 - 1 ) * LAUNCH_ANGLE;
  b.vx = b.speed * Math.sin( angle );
  b.vy = -b.speed * Math.cos( angle );
  b.stuck = false;
}

function overlaps( a, bx, by, bw, bh ) {
  return a.x < bx + bw && a.x + a.size > bx && a.y < by + bh && a.y + a.size > by;
}

function collidePaddle() {
  const b = state.ball;
  const p = state.paddle;
  if ( b.vy <= 0 ) return;
  if ( !overlaps( b, p.x, p.y, p.w, p.h ) ) return;

  const ballCenterX = b.x + b.size / 2;
  const paddleCenterX = p.x + p.w / 2;
  const rel = Math.max( -1, Math.min( 1, ( ballCenterX - paddleCenterX ) / ( p.w / 2 ) ) );
  const angle = rel * MAX_BOUNCE_ANGLE;

  b.vx = b.speed * Math.sin( angle );
  b.vy = -b.speed * Math.cos( angle );
  b.y = p.y - b.size;
  playBounce();
}

function collideBricks() {
  const b = state.ball;

  for ( const br of state.bricks ) {
    if ( !br.alive ) continue;
    if ( !overlaps( b, br.x, br.y, br.w, br.h ) ) continue;

    const penLeft = b.x + b.size - br.x;
    const penRight = br.x + br.w - b.x;
    const penTop = b.y + b.size - br.y;
    const penBottom = br.y + br.h - b.y;
    const penX = Math.min( penLeft, penRight );
    const penY = Math.min( penTop, penBottom );

    if ( penX < penY ) {
      b.vx = -b.vx;
      b.x += penLeft < penRight ? -penLeft : penRight;
    } else {
      b.vy = -b.vy;
      b.y += penTop < penBottom ? -penTop : penBottom;
    }

    br.alive = false;
    state.score += BRICK_POINTS;
    state.explosions.push( { x: br.x, y: br.y, color: br.color, t: 0 } );
    playBreak();
    return; // como máximo un ladrillo por frame
  }
}

function updateBall( dt ) {
  const b = state.ball;

  b.x += b.vx * dt;
  b.y += b.vy * dt;

  if ( b.x < 0 ) {
    b.x = 0;
    b.vx = Math.abs( b.vx );
    playBounce();
  } else if ( b.x + b.size > CANVAS_W ) {
    b.x = CANVAS_W - b.size;
    b.vx = -Math.abs( b.vx );
    playBounce();
  }

  if ( b.y < CEILING_Y ) {
    b.y = CEILING_Y;
    b.vy = Math.abs( b.vy );
    playBounce();
  }

  collideBricks();
  if ( !state.bricks.some( ( br ) => br.alive ) ) {
    state.mode = 'won';
    return;
  }

  collidePaddle();

  if ( b.y > CANVAS_H ) {
    loseLife();
  }
}

function loseLife() {
  const b = state.ball;
  b.stuck = true;
  b.vx = 0;
  b.vy = 0;

  state.lives -= 1;
  if ( state.lives === 0 ) {
    state.mode = 'gameover';
  } else {
    state.mode = 'serving';
    state.serveTimer = SERVE_DELAY;
  }
}

function updateServe( dt ) {
  state.serveTimer -= dt;
  if ( state.serveTimer <= 0 ) {
    state.serveTimer = 0;
    launchBall();
    state.mode = 'playing';
  }
}

function togglePause() {
  if ( state.mode === 'playing' || state.mode === 'serving' ) {
    state.pausedFrom = state.mode;
    state.mode = 'paused';
  } else if ( state.mode === 'paused' ) {
    state.mode = state.pausedFrom;
    state.pausedFrom = null;
  }
}

function updateExplosions( dt ) {
  const duration = EXPLOSION_DURATION / 1000; // ms → s
  for ( const e of state.explosions ) e.t += dt;
  state.explosions = state.explosions.filter( ( e ) => e.t < duration );
}

function update( dt ) {
  const m = state.mode;
  if ( m !== 'paused' ) {
    updateExplosions( dt );
  }

  if ( m === 'ready' || m === 'playing' || m === 'serving' ) {
    updatePaddle( dt );
  }

  if ( state.ball.stuck ) {
    stickBallToPaddle();
  } else if ( m === 'playing' ) {
    updateBall( dt );
  }

  if ( m === 'serving' ) {
    updateServe( dt );
  }
}
