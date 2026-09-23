function drawBricks( ctx ) {
  for ( const b of state.bricks ) {
    if ( !b.alive ) continue;
    drawSprite( ctx, 'block_' + b.color, b.x, b.y, b.w, b.h );
  }
}

function drawExplosions( ctx ) {
  const duration = EXPLOSION_DURATION / 1000; // ms → s
  for ( const e of state.explosions ) {
    const frames = EXPLOSION_FRAMES[ e.color ];
    const i = Math.min( frames.length - 1, Math.floor( ( e.t / duration ) * frames.length ) );
    drawFrame( ctx, frames[ i ], e.x, e.y, BRICK_W, BRICK_H );
  }
}

function drawPaddle( ctx ) {
  const p = state.paddle;
  drawSprite( ctx, 'paddle', p.x, p.y, p.w, p.h );
}

function drawBall( ctx ) {
  const b = state.ball;
  drawSprite( ctx, 'ball', b.x, b.y, b.size, b.size );
}

function drawHud( ctx ) {
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px monospace';
  ctx.textBaseline = 'middle';

  ctx.textAlign = 'left';
  ctx.fillText( 'SCORE: ' + state.score, 16, BRICKS_TOP / 2 );

  ctx.textAlign = 'right';
  ctx.fillText( 'VIDAS: ' + state.lives, CANVAS_W - 16, BRICKS_TOP / 2 );
}

const STATE_TEXTS = {
  ready: [ 'Pulsa ESPACIO' ],
  paused: [ 'PAUSA' ],
  won: [ '¡VICTORIA!', 'Pulsa ENTER' ],
  gameover: [ 'GAME OVER', 'Pulsa ENTER' ],
};

function drawStateText( ctx ) {
  const lines = STATE_TEXTS[ state.mode ];
  if ( !lines ) return;

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2 + 40;
  ctx.font = 'bold 36px monospace';
  ctx.fillText( lines[ 0 ], cx, cy );

  if ( lines[ 1 ] ) {
    ctx.font = 'bold 20px monospace';
    ctx.fillText( lines[ 1 ], cx, cy + 44 );
  }
}

function render( ctx ) {
  ctx.fillStyle = '#000';
  ctx.fillRect( 0, 0, CANVAS_W, CANVAS_H );

  drawBricks( ctx );
  drawExplosions( ctx );
  drawPaddle( ctx );
  drawBall( ctx );
  drawHud( ctx );
  drawStateText( ctx );
}
