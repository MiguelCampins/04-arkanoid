# SPEC 01 — MVP jugable de Arkanoid

> **Estado:** Borrador
> **Depende de:** —
> **Fecha:** 2026-09-23
> **Objetivo:** Un Arkanoid de un nivel, jugable con teclado en el navegador, con vidas, puntuación, sprites y sonido, sin dependencias.

---

## Alcance

**Dentro:**

- Canvas fijo de 480x640 px, centrado en la página.
- Pala controlada con teclado (`ArrowLeft`/`ArrowRight` y `A`/`D`).
- Bola que rebota en paredes laterales, techo, pala y ladrillos.
- Rebote en la pala con ángulo según el punto de impacto; velocidad de la bola constante.
- Un único nivel: rejilla de 6 filas x 10 columnas, un color por fila, 1 golpe por ladrillo, 10 puntos cada uno.
- 3 vidas. Si la bola cae por abajo se pierde una vida y la bola se relanza sola tras 1 s desde la pala.
- HUD dibujado en el canvas: puntuación y vidas.
- Estados: inicio, jugando, relanzando, pausa, victoria, game over.
- Gráficos con `assets/spritesheet.js` (pala, bola, ladrillos y animación de explosión).
- Sonidos `assets/sounds/ball-bounce.mp3` (rebote en pala/paredes) y `assets/sounds/break-sound.mp3` (ladrillo roto).
- Funciona abriendo `index.html` con doble clic (`file://`), sin servidor.

**Fuera de alcance (para futuras specs):**

- Varios niveles.
- Ladrillos duros (gris, varios golpes).
- Power-ups.
- Persistencia (high-score, best score, localStorage).
- Control con ratón y táctil / móvil.
- Canvas responsive o escalado a la ventana.
- Aceleración progresiva de la bola.
- Menús HTML, opciones de volumen o mute.

---

## Modelo de datos

```js
// src/state.js
const CANVAS_W = 480;
const CANVAS_H = 640;

const state = {
  mode: 'ready', // 'ready' | 'playing' | 'serving' | 'paused' | 'won' | 'gameover'
  pausedFrom: null, // modo al que volver al salir de pausa: 'playing' | 'serving'
  score: 0,
  lives: 3,
  serveTimer: 0, // segundos restantes para el relanzamiento automático
  paddle: { x: 192, y: 600, w: 96, h: 16, speed: 420 },
  ball: { x: 0, y: 0, size: 12, vx: 0, vy: 0, speed: 360, stuck: true },
  bricks: [ /* { x, y, w: 48, h: 24, color: 'red', alive: true } */ ],
  explosions: [ /* { x, y, color, t: 0 } */ ],
};

const BRICK_ROWS = [ 'red', 'hotpink', 'yellow', 'green', 'cyan', 'magenta' ];
const BRICK_COLS = 10;
const BRICK_W = 48;
const BRICK_H = 24;
const BRICKS_TOP = 64; // la franja 0–64 es para el HUD
const BRICK_POINTS = 10;
const SERVE_DELAY = 1; // s
const MAX_BOUNCE_ANGLE = Math.PI / 3; // 60° respecto a la vertical
```

```js
// src/input.js
const keys = { left: false, right: false };
```

Convenciones:

- Coordenadas: origen arriba-izquierda, en píxeles del canvas.
- Velocidades en px/segundo. Todo movimiento se multiplica por `dt`.
- `dt` en segundos, calculado con `requestAnimationFrame` y limitado a `1/30`.
- `ball.stuck === true` → la bola sigue a la pala, centrada encima de ella.
- Los nombres de color de `BRICK_ROWS` coinciden con las claves de `SPRITES.blocks` y `EXPLOSION_FRAMES`.

### Estados y transiciones

| Estado     | Entrada                                                  | Tecla / evento           | Pasa a                         |
| ---------- | -------------------------------------------------------- | ------------------------ | ------------------------------ |
| `ready`    | Carga de la página o reinicio. Bola pegada a la pala.    | `Espacio`                | `playing` (lanza la bola)      |
| `playing`  | Bola en movimiento.                                      | Bola cae y quedan vidas  | `serving`                      |
| `playing`  | —                                                        | Bola cae y `lives === 0` | `gameover`                     |
| `playing`  | —                                                        | Último ladrillo roto     | `won`                          |
| `serving`  | Bola pegada a la pala, `serveTimer = 1`.                 | `serveTimer <= 0`        | `playing` (lanza la bola)      |
| `playing` / `serving` | —                                             | `P` o `Escape`           | `paused`                       |
| `paused`   | Congela la simulación. Muestra "PAUSA".                  | `P` o `Escape`           | `pausedFrom`                   |
| `won`      | Muestra "¡VICTORIA!" y puntuación.                       | `Enter`                  | `ready` (reinicio completo)    |
| `gameover` | Muestra "GAME OVER" y puntuación.                        | `Enter`                  | `ready` (reinicio completo)    |

La pala se puede mover en `ready`, `playing` y `serving`.

---

## Archivos

| Archivo               | Rol                                                                        |
| --------------------- | -------------------------------------------------------------------------- |
| `index.html`          | Canvas `#game` y `<script>` clásicos en orden.                             |
| `style.css`           | Fondo, centrado del canvas.                                                |
| `assets/spritesheet.js` | Existente. Se reutiliza sin cambios.                                     |
| `src/state.js`        | Constantes, `state`, `resetGame()`, `buildBricks()`.                       |
| `src/input.js`        | `keys` y listeners de `keydown`/`keyup`.                                   |
| `src/audio.js`        | `playBounce()`, `playBreak()`.                                             |
| `src/physics.js`      | Movimiento de pala y bola, colisiones, pérdida de vida, victoria.          |
| `src/render.js`       | Dibujo de ladrillos, explosiones, pala, bola, HUD y textos de estado.      |
| `src/main.js`         | Bucle `requestAnimationFrame`, cálculo de `dt`, arranque tras cargar sprites. |

Orden de scripts en `index.html`: `assets/spritesheet.js`, `src/state.js`, `src/input.js`, `src/audio.js`, `src/physics.js`, `src/render.js`, `src/main.js`. Sin `type="module"`.

---

## Plan de implementación

1. **Esqueleto.** Crear `index.html` con `<canvas id="game" width="480" height="640">`, `style.css` con canvas centrado y fondo oscuro, y `src/main.js` que pinta el fondo del canvas en un bucle `requestAnimationFrame`. Prueba manual: abrir `index.html`, se ve un rectángulo negro centrado, consola sin errores.
2. **Estado y ladrillos.** Crear `src/state.js` con constantes, `state`, `buildBricks()` y `resetGame()`. Crear `src/render.js` que dibuja los 60 ladrillos con `drawSprite(ctx, 'block_' + color, ...)`. `main.js` llama a `loadSpritesheet()` antes de arrancar el bucle. Prueba: se ven 6 filas de colores.
3. **Pala y teclado.** Crear `src/input.js`. En `src/physics.js`, mover la pala con `keys` y `dt`, limitada a los bordes del canvas. Dibujar la pala con el sprite `paddle`. Prueba: la pala se mueve con flechas y A/D y no sale del canvas.
4. **Bola y paredes.** Dibujar la bola pegada a la pala (`stuck`). `Espacio` en `ready` la lanza hacia arriba con ángulo aleatorio en ±15°. Rebote en paredes laterales y techo. Si `ball.y > CANVAS_H`, la bola vuelve a pegarse (provisional). Prueba: la bola rebota en tres paredes.
5. **Rebote en la pala.** Colisión AABB bola-pala solo cuando `vy > 0`. Calcular `rel = (ballCenterX - paddleCenterX) / (paddle.w / 2)` limitado a [-1, 1], ángulo `rel * MAX_BOUNCE_ANGLE`, y recomponer `vx`, `vy` con `ball.speed`. Prueba: golpear con el borde inclina la salida; con el centro sale casi vertical.
6. **Ladrillos.** Colisión AABB bola-ladrillo; como máximo un ladrillo por frame. Invertir `vx` o `vy` según el eje de menor penetración. Marcar `alive = false`, sumar `BRICK_POINTS` y añadir una entrada a `state.explosions`. Prueba: los ladrillos desaparecen al golpearlos.
7. **Explosiones.** Avanzar `t` de cada explosión con `dt` y dibujar el frame de `EXPLOSION_FRAMES[color]` correspondiente a `t / EXPLOSION_DURATION`. Eliminar la explosión tras `EXPLOSION_DURATION` ms. Prueba: cada ladrillo roto muestra una animación breve.
8. **Vidas y estados.** Sustituir el comportamiento provisional del paso 4 por la tabla de transiciones: pérdida de vida → `serving` con relanzamiento automático a 1 s; `lives === 0` → `gameover`; sin ladrillos vivos → `won`; `P`/`Escape` pausa; `Enter` reinicia desde `won`/`gameover`. Prueba: recorrer todos los estados manualmente.
9. **HUD y textos.** En `render.js`, dibujar `SCORE: n` a la izquierda y `VIDAS: n` a la derecha en la franja 0–64. Dibujar el texto central de cada estado: `ready` → "Pulsa ESPACIO", `paused` → "PAUSA", `won` → "¡VICTORIA!" + "Pulsa ENTER", `gameover` → "GAME OVER" + "Pulsa ENTER". Prueba: los textos aparecen en cada estado.
10. **Sonido.** Crear `src/audio.js` con dos `Audio` precargados. Cada `play*()` hace `currentTime = 0` y `play().catch(() => {})`. Llamar `playBounce()` en rebote de pala y paredes, `playBreak()` al romper un ladrillo. Prueba: se oyen los sonidos; si el navegador bloquea el audio, el juego sigue sin errores.

---

## Criterios de aceptación

- [ ] Abrir `index.html` con doble clic (`file://`) carga el juego sin errores en consola.
- [ ] El canvas mide 480x640 y está centrado horizontalmente.
- [ ] Al cargar se ven 60 ladrillos en 6 filas de colores distintos y el texto "Pulsa ESPACIO".
- [ ] `ArrowLeft`/`ArrowRight` y `A`/`D` mueven la pala; la pala nunca sale del canvas.
- [ ] En `ready`, la bola se mueve pegada a la pala; `Espacio` la lanza.
- [ ] La bola rebota en las paredes laterales y en el techo.
- [ ] Golpear la bola con el borde de la pala produce una salida más inclinada que golpearla con el centro.
- [ ] La velocidad de la bola es la misma antes y después de rebotar en la pala.
- [ ] Romper un ladrillo lo elimina, suma exactamente 10 puntos al HUD y muestra la animación de explosión.
- [ ] Perder la bola resta una vida en el HUD y la bola sale sola desde la pala ~1 s después.
- [ ] Perder la tercera vida muestra "GAME OVER".
- [ ] Romper los 60 ladrillos muestra "¡VICTORIA!" con 600 puntos.
- [ ] `Enter` en victoria o game over reinicia: 60 ladrillos, 3 vidas, 0 puntos, estado `ready`.
- [ ] `P` o `Escape` durante el juego congela bola y pala y muestra "PAUSA"; pulsarlo otra vez reanuda.
- [ ] Suena `ball-bounce.mp3` al rebotar en pala o pared y `break-sound.mp3` al romper un ladrillo.
- [ ] La velocidad de la bola es visualmente la misma en un monitor de 60 Hz y en uno de 144 Hz.
- [ ] El proyecto no tiene dependencias externas (ni `package.json` ni CDN).

---

## Decisiones

- **Sí:** un solo nivel con vidas, puntuación y pantallas de fin. Mínimo que se siente como juego completo.
- **No:** varios niveles. Van en su propia spec.
- **Sí:** solo teclado. Mantiene el MVP pequeño.
- **No:** ratón ni táctil. Posible spec futura de controles.
- **Sí:** reutilizar `assets/spritesheet.js` y los `.mp3` existentes. Ya están en el repo y dan acabado visual.
- **Sí:** scripts clásicos en `src/*.js` con variables globales. Funcionan desde `file://`.
- **No:** módulos ES. Requieren servidor local por CORS en `file://`.
- **No:** un único `game.js`. Crece mal.
- **Sí:** canvas fijo 480x640. 10 ladrillos de 48 px llenan el ancho exacto.
- **No:** escalado responsive. Complejidad innecesaria para el MVP.
- **Sí:** delta time en px/s con `dt` limitado a 1/30 s. Velocidad independiente de la frecuencia del monitor y sin saltos enormes tras cambiar de pestaña.
- **No:** px/frame. El juego iría más rápido en monitores de alta frecuencia.
- **Sí:** ángulo de rebote según punto de impacto, velocidad constante. Da control al jugador y evita bucles.
- **No:** aceleración progresiva. Se puede añadir en una spec de dificultad.
- **Sí:** relanzamiento automático tras 1 s al perder una vida; los ladrillos rotos se mantienen.
- **No:** relanzar con `Espacio` tras perder vida. Elegido por el usuario.
- **Sí:** 10 puntos por ladrillo, todos iguales. Simple y verificable (600 = victoria).
- **No:** puntos por color ni ladrillos duros. Futuras specs.
- **Sí:** sin persistencia. La puntuación se pierde al recargar.
- **Sí:** orden de colores de filas `red, hotpink, yellow, green, cyan, magenta`. Cualquier orden con 6 colores distintos cumple; este es el elegido.

---

## Riesgos

| Riesgo                                                          | Mitigación                                                                                   |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| El navegador bloquea `audio.play()` antes de interacción        | El primer sonido llega tras pulsar `Espacio`. `play().catch(() => {})` evita errores.         |
| Tunneling: la bola atraviesa un ladrillo en un frame largo      | `dt` limitado a 1/30 s → máx. 12 px por paso, menor que el alto del ladrillo (24 px).         |
| La bola rebota dos veces en la pala y queda atrapada            | Colisión con la pala solo si `vy > 0`; tras el rebote se recoloca la bola encima de la pala.  |
| El spritesheet tarda en cargar y se dibuja vacío                | El bucle arranca en el callback de `loadSpritesheet()`.                                       |
| `EXPLOSION_FRAMES.gray` apunta a los frames de `red` en `assets/spritesheet.js` | No afecta: el MVP no usa ladrillos grises. Se deja sin cambios.                |

---

## Lo que **no** entra en esta spec

- Varios niveles.
- Ladrillos duros o de varios golpes.
- Power-ups.
- High-score o cualquier persistencia.
- Control con ratón, táctil o versión móvil.
- Canvas responsive.
- Aceleración de la bola.
- Opciones de volumen o mute.

Cada uno de estos, si llega, va en su propia spec.
