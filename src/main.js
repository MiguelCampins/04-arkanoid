const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );

const MAX_DT = 1 / 30; // s

let lastTime = null;

function frame( now ) {
  if ( lastTime === null ) lastTime = now;
  const dt = Math.min( ( now - lastTime ) / 1000, MAX_DT );
  lastTime = now;

  update( dt );
  render( ctx );

  requestAnimationFrame( frame );
}

loadSpritesheet( () => {
  resetGame();
  requestAnimationFrame( frame );
} );
