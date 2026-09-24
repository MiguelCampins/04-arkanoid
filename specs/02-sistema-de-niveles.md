# SPEC 02 — Sistema de 10 niveles

> **Estado:** Aprobado
> **Depende de:** SPEC 01
> **Fecha:** 2026-09-24
> **Objetivo:** 10 niveles con mapas propios, donde cada nivel sube la velocidad de la bola y cada dos niveles se añade una bola simultánea más.

---

## Alcance

**Dentro:**

- 10 niveles definidos como mapas ASCII en `src/levels.js`.
- Cada nivel tiene su propio mapa de ladrillos (hasta 10 filas x 10 columnas, los 6 colores existentes).
- Velocidad de la bola: 360 px/s en el nivel 1, +20 px/s por nivel (540 px/s en el nivel 10).
- Número de bolas por nivel: 1 bola en niveles 1–2, 2 en 3–4, 3 en 5–6, 4 en 7–8, 5 en 9–10.
- Todas las bolas del nivel salen a la vez con `Espacio`, en abanico de ±30°.
- Se pierde una vida solo cuando caen todas las bolas en juego.
- Tras perder una vida se relanza **una sola bola** (relanzamiento automático a 1 s, como en SPEC 01).
- Al romper el último ladrillo de los niveles 1–9 se carga el siguiente nivel de inmediato, sin mensaje, en estado `ready`.
- Puntuación y vidas se conservan entre niveles.
- "¡VICTORIA!" solo al completar el nivel 10.
- `Enter` en victoria o game over reinicia en el nivel 1 con 3 vidas y 0 puntos.
- HUD: `NIVEL n` centrado en la franja superior.

**Fuera de alcance (para futuras specs):**

- Pantalla o mensaje de transición entre niveles.
- Atajos de prueba (parámetro URL, tecla de trampa, selector de nivel).
- Colisión entre bolas.
- Ladrillos duros (gris, varios golpes).
- Power-ups (incluida la multibola como power-up).
- Vidas extra al superar nivel.
- Reducir el tamaño de la pala por nivel.
- Persistencia (nivel alcanzado, high-score).
- Editor de niveles o niveles cargados desde archivo externo.

---

## Modelo de datos

```js
// src/levels.js
const BRICK_COLORS = {
  R: 'red', P: 'hotpink', Y: 'yellow', G: 'green', C: 'cyan', M: 'magenta',
}; // '.' = hueco

const LEVELS = [ /* 10 mapas; cada mapa es un array de strings de 10 caracteres */ ];
const MAX_LEVEL = LEVELS.length; // 10

const BASE_BALL_SPEED = 360; // px/s en el nivel 1
const BALL_SPEED_STEP = 20;  // px/s por nivel
const LAUNCH_SPREAD = Math.PI / 6; // ±30° para el abanico multibola

function ballSpeedFor( level ) { /* BASE_BALL_SPEED + (level - 1) * BALL_SPEED_STEP */ }
function ballCountFor( level ) { /* Math.ceil(level / 2) */ }
```

```js
// src/state.js — cambios sobre SPEC 01
const state = {
  // ...campos de SPEC 01 sin cambios (mode, pausedFrom, score, lives, serveTimer, paddle, bricks, explosions)
  level: 1,                 // 1..MAX_LEVEL
  ballSpeed: 360,           // px/s, = ballSpeedFor(level)
  balls: [ /* { x, y, size: 12, vx, vy, stuck } */ ], // sustituye a state.ball
};

function buildBricks( level ) { /* lee LEVELS[level - 1] */ }
function loadLevel( level ) { /* level, ballSpeed, bricks, balls pegadas a la pala, mode = 'ready' */ }
function resetGame() { /* score = 0, lives = 3, loadLevel(1) */ }
```

Cambios respecto a SPEC 01:

- Se elimina `BRICK_ROWS`. Los colores salen de `BRICK_COLORS` según el mapa.
- Se elimina `state.ball`. Pasa a `state.balls` (array).
- Se elimina `ball.speed`. La velocidad es `state.ballSpeed`, común a todas las bolas.
- `buildBricks()` recibe el nivel. Columna `c`, fila `r` → `x = c * BRICK_W`, `y = BRICKS_TOP + r * BRICK_H`.

Convenciones:

- Cada string del mapa tiene exactamente 10 caracteres. Un mapa tiene como máximo 10 filas (ocupa y = 64–304).
- Caracteres válidos: `R P Y G C M .`.
- Los niveles se numeran desde 1. `LEVELS[0]` es el nivel 1.

### Mapas

| Nivel | Bolas | Velocidad | Ladrillos |
| ----- | ----- | --------- | --------- |
| 1     | 1     | 360       | 40        |
| 2     | 1     | 380       | 60        |
| 3     | 2     | 400       | 40        |
| 4     | 2     | 420       | 40        |
| 5     | 3     | 440       | 48        |
| 6     | 3     | 460       | 50        |
| 7     | 4     | 480       | 50        |
| 8     | 4     | 500       | 42        |
| 9     | 5     | 520       | 80        |
| 10    | 5     | 540       | 100       |

Total: 550 ladrillos → 5500 puntos al completar el nivel 10.

```text
Nivel 1        Nivel 2        Nivel 3        Nivel 4        Nivel 5
RRRRRRRRRR     RRRRRRRRRR     ....RR....     R.R.R.R.R.     RR..YY..GG
YYYYYYYYYY     PPPPPPPPPP     ...PPPP...     .P.P.P.P.P     RR..YY..GG
GGGGGGGGGG     YYYYYYYYYY     ..YYYYYY..     Y.Y.Y.Y.Y.     PP..CC..MM
CCCCCCCCCC     GGGGGGGGGG     .GGGGGGGG.     .G.G.G.G.G     PP..CC..MM
               CCCCCCCCCC     CCCCCCCCCC     C.C.C.C.C.     RR..YY..GG
               MMMMMMMMMM     MMMMMMMMMM     .M.M.M.M.M     RR..YY..GG
                                             R.R.R.R.R.     PP..CC..MM
                                             .P.P.P.P.P     PP..CC..MM

Nivel 6        Nivel 7        Nivel 8        Nivel 9        Nivel 10
MMMMMMMMMM     ....RR....     ..G....G..     RRRRRRRRRR     RRRRRRRRRR
M........M     ...RPPR...     ...G..G...     PPPPPPPPPP     PPPPPPPPPP
M.YYYYYY.M     ..RPYYPR..     ..GGGGGG..     YYYYYYYYYY     YYYYYYYYYY
M.Y....Y.M     .RPYGGYPR.     .GG.GG.GG.     GGGGGGGGGG     GGGGGGGGGG
M.Y.RR.Y.M     RPYGCCGYPR     GGGGGGGGGG     CCCCCCCCCC     CCCCCCCCCC
M.YYYYYY.M     .RPYGGYPR.     G.GGGGGG.G     MMMMMMMMMM     MMMMMMMMMM
M........M     ..RPYYPR..     G.G....G.G     RRRRRRRRRR     RRRRRRRRRR
MMMMMMMMMM     ...RPPR...     ...GG.GG..     PPPPPPPPPP     PPPPPPPPPP
               ....RR....                                   YYYYYYYYYY
                                                            GGGGGGGGGG
```

### Estados y transiciones

Solo se listan las filas que cambian o se añaden respecto a SPEC 01.

| Estado     | Entrada                                                              | Tecla / evento                                 | Pasa a                                        |
| ---------- | -------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------- |
| `ready`    | Inicio de nivel. `ballCountFor(level)` bolas pegadas a la pala.      | `Espacio`                                      | `playing` (lanza todas en abanico)            |
| `playing`  | —                                                                    | Cae una bola y quedan otras en juego           | `playing` (se elimina esa bola)               |
| `playing`  | —                                                                    | Cae la última bola y quedan vidas              | `serving` (1 bola pegada)                     |
| `playing`  | —                                                                    | Cae la última bola y `lives === 0`             | `gameover`                                    |
| `playing`  | —                                                                    | Último ladrillo roto y `level < MAX_LEVEL`     | `ready` (`loadLevel(level + 1)`)              |
| `playing`  | —                                                                    | Último ladrillo roto y `level === MAX_LEVEL`   | `won`                                         |
| `serving`  | 1 bola pegada, `serveTimer = 1`.                                     | `serveTimer <= 0`                              | `playing` (lanza esa bola, ángulo ±15°)       |
| `won` / `gameover` | —                                                            | `Enter`                                        | `ready` (`resetGame()`, nivel 1)              |

Si en el mismo frame se rompe el último ladrillo y cae la última bola, gana el ladrillo: se pasa de nivel (o a `won`) y no se pierde vida.

### Lanzamiento

- 1 bola: ángulo aleatorio en ±15° (igual que SPEC 01).
- N > 1 bolas: ángulos repartidos uniformemente de −30° a +30°. Bola `i` → `-LAUNCH_SPREAD + i * 2 * LAUNCH_SPREAD / (N - 1)`.
- Todas salen desde el mismo punto sobre la pala, a `state.ballSpeed`.

---

## Archivos

| Archivo           | Cambio                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `src/levels.js`   | **Nuevo.** `BRICK_COLORS`, `LEVELS`, `MAX_LEVEL`, constantes de velocidad, `ballSpeedFor()`, `ballCountFor()`. |
| `src/state.js`    | Quita `BRICK_ROWS` y `state.ball`. Añade `level`, `ballSpeed`, `balls`, `loadLevel()`. `buildBricks(level)`. |
| `src/physics.js`  | Bucle sobre `state.balls`. Lanzamiento en abanico. Pérdida de vida al caer la última bola. Paso de nivel. |
| `src/input.js`    | `Espacio` en `ready` lanza todas las bolas.                                              |
| `src/render.js`   | Dibuja todas las bolas. HUD `NIVEL n` centrado.                                           |
| `index.html`      | Añade `<script src="src/levels.js">` justo antes de `src/state.js`.                      |

---

## Plan de implementación

1. **Mapas.** Crear `src/levels.js` con `BRICK_COLORS`, los 10 `LEVELS` de la sección Mapas, `MAX_LEVEL` y constantes. Cargarlo en `index.html` antes de `state.js`. Cambiar `buildBricks(level)` para leer `LEVELS[level - 1]` y quitar `BRICK_ROWS`. Añadir `state.level = 1`. Prueba: al cargar se ven los 40 ladrillos del nivel 1 (4 filas).
2. **Paso de nivel.** Añadir `loadLevel(level)` (ladrillos, bola pegada, `mode = 'ready'`). `resetGame()` pone `score = 0`, `lives = 3` y llama a `loadLevel(1)`. Al romper el último ladrillo: `level < MAX_LEVEL` → `loadLevel(level + 1)`; si no, `won`. Prueba: superar el nivel 1 carga el mapa del nivel 2 (60 ladrillos) en `ready`, con puntos y vidas intactos.
3. **HUD de nivel.** En `drawHud()`, dibujar `NIVEL n` centrado en la franja 0–64. Prueba: el HUD muestra `NIVEL 1` y `NIVEL 2` tras pasar de nivel.
4. **Velocidad por nivel.** Añadir `state.ballSpeed`, fijado en `loadLevel()` con `ballSpeedFor(level)`. Sustituir `ball.speed` por `state.ballSpeed` en lanzamiento y rebote en pala. Prueba: la bola del nivel 2 va visiblemente más rápida que la del nivel 1.
5. **Array de bolas (refactor).** Sustituir `state.ball` por `state.balls` con una sola bola. `updateBall(b, dt)`, `collidePaddle(b)`, `collideBricks(b)` reciben la bola. `drawBalls()` recorre el array. Sin cambio de comportamiento. Prueba: niveles 1–2 se juegan igual que tras el paso 4.
6. **Multibola: lanzamiento.** `loadLevel()` crea `ballCountFor(level)` bolas pegadas. `launchBalls()` aplica el abanico de la sección Lanzamiento. Prueba: en el nivel 3, `Espacio` lanza 2 bolas en direcciones distintas.
7. **Multibola: pérdida.** Una bola que cae se elimina de `state.balls`. Si el array queda vacío → `loseLife()`: crea 1 bola pegada y pasa a `serving` (o `gameover`). Aplicar la prioridad "último ladrillo antes que última bola". Prueba: en el nivel 3, perder una bola no resta vida; perder la segunda sí, y se relanza una sola bola.

---

## Criterios de aceptación

- [ ] Abrir `index.html` con doble clic (`file://`) carga el juego sin errores en consola.
- [ ] Al cargar se ve el mapa del nivel 1 (40 ladrillos, 4 filas) y el HUD muestra `NIVEL 1`.
- [ ] Romper el último ladrillo del nivel 1 carga al instante el mapa del nivel 2, sin mensaje, en estado `ready` ("Pulsa ESPACIO").
- [ ] Al pasar de nivel, puntuación y vidas no cambian.
- [ ] El HUD muestra `NIVEL n` con el nivel actual en todo momento.
- [ ] Cada nivel del 1 al 10 muestra exactamente el mapa y número de ladrillos de la tabla Mapas.
- [ ] La velocidad de la bola en el nivel n es `360 + 20 * (n - 1)` px/s y no cambia al rebotar en la pala.
- [ ] En `ready`, `Espacio` lanza 1 bola en niveles 1–2, 2 en 3–4, 3 en 5–6, 4 en 7–8 y 5 en 9–10.
- [ ] Con varias bolas, salen a la vez en direcciones distintas dentro de ±30°.
- [ ] Perder una bola con otras aún en juego no resta vida.
- [ ] Perder la última bola en juego resta una vida y ~1 s después sale sola **una** bola.
- [ ] Perder la tercera vida en cualquier nivel muestra "GAME OVER".
- [ ] Romper el último ladrillo del nivel 10 muestra "¡VICTORIA!". Sin perder puntos por el camino, la puntuación es 5500.
- [ ] `Enter` en victoria o game over vuelve al nivel 1 con 40 ladrillos, 3 vidas, 0 puntos y estado `ready`.
- [ ] `P` o `Escape` pausa y reanuda con varias bolas en juego; todas se congelan.
- [ ] La bola no atraviesa ladrillos sin romperlos en el nivel 10 (540 px/s).
- [ ] No hay atajos para saltar niveles.

---

## Decisiones

- **Sí:** mapas ASCII escritos a mano en `src/levels.js`. Control total sobre cada nivel y fácil de revisar en la spec.
- **No:** generación procedural. Menos control y más difícil de verificar.
- **No:** mismo mapa en todos los niveles. Elegido por el usuario: cada nivel tiene su mapa.
- **Sí:** mapas propuestos en esta spec. Se revisan al aprobarla.
- **Sí:** +20 px/s por nivel (lineal). A 540 px/s y `dt` máx. 1/30 s, la bola avanza 18 px por paso, menos que el alto de un ladrillo (24 px).
- **No:** +30 px/s ni +10% multiplicativo. Se acercan o superan el límite de tunneling y exigirían sub-pasos.
- **Sí:** bola extra cada 2 niveles, simultáneas desde el inicio (`Math.ceil(level / 2)`).
- **No:** bola extra a mitad de nivel ni bola extra como vida extra.
- **Sí:** tras perder vida se relanza una sola bola. Elegido por el usuario: más difícil tras un fallo.
- **No:** restaurar todas las bolas del nivel al perder vida.
- **Sí:** lanzamiento en abanico ±30° con `Espacio`. Evita que las bolas salgan superpuestas.
- **No:** lanzamiento escalonado.
- **Sí:** las bolas no chocan entre sí. Simplifica la física.
- **Sí:** velocidad común a todas las bolas (`state.ballSpeed`), no por bola.
- **Sí:** paso de nivel inmediato, sin mensaje, a `ready`. El jugador decide cuándo lanzar.
- **No:** pantalla "NIVEL N SUPERADO" ni avance automático tras 2 s.
- **Sí:** vidas y puntos se conservan entre niveles; game over vuelve al nivel 1. Arcade clásico.
- **No:** reponer vidas por nivel ni continuar desde el nivel perdido.
- **Sí:** `NIVEL n` en el HUD; "¡VICTORIA!" solo tras el nivel 10.
- **Sí:** si en el mismo frame se rompe el último ladrillo y cae la última bola, gana el ladrillo. Evita perder vida al completar el nivel.
- **Sí:** las explosiones en curso se mantienen al cargar el nivel siguiente. La animación del último ladrillo termina.
- **No:** atajos de prueba (`?level=N` o tecla de trampa). Elegido por el usuario: se verifica jugando.
- **Sí:** 10 puntos por ladrillo, sin cambios respecto a SPEC 01.

---

## Riesgos

| Riesgo                                                            | Mitigación                                                                                       |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Tunneling a 540 px/s                                              | `dt` limitado a 1/30 s → 18 px por paso, menor que el alto del ladrillo (24 px) y del cruce bola-pala (28 px). |
| Verificar niveles altos exige jugar los 10 niveles                | Decisión consciente: sin atajos. La verificación de niveles 9–10 lleva tiempo.                   |
| Con 5 bolas, varios sonidos en el mismo frame se cortan entre sí  | `play*()` reinicia `currentTime`; se oye un solo sonido. Aceptable.                              |
| Un mapa mal escrito (string de ≠10 caracteres o carácter inválido) | Revisar los mapas contra la tabla al implementar. Caracteres desconocidos se tratan como hueco. |
| Bolas pegadas se dibujan superpuestas en `ready`                  | Se ven como una sola. El abanico las separa al lanzar.                                           |

---

## Lo que **no** entra en esta spec

- Pantalla o mensaje entre niveles.
- Atajos de prueba o selector de nivel.
- Colisión entre bolas.
- Ladrillos duros.
- Power-ups.
- Vidas extra por nivel.
- Pala más pequeña por nivel.
- Persistencia de nivel o high-score.
- Editor de niveles o carga desde archivo.

Cada uno de estos, si llega, va en su propia spec.
