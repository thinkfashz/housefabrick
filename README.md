# Soluciones Fabrick — Showroom 3D

Showroom virtual en 3D: se recorre la casa a pie y se eligen suelo, paredes y puertas, con el
resultado aplicado en la escena al momento.

Hecho con [React Three Fiber](https://github.com/pmndrs/react-three-fiber) y
[drei](https://github.com/pmndrs/drei).

## Puesta en marcha

```bash
npm install
npm start          # http://localhost:3000
npm run build      # genera build/
```

## De dónde viene

Adaptación de un proyecto MIT sobre React Three Fiber. La atribución al autor original está en
[`LICENSE`](./LICENSE), y no se muestra en la interfaz. Los cambios de esta versión:

- Textos traducidos al **español** (antes en ruso y uzbeko; el uzbeko se conserva)
- Marca **Soluciones Fabrick**, en amarillo, negro y blanco
- Botón de idioma: «español»

## Estructura

- `src/i18n/` — textos por idioma
- `src/utils/theme.js` — paleta y puntos de ruptura
- `src/components/UI/` — barra lateral, botones, mapa, logo, cargador
- `src/models/` — modelos 3D (glTF) y texturas
- `public/assets/` — texturas, fuentes y logotipo

## Licencia

MIT. El aviso de copyright del autor original se conserva en [`LICENSE`](./LICENSE).
