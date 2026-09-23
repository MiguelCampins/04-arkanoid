const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );

function frame() {
  render( ctx );

  requestAnimationFrame( frame );
}

loadSpritesheet( () => {
  resetGame();
  requestAnimationFrame( frame );
} );
