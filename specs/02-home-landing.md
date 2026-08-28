# SPEC 02 — Landing de inicio y traslado del catálogo a `/juegos`

> **Estado:** Aprobado
> **Depende de:** SPEC 01
> **Fecha:** 2026-08-28
> **Objetivo:** Portar el landing de `references/templates/home-about/home.jsx` a la raíz `/` y mover el catálogo actual a `/juegos`, dejando el nav con Inicio · Juegos · Salón de la Fama.

---

## 1 — Por qué existe esta spec

SPEC 01 dejó `/` ocupado por la Biblioteca. El prototipo nuevo (`references/templates/home-about/`)
introduce una pantalla anterior: un landing con hero a pantalla completa, cuatro razones para
usar la plataforma, un carrusel de seis juegos, una franja de estadísticas, un panel de actividad
en vivo, un bloque de precios y una llamada final a la acción. Su `nav.jsx` ya trata `Inicio` y
`Biblioteca` como dos destinos distintos.

Además, `home-about/styles.css` (1744 líneas) es **superset exacto** del `styles.css` que ya se
portó a `app/globals.css`: 794 líneas añadidas, cero líneas modificadas. Esta spec porta solo los
bloques que el markup del landing usa.

Se mantienen los dos límites de SPEC 01:

- **Solo visual.** Sin backend, sin sesión, sin persistencia. La "actividad en vivo" es estática.
- **Sin regresión visual.** El markup reutiliza las clases del prototipo en vez de reescribirlas
  en utilidades Tailwind.

---

## 2 — Alcance

**Dentro:**

- `app/page.tsx` pasa a ser el **landing** (seis secciones portadas de `home.jsx`).
- `app/juegos/page.tsx` **nuevo**: el contenido actual de `app/page.tsx` (hero `.av-hero` +
  `<LibraryBrowser />`) se mueve aquí sin cambios de markup.
- Nav actualizado a tres enlaces: `Inicio` → `/`, `Juegos` → `/juegos`, `Salón de la Fama` → `/salon`.
  Mismo cambio en el panel móvil.
- Actualización de los seis enlaces que hoy apuntan a `/` y significan "el catálogo".
- CSS: se anexan a `app/globals.css` los bloques `HOME PAGE` (incluido `.reveal`), `ACTIVITY` y
  `PRICING` de `references/templates/home-about/styles.css`.
- `lib/activity.ts` con los datos estáticos del panel de actividad y de la franja de estadísticas.
- Un único componente cliente nuevo (`components/reveal.tsx`) para la aparición al hacer scroll.

**Fuera de alcance (para specs futuras):**

- **La página `Acerca de`** (`about.jsx`): misión, highlights y formulario de contacto con
  terminal de éxito. Va en SPEC 03, junto con el cuarto enlace del nav.
- El bloque CSS `GAMEPAD` (~470 líneas: `.gp-*`, `.dp-*`, `.ab-*`, `.score-pop`, temas
  `vapor` / `cabinet`) y `Theme variants`. Ningún `.jsx` del template los usa; pertenecen a un
  componente que no existe.
- Cualquier juego jugable. Sigue sin implementarse ninguno de los 8 títulos.
- Autenticación real, sesión o persistencia. El panel de actividad no consulta nada.
- Backend o API que alimente el ticker y el ranking del landing.
- Reescritura del CSS portado a utilidades Tailwind.
- Tests automatizados. Sigue sin haber runner configurado.
- `prefers-reduced-motion` para las animaciones nuevas (`float`, `bounce`, `reveal`).
- Los botones `EMPEZAR GRATIS` y `CREAR CUENTA` solo navegan a `/auth`; no crean nada.

---

## 3 — Modelo de datos

Sin persistencia. Los datos nuevos son constantes en un módulo de `lib/`, importables desde
server components. Los valores se copian **literalmente** de `home.jsx`, sin retocar (misma
regla que SPEC 01 aplicó a `data.jsx`).

### `lib/activity.ts`

```ts
export type NeonColor = "cyan" | "magenta" | "yellow" | "green";

export type TickerEntry = {
  player: string;   // "NEONFOX"
  game: string;     // "Caída" — nombre visible, no el id de la ruta
  score: number;    // 184220
  ago: string;      // "hace 2 min"
  color: NeonColor;
};

export type TopPlayer = {
  rank: number;     // 1..5
  player: string;
  score: number;
};

export type HomeStat = {
  n: string;        // "12+"
  unit: string;     // "JUEGOS"
  sub: string;      // "Y CONTANDO"
};

export const RECENT_SCORES: readonly TickerEntry[];      // las 7 filas de home.jsx, mismo orden
export const TOP_PLAYERS_TODAY: readonly TopPlayer[];    // las 5 filas de home.jsx, mismo orden
export const HOME_STATS: readonly HomeStat[];            // los 3 bloques de home.jsx
```

`HOME_STATS` conserva `"12+"` aunque `GAMES.length` sea 8: es el texto del prototipo y el landing
no es un informe. Cuando haya datos reales, se sustituye el módulo entero.

Las cuatro tarjetas de `¿POR QUÉ ARCADE VAULT?`, las tres preguntas del FAQ y la lista del plan de
precios son texto fijo del markup; **no** entran en `lib/activity.ts`.

El carrusel usa `GAMES.slice(0, 6)` de `lib/games.ts`; no introduce datos nuevos.

`lib/games.ts` y `lib/scores.ts` no cambian.

---

## 4 — Plan de implementación

Cada paso deja el proyecto compilando (`npx tsc --noEmit`) y navegable.

1. **CSS.** Anexar a `app/globals.css`, en este orden y sin modificar nada existente, tres tramos
   de `references/templates/home-about/styles.css`:

   | Bloque                  | Líneas del template | Aporta                                                        |
   | ----------------------- | ------------------- | ------------------------------------------------------------- |
   | `/* ===== HOME PAGE */` | 930–1069            | `.home*`, `.hero-*`, `.silo`, `.section-*`, `.feature-*`, `.mini-*`, `.stat-*`, `.final-*`, `.reveal` |
   | `/* ===== ACTIVITY */`  | 1621–1670           | `.activity-*`, `.ac-*`, `.ticker`, `.tick-row`, `.tk-*`, `.top-list`, `.top-row`, `.tp-*` |
   | `/* ===== PRICING */`   | 1672–1725           | `.pricing-*`, `.price-card`, `.pc-*`, `.faq-*`                 |

   No se copian `ABOUT PAGE` (1071–1147), `GAMEPAD` (1151–1509), `Theme variants` (1510–1620) ni
   la cola duplicada (1726–1744: `.fade-in`, `.slide-in`, `tweaks`, `spinner`, ya presentes).
   Verificación: `npm run dev` arranca y las pantallas de SPEC 01 se ven igual que antes.

2. **`lib/activity.ts`.** Portar tipos y las tres constantes. Verificación: `npx tsc --noEmit` pasa.

3. **Mover el catálogo a `app/juegos/page.tsx`.** Server component con el contenido actual de
   `app/page.tsx` (hero `.av-hero` + `<LibraryBrowser games={GAMES} cats={CATS} />`), más
   `export const metadata` con título `Juegos · Arcade Vault`. `app/page.tsx` queda de momento
   como estaba. Verificación: `/juegos` y `/` muestran ambos el catálogo.

4. **`components/nav.tsx`.** Tres enlaces: `Inicio` (`/`), `Juegos` (`/juegos`),
   `Salón de la Fama` (`/salon`), en el nav y en el panel móvil. `isActive` pasa a:
   `inicio` → `pathname === "/"`; `juegos` → `pathname.startsWith("/juegos")`;
   `salon` → `pathname.startsWith("/salon")`; `auth` → `pathname.startsWith("/auth")`.
   El logo sigue apuntando a `/`. Verificación: `Juegos` aparece activo en `/juegos`,
   `/juegos/caida` y `/juegos/caida/jugar`, y `Inicio` solo en `/`.

5. **Reapuntar los enlaces al catálogo.** Cinco cambios de `/` a `/juegos`:
   - `app/juegos/[id]/page.tsx:69` — `VOLVER AL VAULT`.
   - `components/game-player.tsx:121` — `VOLVER AL VAULT` del modal de fin de juego.
   - `components/hall-of-fame.tsx:102` — el botón final; el texto pasa de
     `VOLVER A LA BIBLIOTECA` a `VOLVER A LOS JUEGOS` para no contradecir la etiqueta del nav.
   - `components/auth-form.tsx:16` — `router.push("/juegos")` tras enviar el formulario.
   - `components/auth-form.tsx:77` — `JUGAR COMO INVITADO`.

   `app/not-found.tsx:10` (`VOLVER AL VAULT`) **se queda en `/`**: es la puerta de entrada, no el
   catálogo. Verificación: ningún botón de "volver" cae en el landing salvo el del 404.

6. **`components/reveal.tsx`** (`"use client"`). Envoltorio que renderiza
   `<section className={"...  reveal"}>` y observa **su propio** `useRef` con un
   `IntersectionObserver` (`threshold: 0.12`), añadiendo la clase `in` y dejando de observar al
   entrar en viewport. Props: `className` y `children`. Sustituye al hook global `useReveal()` del
   prototipo, que consultaba `document.querySelectorAll(".reveal")`. Es el **único** componente
   cliente que añade esta spec.

7. **`components/home-hero.tsx`.** Server component. Sección `.home-hero` con las ocho siluetas
   pixeladas (`.home-silos`, SVG inline `s1`–`s8`, `aria-hidden`), el eyebrow
   `▸ INSERTA UNA MONEDA_`, el `<h1 className="home-title">` de tres líneas
   (`EL ARCADE` / `CLÁSICO ESTÁ` / `DE VUELTA`), el subtítulo, los dos CTA como `Link`
   (`▶ EXPLORAR JUEGOS` → `/juegos`, `✦ CREAR CUENTA` → `/auth`) y el indicador `DESLIZA ▼`.

8. **`components/home-features.tsx`.** Server component. `.section-head` con kicker `// 01` y
   título `¿POR QUÉ ARCADE VAULT?`, más las cuatro `.feature-card` (`GAMEPAD` / `FREE` /
   `TROPHY` / `ROCKET`) con sus iconos pixel SVG y `transitionDelay` escalonado de `80ms`.

9. **`components/home-rail.tsx`.** Server component. Kicker `// 02`, título
   `JUEGOS DISPONIBLES AHORA`, `.mini-rail` con `GAMES.slice(0, 6)` — cada `.mini-card` es un
   `Link` a `/juegos/[id]` — y el botón `VER TODOS LOS JUEGOS →` como `Link` a `/juegos`.

10. **`components/home-stats.tsx`.** Server component. `.home-stats` con los tres `HOME_STATS` y
    `transitionDelay` de `90ms` por bloque. Sección a sangre completa, sin `.home-section`.

11. **`components/home-activity.tsx`.** Server component. Kicker `// 03`, título
    `ACTIVIDAD EN VIVO` y `.activity-grid` con dos tarjetas: el ticker de `RECENT_SCORES`
    (`animationDelay` de `60ms` por fila) y el `TOP JUGADORES · HOY` de `TOP_PLAYERS_TODAY`, con
    la barra `.tp-fill` al `100 - i * 16` por ciento y el enlace `VER SALÓN →` a `/salon`.
    Las cifras se formatean con `toLocaleString("es-ES")`, igual que en SPEC 01.

12. **`components/home-pricing.tsx`.** Server component. Kicker `// 04`, título `PRECIOS`,
    `.price-card` con `$0 / SIEMPRE`, los seis puntos de la lista, el sello `FREE PLAY`, el botón
    `EMPEZAR GRATIS →` (`Link` a `/auth`) y las tres `.faq-item`.

13. **`app/page.tsx`.** Server component nuevo: `<div className="home fade-in">` con
    `<HomeHero />` seguido de las cinco secciones envueltas en `<Reveal>`, y la sección final
    `.home-final` (`¿LISTO PARA JUGAR?`, `INSERTAR MONEDA →` como `Link` a `/juegos`, y la
    coletilla). Sustituye por completo al catálogo, que ya vive en `/juegos`.
    Verificación: `/` muestra el landing y `/juegos` el catálogo.

14. **Cierre.** Ejecutar `npm run lint`, `npx tsc --noEmit` y `npm run build`, y corregir lo que
    salga.

---

## 5 — Criterios de aceptación

- [ ] `npm run lint` termina sin errores ni warnings.
- [ ] `npx tsc --noEmit` termina sin errores.
- [ ] `npm run build` termina sin errores y prerenderiza `/`, `/juegos`, `/auth`, `/salon`, las 8 rutas `/juegos/[id]` y las 8 `/juegos/[id]/jugar`.
- [ ] La consola del navegador no muestra errores ni avisos de hidratación en `/` ni en `/juegos`.
- [ ] `/` muestra el hero con las tres líneas `EL ARCADE` / `CLÁSICO ESTÁ` / `DE VUELTA` y los dos botones `▶ EXPLORAR JUEGOS` y `✦ CREAR CUENTA`.
- [ ] `/` muestra las 4 tarjetas de `¿POR QUÉ ARCADE VAULT?`, 6 mini-tarjetas en el carrusel, 3 bloques de estadísticas, 7 filas de ticker, 5 filas de top jugadores y 3 preguntas de FAQ.
- [ ] Al cargar `/`, las secciones por debajo del hero empiezan invisibles y aparecen al hacer scroll hasta ellas.
- [ ] `▶ EXPLORAR JUEGOS`, `VER TODOS LOS JUEGOS →` e `INSERTAR MONEDA →` navegan a `/juegos`.
- [ ] `✦ CREAR CUENTA` y `EMPEZAR GRATIS →` navegan a `/auth`.
- [ ] `VER SALÓN →` navega a `/salon`.
- [ ] Hacer clic en una mini-tarjeta del carrusel navega a `/juegos/<id>` del juego correspondiente.
- [ ] `/juegos` muestra el hero `ARCADE VAULT`, el buscador, los 5 chips y las 8 tarjetas, idéntico a como `/` se veía antes de esta spec.
- [ ] Escribir `serp` en el buscador de `/juegos` deja exactamente una tarjeta visible (`SERPENTINA`).
- [ ] El nav muestra exactamente tres enlaces: `Inicio`, `Juegos` y `Salón de la Fama`.
- [ ] `Inicio` aparece activo solo en `/`; `Juegos` aparece activo en `/juegos`, `/juegos/caida` y `/juegos/caida/jugar`.
- [ ] `VOLVER AL VAULT` de `/juegos/caida` y del modal de fin de juego llevan a `/juegos`, no a `/`.
- [ ] El botón final de `/salon` dice `VOLVER A LOS JUEGOS` y lleva a `/juegos`.
- [ ] Enviar el formulario de `/auth` navega a `/juegos`; `JUGAR COMO INVITADO` también.
- [ ] `VOLVER AL VAULT` de la pantalla 404 sigue llevando a `/`.
- [ ] Ninguna ruta de SPEC 01 cambia de aspecto respecto a antes de esta spec.
- [ ] A 375 px de ancho las rejillas de features, actividad y precios pasan a una sola columna; el carrusel queda a dos, como en el prototipo.
- [ ] A 375 px de ancho el landing no añade scroll horizontal respecto a las rutas de SPEC 01. (El nav ya desborda a 403 px en todas las rutas desde SPEC 01; corregirlo es su propia spec — ver § 7.)
- [ ] `app/globals.css` no contiene ninguna regla `.gp-`, `.dp-`, `.ab`, `.score-pop`, `.gp-vapor` ni `.gp-cabinet`.
- [ ] `app/globals.css` no contiene ninguna regla `.about-`, `.contact-`, `.term-` ni `.btn.press`.
- [ ] Ningún selector que ya existía en `app/globals.css` antes de esta spec ha sido modificado ni duplicado.

---

## 6 — Decisiones tomadas y descartadas

- **Sí:** `/` es el landing y `/juegos` el catálogo. Es lo que asume el `nav.jsx` del template, que trata `Inicio` y `Biblioteca` como destinos distintos, y anida el catálogo con `/juegos/[id]` bajo el mismo prefijo.
- **No:** dejar el catálogo en `/` y colgar el landing de `/inicio`. Convertiría la portada del producto en una página secundaria.
- **No:** redirecciones de compatibilidad desde las rutas viejas. El proyecto no está publicado; no hay enlaces externos que preservar.
- **Sí:** la etiqueta del nav es `Juegos`, no `Biblioteca`. Texto y URL coinciden. Es la única desviación deliberada respecto al copy del prototipo, y arrastra el retoque de `VOLVER A LA BIBLIOTECA` en el Salón.
- **Sí:** `Acerca de` queda para SPEC 03. Añade una página entera con formulario, validación, estado `shake` y pantalla de terminal — es una spec propia, no una sección más.
- **No:** dejar ya el enlace `Acerca de` en el nav apuntando a una ruta inexistente. Un 404 alcanzable desde el nav principal es peor que tocar el nav dos veces.
- **Sí:** portar solo `HOME PAGE`, `ACTIVITY` y `PRICING` del `styles.css` nuevo. Son los bloques que el markup de esta spec usa.
- **No:** copiar el delta completo de 794 líneas. `GAMEPAD` y `Theme variants` (~470 líneas) no los usa ningún `.jsx` del template: sería CSS muerto en el bundle desde el primer día. Si más adelante aparece ese componente, el bloque sigue en `references/` para portarlo entonces.
- **Sí:** los textos del prototipo se copian literalmente, `"12+ JUEGOS"` incluido. Misma regla que SPEC 01 aplicó a `data.jsx`; el landing es una pieza de marketing portada, no un panel de métricas.
- **No:** derivar las estadísticas de `GAMES.length`. Mezclaría un dato real con dos inventados (`MILES`, `GLOBAL`) y rompería la fidelidad visual sin hacer la página más honesta.
- **Sí:** `lib/activity.ts` separado de `lib/games.ts` y `lib/scores.ts`. Cuando haya backend se sustituye un solo módulo.
- **No:** los arrays inline en los componentes. Mezcla datos y markup, y esconde justo lo que habrá que reemplazar primero.
- **Sí:** `components/reveal.tsx` como envoltorio cliente que observa su propio nodo. Deja `app/page.tsx` y las seis secciones como server components y evita que un componente manipule nodos que no le pertenecen.
- **No:** replicar el hook `useReveal()` con `document.querySelectorAll(".reveal")`. Obligaría a marcar la página entera como cliente y a coordinar el orden de montaje.
- **Sí:** las mini-tarjetas del carrusel son `Link`, no `div` con `onClick`. Son navegación real: URL compartible, apertura en pestaña nueva y prefetch.
- **Sí:** el 404 sigue apuntando a `/`. Quien llega a una URL rota no busca el catálogo, busca la puerta de entrada.
- **Sí:** `/auth` redirige a `/juegos` al enviar. Quien acaba de entrar quiere jugar, no volver a leer el landing.

---

## 7 — Riesgos identificados

| Riesgo                                                                                  | Mitigación                                                                                                                                              |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.reveal` deja el contenido en `opacity: 0`; si el `IntersectionObserver` no llega a correr, cinco secciones quedan invisibles | El observador se monta en el `useEffect` de `components/reveal.tsx`, que envuelve cada sección por separado: el fallo, si lo hay, es aislado y no en cascada. Un fallback sin JS queda fuera de alcance y se registra aquí. |
| El traslado de `/` a `/juegos` deja enlaces apuntando al landing por error                | El paso 5 enumera los seis enlaces uno a uno, con archivo y línea, e indica explícitamente cuál (`not-found.tsx`) **no** cambia.                          |
| Anexar 244 líneas a `globals.css` pisa selectores existentes                              | El `styles.css` nuevo es superset exacto verificado con `diff`: 794 líneas añadidas, ninguna modificada. Los tres tramos se copian sin editar y hay un criterio de aceptación para el solapamiento. |
| `toLocaleString("es-ES")` en el ticker produce distinta salida en servidor y en cliente   | El locale es explícito y los valores son constantes enteras. Mismo patrón ya en uso en `components/game-card.tsx` desde SPEC 01.                          |
| Ocho siluetas SVG animadas más el fondo de rejilla y las scanlines cargan la CPU en móvil | Las siluetas van con `pointer-events: none` y `opacity: 0.55`; el CSS del template ya las oculta o reduce en los breakpoints. Un `prefers-reduced-motion` global sigue siendo su propia spec. |
| El nav desborda a 375 px (logo + `Iniciar Sesión` + hamburguesa = 403 px) y produce scroll horizontal | Verificado: es anterior a esta spec y se da igual en `/juegos`, `/salon` y `/auth` con el markup intacto de SPEC 01 — el tercer enlace no influye, `.links` va en `display: none` en móvil. Corregirlo exige tocar reglas `.av-nav` previas, lo que chocaría con el criterio de no cambiar el aspecto de SPEC 01. Queda registrado para su propia spec. |
| El hero usa `min-height: calc(100vh - 60px)` y en móvil la barra del navegador altera `100vh` | Se porta el valor del prototipo tal cual. Si aparece recorte, se corrige en `globals.css` en su propia iteración, no en el markup.                        |

---

## Lo que **no** entra en esta spec

- La página `Acerca de` y su formulario de contacto.
- El cuarto enlace del nav.
- Los bloques CSS `GAMEPAD` y `Theme variants`.
- Datos reales en el ticker, el ranking del landing o las estadísticas.
- Cualquier juego jugable.
- Autenticación real, sesión o persistencia.
- Reescritura del CSS a utilidades Tailwind.
- Tests automatizados y elección de runner.
- `prefers-reduced-motion` y accesibilidad más allá del markup semántico y los `aria-hidden` del prototipo.

Cada uno de esos puntos, si llega, va en su propia spec.
