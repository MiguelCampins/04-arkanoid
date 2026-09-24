const CANVAS_W = 480;
const CANVAS_H = 640;

const BRICK_COLS = 10;
const BRICK_W = 48;
const BRICK_H = 24;
const BRICKS_TOP = 64; // la franja 0–64 es para el HUD
const BRICK_POINTS = 10;
const SERVE_DELAY = 1; // s
const MAX_BOUNCE_ANGLE = Math.PI / 3; // 60° respecto a la vertical
const BALL_SIZE = 12;

const state = {
  mode: 'ready', // 'ready' | 'playing' | 'serving' | 'paused' | 'won' | 'gameover'
  pausedFrom: null, // modo al que volver al salir de pausa: 'playing' | 'serving'
  level: 1, // 1..MAX_LEVEL
  score: 0,
  lives: 3,
  ballSpeed: BASE_BALL_SPEED, // px/s, = ballSpeedFor(level)
  serveTimer: 0, // segundos restantes para el relanzamiento automático
  paddle: { x: 192, y: 600, w: 96, h: 16, speed: 420 },
  balls: [], // { x, y, size, vx, vy, stuck }
  bricks: [],
  explosions: [],
};

function buildBricks( level ) {
  const bricks = [];
  LEVELS[ level - 1 ].forEach( ( line, row ) => {
    for ( let col = 0; col < BRICK_COLS; col++ ) {
      const color = BRICK_COLORS[ line[ col ] ];
      if ( !color ) continue; // '.' o carácter desconocido = hueco
      bricks.push( {
        x: col * BRICK_W,
        y: BRICKS_TOP + row * BRICK_H,
        w: BRICK_W,
        h: BRICK_H,
        color,
        alive: true,
      } );
    }
  } );
  return bricks;
}

// Carga un nivel conservando puntuación, vidas y explosiones en curso.
function loadLevel( level ) {
  state.level = level;
  state.ballSpeed = ballSpeedFor( level );
  state.mode = 'ready';
  state.pausedFrom = null;
  state.serveTimer = 0;

  state.balls = Array.from( { length: ballCountFor( level ) }, createBall );
  state.bricks = buildBricks( level );
}

// Bola nueva pegada a la pala.
function createBall() {
  const size = BALL_SIZE;
  return {
    x: state.paddle.x + state.paddle.w / 2 - size / 2,
    y: state.paddle.y - size,
    size,
    vx: 0,
    vy: 0,
    stuck: true,
  };
}

function resetGame() {
  state.score = 0;
  state.lives = 3;
  state.paddle.x = ( CANVAS_W - state.paddle.w ) / 2;
  state.explosions = [];
  loadLevel( 1 );
}
