# SPEC 01 — MVP visual: pantallas de Arcade Vault

> **Estado:** Aprobado
> **Depende de:** —
> **Fecha:** 2026-08-28
> **Objetivo:** Portar las cinco pantallas del prototipo de `references/templates/` a rutas reales del App Router, solo como interfaz, sin ningún juego jugable.

---

## 1 — Por qué existe esta spec

El prototipo de `references/templates/` es una SPA de React 18 servida por `@babel/standalone`, con routing por hash y variables globales en `window`. El CSS ya fue portado a `app/globals.css` en la rama `01-styles` (982 líneas, mismos selectores que `styles.css`, tokens expuestos en `@theme inline`). Lo que falta es el markup: `app/page.tsx` sigue siendo el scaffold de `create-next-app`.

Esta spec traduce el prototipo a Next 16 / React 19 respetando dos límites:

- **Solo visual.** No hay lógica de juego, ni backend, ni sesión real.
- **Sin regresión visual.** El markup reutiliza las clases CSS ya portadas en vez de reescribirlas en utilidades Tailwind.

---

## 2 — Alcance

**Dentro:**

- Cinco rutas nuevas del App Router más una pantalla 404:
  - `/` → Biblioteca (hero, buscador, filtros por categoría, grid de tarjetas).
  - `/juegos/[id]` → Detalle del juego (portada, tags, descripción, stats, tabla de mejores puntuaciones).
  - `/juegos/[id]/jugar` → Reproductor (HUD, marco CRT, arena decorativa, overlay de pausa, modal de fin de juego).
  - `/auth` → Acceso (tabs Iniciar sesión / Crear cuenta, formulario, botones sociales decorativos).
  - `/salon` → Salón de la Fama (tabs por juego, podio, tabla top-12, fila destacada del jugador demo).
  - `app/not-found.tsx` → 404 con estilo arcade.
- Barra de navegación y footer compartidos, montados en `app/layout.tsx`.
- Panel de navegación móvil (hamburguesa + backdrop) usando `.av-mobile-panel` / `.av-mobile-backdrop`.
- Datos mock portados a TypeScript en `lib/games.ts` y `lib/scores.ts`.
- `generateStaticParams` y `generateMetadata` en las dos rutas de juego.
- Interactividad puramente de interfaz: buscador, chips de categoría, tabs, hamburguesa, tilt de tarjeta, overlays del reproductor.

**Fuera de alcance (para specs futuras):**

- Cualquier juego jugable. Ninguno de los 8 títulos se implementa.
- Autenticación real, sesión, `localStorage` (`av_user`, `av_scores`) o estado de usuario compartido.
- Backend, base de datos o persistencia de puntuaciones.
- Reescritura del CSS portado a utilidades Tailwind.
- Tests automatizados. No hay runner configurado y esta spec no elige uno.
- El contador de créditos del nav funcional; queda como texto fijo `CRÉDITOS · 03`.
- Login social con Google / GitHub; los botones son decorativos.

---

## 3 — Modelo de datos

No hay persistencia. Todos los datos son constantes en módulos de `lib/`, importables desde server components.

### `lib/games.ts`

```ts
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";

export type Game = {
  id: string;          // slug de la ruta: "bloque-buster", "caida", ...
  title: string;       // "BLOQUE BUSTER"
  short: string;       // descripción de una línea para la tarjeta
  long: string;        // párrafo para el detalle
  cat: GameCategory;
  cover: string;       // clase CSS de portada: "cover-bricks", "cover-tetro", ...
  color: "cyan" | "magenta" | "yellow" | "green"; // variante del botón JUGAR
  best: number;        // mejor puntuación global
  plays: string;       // "12.4K"
};

export const GAMES: Game[];                    // los 8 juegos de data.jsx, mismo orden
export const CATS: readonly string[];          // ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"]
export function getGame(id: string): Game | undefined;
```

Los 8 juegos se copian literalmente de `references/templates/data.jsx`: `bloque-buster`, `caida`, `serpentina`, `gloton`, `invasores`, `rocas`, `ranaria`, `duelo-pixel`. Textos en español, sin retocar.

### `lib/scores.ts`

```ts
export type ScoreRow = {
  rank: number;
  name: string;    // "PX_KAI"
  score: number;
  date: string;    // "07/03/2026"
};

export const PLAYERS: readonly string[];       // los 18 nicks de data.jsx
export function seededScores(seed: number, count?: number): ScoreRow[];
```

`seededScores` se porta tal cual, con el mismo LCG (`s = (s * 9301 + 49297) % 233280`). Es determinista, así que produce la misma tabla en servidor y en cliente y no rompe la hidratación.

Semillas, idénticas a las del prototipo:

| Pantalla                    | Semilla              | Filas |
| --------------------------- | -------------------- | ----- |
| Detalle (`/juegos/[id]`)    | `id.length * 17 + 3` | 10    |
| Salón (`/salon`, por tab)   | `id.length * 23 + 7` | 12    |

### Jugador demo del Salón

Constante local del componente del Salón, no un modelo compartido:

```ts
const DEMO_PLAYER = "PLAYER1";
const demoRank  = 8 + (activeGameId.length % 4);   // igual que el prototipo
const demoScore = rows[5].score - 2400;
const demoDate  = "11/05/2026";
```

### Puntuación del reproductor

Constante derivada del juego: el HUD muestra `game.best` como puntuación fija, `3` vidas y nivel `01`. No hay contador ni intervalo.

---

## 4 — Plan de implementación

Cada paso deja el proyecto compilando (`npx tsc --noEmit`) y navegable.

1. **`lib/games.ts`.** Portar tipos, `GAMES`, `CATS` y `getGame`. Verificación: `npx tsc --noEmit` pasa.
2. **`lib/scores.ts`.** Portar `ScoreRow`, `PLAYERS` y `seededScores`. Verificación: `seededScores(20, 10)` devuelve 10 filas con `rank` de 1 a 10 y `score` descendente.
3. **`components/nav.tsx`** (`"use client"`). Logo, enlaces Biblioteca / Salón de la Fama, contador de créditos, botón `Iniciar Sesión` como `Link` a `/auth`, hamburguesa y panel móvil. El estado activo sale de `usePathname()`: Biblioteca está activa en `/` y en cualquier `/juegos/...`. Marcado idéntico a `nav.jsx`, con `Link` en vez de `onClick`.
4. **`components/footer.tsx`.** Server component con el texto `© 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0`. Los estilos inline del prototipo se expresan con utilidades Tailwind sobre los tokens ya existentes (`border-line`, `text-ink-faint`, `font-mono`).
5. **Montar el chrome en `app/layout.tsx`.** Insertar `<Nav />` antes de `<main className="av-main">` y `<Footer />` después, dentro de `.av-root`. Verificación: `npm run dev` muestra nav y footer sobre el fondo de rejilla en todas las rutas.
6. **`components/game-card.tsx`** (`"use client"`). Tarjeta con portada, categoría, título, descripción corta, badge de mejor puntuación y botón `JUGAR`. Conserva el tilt con `onMouseMove` / `onMouseLeave` sobre un `useRef`. Toda la tarjeta es un `Link` a `/juegos/[id]`.
7. **`components/library-browser.tsx`** (`"use client"`). Recibe `GAMES` y `CATS` por props. Estado local de búsqueda y categoría, filtrado con `useMemo`, grid `.av-grid` y el bloque vacío `NO HAY RESULTADOS`.
8. **`app/page.tsx`.** Server component: hero `.av-hero` con `ARCADE VAULT` y `INSERTA UNA MONEDA PARA JUGAR`, más `<LibraryBrowser games={GAMES} cats={CATS} />`. Sustituye por completo el scaffold de `create-next-app` (incluido el `import Image`). Verificación: `/` muestra las 8 tarjetas y filtra al escribir.
9. **`app/not-found.tsx`.** Pantalla 404 arcade: `GAME OVER`, `404 · PANTALLA NO ENCONTRADA` y botón `VOLVER AL VAULT`. Reutiliza `.pixel`, `.neon-magenta` y `.btn`; no añade CSS nuevo.
10. **`components/leaderboard.tsx`.** Server component que recibe `ScoreRow[]` y pinta `.leaderboard` con las clases `top1` / `top2` / `top3`.
11. **`app/juegos/[id]/page.tsx`.** Server component. `const { id } = await params`; si `getGame(id)` es `undefined`, llamar a `notFound()`. Pinta `.av-detail` con portada, tags, descripción larga, `stat-strip` y los botones `▶ JUGAR AHORA` (`Link` a `/juegos/[id]/jugar`) y `VOLVER AL VAULT` (`Link` a `/`). Añadir `generateStaticParams` y `generateMetadata`.
12. **`components/game-player.tsx`** (`"use client"`). Recibe el `Game` por props. HUD con jugador `INVITADO`, puntuación fija, vidas y nivel; marco `.crt` con `.game-arena`; dos estados locales booleanos (`paused`, `over`) que solo muestran u ocultan el overlay `EN PAUSA` y el modal `FIN DEL JUEGO`. `GUARDAR PUNTUACIÓN` cambia el texto por `▸ PUNTUACIÓN GUARDADA_` y no escribe en ningún sitio.
13. **`app/juegos/[id]/jugar/page.tsx`.** Server component con la misma resolución de `id` y `notFound()`, `generateStaticParams` y `generateMetadata`; renderiza `<GamePlayer game={game} />`. Verificación: `PAUSA` y `FIN` muestran sus overlays; `SALIR` vuelve al detalle.
14. **`components/auth-form.tsx`** (`"use client"`). Tabs `INICIAR SESIÓN` / `CREAR CUENTA`, inputs controlados, campo de email que aparece con `.slide-in` solo en el tab de alta, divisor `O CONTINÚA CON` y los dos botones sociales decorativos. `onSubmit` hace `e.preventDefault()` y `router.push("/")`. `JUGAR COMO INVITADO` es un `Link` a `/`.
15. **`app/auth/page.tsx`.** Server component que envuelve `<AuthForm />` en `.av-auth-wrap`. Verificación: enviar el formulario navega a `/`.
16. **`components/hall-of-fame.tsx`** (`"use client"`). Recibe `GAMES`. Tab activa por defecto `GAMES[0].id`, chips por juego, podio (plata / oro / bronce), tabla top-12 con retardos de animación escalonados (`50ms` por fila) y la fila fija del jugador demo con `.tr.you-label` y `.tr.you`. Botón final `VOLVER A LA BIBLIOTECA` como `Link` a `/`.
17. **`app/salon/page.tsx`.** Server component con la cabecera `SALÓN DE LA FAMA` y `<HallOfFame games={GAMES} />`.
18. **Cierre.** Ejecutar `npm run lint`, `npx tsc --noEmit` y `npm run build`, y corregir lo que salga.

---

## 5 — Criterios de aceptación

- [ ] `npm run lint` termina sin errores ni warnings.
- [ ] `npx tsc --noEmit` termina sin errores.
- [ ] `npm run build` termina sin errores y prerenderiza las 8 rutas `/juegos/[id]` y las 8 `/juegos/[id]/jugar`.
- [ ] No queda ningún rastro del scaffold de `create-next-app` en `app/page.tsx`.
- [ ] La consola del navegador no muestra errores ni avisos de hidratación en ninguna de las seis pantallas.
- [ ] `/` muestra el hero, el buscador, los 5 chips de categoría y 8 tarjetas de juego.
- [ ] Escribir `serp` en el buscador de `/` deja exactamente una tarjeta visible (`SERPENTINA`).
- [ ] Seleccionar el chip `PUZZLE` en `/` deja exactamente una tarjeta visible (`CAÍDA`).
- [ ] Una búsqueda sin resultados muestra el bloque `NO HAY RESULTADOS`.
- [ ] Hacer clic en una tarjeta navega a `/juegos/<id>` y la URL cambia en la barra de direcciones.
- [ ] `/juegos/caida` muestra portada, los 4 tags, descripción larga, las 3 stats y 10 filas de puntuaciones.
- [ ] La tabla de `/juegos/caida` es idéntica tras recargar la página (puntuaciones deterministas).
- [ ] `▶ JUGAR AHORA` en `/juegos/caida` navega a `/juegos/caida/jugar`.
- [ ] En `/juegos/caida/jugar` la puntuación del HUD no cambia con el tiempo.
- [ ] `PAUSA` muestra el overlay `EN PAUSA` y volver a pulsarlo (`REANUDAR`) lo oculta.
- [ ] `FIN` abre el modal `FIN DEL JUEGO` con la puntuación final; `JUGAR DE NUEVO` lo cierra.
- [ ] `GUARDAR PUNTUACIÓN` reemplaza la fila de entrada por `▸ PUNTUACIÓN GUARDADA_` y no escribe nada en `localStorage`.
- [ ] `SALIR` en el reproductor vuelve a `/juegos/caida`.
- [ ] `/auth` muestra el tab `INICIAR SESIÓN` activo por defecto y sin campo de correo.
- [ ] Pulsar el tab `CREAR CUENTA` añade el campo de correo electrónico.
- [ ] Enviar el formulario de `/auth` navega a `/` sin recargar la página.
- [ ] `/salon` muestra el podio con las posiciones 02 / 01 / 03, la tabla de 12 filas y la fila amarilla `▸ TU MEJOR MARCA EN <juego>`.
- [ ] Cambiar de chip en `/salon` cambia el nombre del juego de la fila destacada y las puntuaciones de la tabla.
- [ ] `/juegos/no-existe` y `/juegos/no-existe/jugar` devuelven 404 y muestran la pantalla `GAME OVER` con el botón `VOLVER AL VAULT`.
- [ ] El enlace `Biblioteca` del nav aparece activo en `/`, `/juegos/caida` y `/juegos/caida/jugar`.
- [ ] A 375 px de ancho el nav muestra la hamburguesa, el panel lateral se abre y el backdrop lo cierra.
- [ ] A 375 px de ancho ninguna pantalla produce scroll horizontal.
- [ ] `app/globals.css` no cambia respecto a la rama `01-styles`.

---

## 6 — Decisiones tomadas y descartadas

- **Sí:** rutas reales del App Router (`/`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/auth`, `/salon`). URLs compartibles y layout compartido de verdad.
- **No:** replicar el routing por hash de `app.jsx` en un único `page.tsx` con `useState`. Desperdicia el App Router y obliga a marcar toda la app como cliente.
- **Sí:** rutas en español (`/juegos`, `/salon`), coherentes con la interfaz. Los identificadores del código siguen en inglés, según `CLAUDE.md`.
- **No:** estado de sesión. Sin `localStorage`, sin context, sin usuario. El nav muestra siempre `Iniciar Sesión` y el formulario solo navega. Evita además cualquier desajuste de hidratación.
- **Sí:** el formulario de `/auth` redirige a `/` al enviarse. Deja la pantalla navegable sin introducir sesión.
- **No:** la simulación de partida de `reproductor.jsx` (intervalo de puntuación, vidas, subida de nivel). El encargo dice explícitamente que no se implementa ningún juego, y un contador que sube es lógica de juego.
- **Sí:** conservar los overlays de pausa y de fin de juego como toggles visuales. Son dos pantallas del prototipo que si no quedarían sin portar.
- **Sí:** fila fija del jugador demo `PLAYER1` en el Salón. Mantiene visibles los estilos `.tr.you` y `.tr.you-label` del CSS ya portado.
- **Sí:** reutilizar las clases CSS de `app/globals.css` (`.card`, `.crt`, `.podium-slot`, …).
- **No:** reescribir las 982 líneas de CSS en utilidades Tailwind. Riesgo alto de perder scanlines, keyframes y los gradientes de las portadas, a cambio de nada visible.
- **Sí:** `lib/games.ts` y `lib/scores.ts` separados, importados con el alias `@/`. Separa catálogo de generador de puntuaciones.
- **No:** un único `lib/data.ts` calcado de `data.jsx`. Mezcla dos responsabilidades sin ganar nada.
- **Sí:** `notFound()` más un `app/not-found.tsx` con estilo arcade. El 404 genérico de Next rompería el tema visual.
- **Sí:** `generateStaticParams` y `generateMetadata` en las rutas de juego. Con datos estáticos es barato y hace que `npm run build` valide las 16 rutas.
- **Sí:** cliente solo donde hace falta (`nav`, `game-card`, `library-browser`, `game-player`, `auth-form`, `hall-of-fame`). Las páginas siguen siendo server components.

---

## 7 — Riesgos identificados

| Riesgo                                                                 | Mitigación                                                                                                             |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Desajuste de hidratación al generar puntuaciones                       | `seededScores` es determinista y no usa `Math.random` ni `Date.now`. No se introduce ninguna otra fuente no determinista. |
| Deriva visual entre el markup portado y el CSS existente                | El JSX copia las clases y la jerarquía del prototipo. Cualquier hueco se arregla en el markup, no en `globals.css`.       |
| `params` es una `Promise` en Next 16 y se olvida el `await`             | Se declara explícitamente en los pasos 11 y 13. `npx tsc --noEmit` lo detecta.                                           |
| El tilt con `onMouseMove` toca el DOM directamente                      | Se limita a `style.transform` sobre un `useRef` propio, igual que el prototipo. Sin efectos en render.                    |
| El grid de fondo y los overlays CRT molestan a quien prefiera menos movimiento | Fuera de alcance en esta spec. Un `prefers-reduced-motion` global es una spec aparte sobre `globals.css`.           |

---

## Lo que **no** entra en esta spec

- Ningún juego jugable. Los 8 títulos siguen siendo portadas y textos.
- Autenticación real, sesión de usuario o persistencia de puntuaciones.
- Backend, base de datos o API.
- Reescritura del CSS a utilidades Tailwind.
- Tests automatizados y elección de runner.
- Login social funcional y contador de créditos operativo.
- Ajustes de `prefers-reduced-motion` o accesibilidad más allá del markup semántico y los `aria-label` que ya trae el prototipo.

Cada uno de esos puntos, si llega, va en su propia spec.
