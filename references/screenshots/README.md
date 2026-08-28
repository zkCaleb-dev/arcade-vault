# Capturas de verificación — homepage

Comparación de `/` contra el prototipo de `references/templates/` (servido en local),
ambos en un viewport de 1440×1000 y con las animaciones congeladas
(`animation: none`, `transition: none`) para que el diff sea comparable.

| Archivo | Qué es |
| --- | --- |
| `homepage-referencia.png` | Prototipo `Arcade Vault.html` |
| `homepage-app.png` | La app en `/` (Next 16) |
| `diff-hero-h1.png` | Diff amplificado ×4 del `h1` del hero: solo contornos, es antialiasing de la fuente (CDN vs `next/font`) |
| `diff-buscador-antes.png` | Buscador antes del arreglo — arriba prototipo, abajo app, ×2 |

Resultado: geometría idéntica al píxel en los 16 elementos medidos y 88 de 90
propiedades calculadas iguales. La única diferencia real era el `padding` del
`<input>` del buscador, que el preflight de Tailwind reseteaba; corregida en
`components/library-browser.tsx` con `style={{ padding: "1px 2px" }}`.

Diferencias residuales, ninguna de diseño:

- Contorno de las letras del `h1` — rasterización de la misma Press Start 2P
  servida desde dos orígenes distintos.
- Indicador de dev de Next.js abajo a la izquierda en `homepage-app.png`.
  No existe en el build de producción.
