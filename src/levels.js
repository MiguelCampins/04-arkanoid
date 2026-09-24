const BRICK_COLORS = {
  R: 'red', P: 'hotpink', Y: 'yellow', G: 'green', C: 'cyan', M: 'magenta',
}; // '.' = hueco

const LEVELS = [
  [ // 1
    'RRRRRRRRRR',
    'YYYYYYYYYY',
    'GGGGGGGGGG',
    'CCCCCCCCCC',
  ],
  [ // 2
    'RRRRRRRRRR',
    'PPPPPPPPPP',
    'YYYYYYYYYY',
    'GGGGGGGGGG',
    'CCCCCCCCCC',
    'MMMMMMMMMM',
  ],
  [ // 3
    '....RR....',
    '...PPPP...',
    '..YYYYYY..',
    '.GGGGGGGG.',
    'CCCCCCCCCC',
    'MMMMMMMMMM',
  ],
  [ // 4
    'R.R.R.R.R.',
    '.P.P.P.P.P',
    'Y.Y.Y.Y.Y.',
    '.G.G.G.G.G',
    'C.C.C.C.C.',
    '.M.M.M.M.M',
    'R.R.R.R.R.',
    '.P.P.P.P.P',
  ],
  [ // 5
    'RR..YY..GG',
    'RR..YY..GG',
    'PP..CC..MM',
    'PP..CC..MM',
    'RR..YY..GG',
    'RR..YY..GG',
    'PP..CC..MM',
    'PP..CC..MM',
  ],
  [ // 6
    'MMMMMMMMMM',
    'M........M',
    'M.YYYYYY.M',
    'M.Y....Y.M',
    'M.Y.RR.Y.M',
    'M.YYYYYY.M',
    'M........M',
    'MMMMMMMMMM',
  ],
  [ // 7
    '....RR....',
    '...RPPR...',
    '..RPYYPR..',
    '.RPYGGYPR.',
    'RPYGCCGYPR',
    '.RPYGGYPR.',
    '..RPYYPR..',
    '...RPPR...',
    '....RR....',
  ],
  [ // 8
    '..G....G..',
    '...G..G...',
    '..GGGGGG..',
    '.GG.GG.GG.',
    'GGGGGGGGGG',
    'G.GGGGGG.G',
    'G.G....G.G',
    '...GG.GG..',
  ],
  [ // 9
    'RRRRRRRRRR',
    'PPPPPPPPPP',
    'YYYYYYYYYY',
    'GGGGGGGGGG',
    'CCCCCCCCCC',
    'MMMMMMMMMM',
    'RRRRRRRRRR',
    'PPPPPPPPPP',
  ],
  [ // 10
    'RRRRRRRRRR',
    'PPPPPPPPPP',
    'YYYYYYYYYY',
    'GGGGGGGGGG',
    'CCCCCCCCCC',
    'MMMMMMMMMM',
    'RRRRRRRRRR',
    'PPPPPPPPPP',
    'YYYYYYYYYY',
    'GGGGGGGGGG',
  ],
];
const MAX_LEVEL = LEVELS.length; // 10

const BASE_BALL_SPEED = 360; // px/s en el nivel 1
const BALL_SPEED_STEP = 20; // px/s por nivel
const LAUNCH_SPREAD = Math.PI / 6; // ±30° para el abanico multibola

function ballSpeedFor( level ) {
  return BASE_BALL_SPEED + ( level - 1 ) * BALL_SPEED_STEP;
}

function ballCountFor( level ) {
  return Math.ceil( level / 2 );
}
