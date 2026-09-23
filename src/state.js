const CANVAS_W = 480;
const CANVAS_H = 640;

const BRICK_ROWS = [ 'red', 'hotpink', 'yellow', 'green', 'cyan', 'magenta' ];
const BRICK_COLS = 10;
const BRICK_W = 48;
const BRICK_H = 24;
const BRICKS_TOP = 64; // la franja 0–64 es para el HUD
const BRICK_POINTS = 10;
const SERVE_DELAY = 1; // s
const MAX_BOUNCE_ANGLE = Math.PI / 3; // 60° respecto a la vertical

const state = {
  mode: 'ready', // 'ready' | 'playing' | 'serving' | 'paused' | 'won' | 'gameover'
  pausedFrom: null, // modo al que volver al salir de pausa: 'playing' | 'serving'
  score: 0,
  lives: 3,
  serveTimer: 0, // segundos restantes para el relanzamiento automático
  paddle: { x: 192, y: 600, w: 96, h: 16, speed: 420 },
  ball: { x: 0, y: 0, size: 12, vx: 0, vy: 0, speed: 360, stuck: true },
  bricks: [],
  explosions: [],
};

function buildBricks() {
  const bricks = [];
  BRICK_ROWS.forEach( ( color, row ) => {
    for ( let col = 0; col < BRICK_COLS; col++ ) {
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

function resetGame() {
  state.mode = 'ready';
  state.pausedFrom = null;
  state.score = 0;
  state.lives = 3;
  state.serveTimer = 0;

  state.paddle.x = ( CANVAS_W - state.paddle.w ) / 2;

  const ball = state.ball;
  ball.vx = 0;
  ball.vy = 0;
  ball.stuck = true;
  ball.x = state.paddle.x + state.paddle.w / 2 - ball.size / 2;
  ball.y = state.paddle.y - ball.size;

  state.bricks = buildBricks();
  state.explosions = [];
}
