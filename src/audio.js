const bounceSound = new Audio( 'assets/sounds/ball-bounce.mp3' );
const breakSound = new Audio( 'assets/sounds/break-sound.mp3' );
bounceSound.preload = 'auto';
breakSound.preload = 'auto';

function playSound( sound ) {
  sound.currentTime = 0;
  sound.play().catch( () => {} );
}

function playBounce() {
  playSound( bounceSound );
}

function playBreak() {
  playSound( breakSound );
}
