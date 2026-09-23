function drawBricks( ctx ) {
  for ( const b of state.bricks ) {
    if ( !b.alive ) continue;
    drawSprite( ctx, 'block_' + b.color, b.x, b.y, b.w, b.h );
  }
}

function render( ctx ) {
  ctx.fillStyle = '#000';
  ctx.fillRect( 0, 0, CANVAS_W, CANVAS_H );

  drawBricks( ctx );
}
