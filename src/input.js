const keys = { left: false, right: false };

function setKey( code, pressed ) {
  if ( code === 'ArrowLeft' || code === 'KeyA' ) {
    keys.left = pressed;
    return true;
  }
  if ( code === 'ArrowRight' || code === 'KeyD' ) {
    keys.right = pressed;
    return true;
  }
  return false;
}

window.addEventListener( 'keydown', ( e ) => {
  if ( setKey( e.code, true ) ) {
    e.preventDefault();
    return;
  }

  if ( e.code === 'Space' ) {
    e.preventDefault();
    if ( state.mode === 'ready' ) {
      launchBall();
      state.mode = 'playing';
    }
  } else if ( e.code === 'KeyP' || e.code === 'Escape' ) {
    e.preventDefault();
    togglePause();
  } else if ( e.code === 'Enter' ) {
    e.preventDefault();
    if ( state.mode === 'won' || state.mode === 'gameover' ) {
      resetGame();
    }
  }
} );

window.addEventListener( 'keyup', ( e ) => {
  if ( setKey( e.code, false ) ) e.preventDefault();
} );
