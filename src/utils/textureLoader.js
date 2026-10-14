import * as THREE from "three";

/* Cargador de texturas Fabrick.
   Primero intenta /textures/fabrick/<nombre>.jpg (las que suba el cliente). Si no existe,
   cae a un CDN gratis de threejs.org para que la app no se rompe nunca. Para la pintura no
   hace falta fichero: es un color plano.
   Las texturas del CDN se quedan en memoria (THREE las cachea), no se guardan en disco. */

export const CONFIG = {
  local: "/textures/fabrick/",
  cdn: "https://threejs.org/examples/textures/",
  // mapa nombre -> fichero del CDN. Lo que no esté aquí, cae en hardwood2.
  remotos: {
    roble: "hardwood2_diffuse.jpg",
    nogal: "hardwood2_diffuse.jpg",
    carbon: "hardwood2_diffuse.jpg",
    gris: "hardwood2_diffuse.jpg",
    pisoMadera: "hardwood2_diffuse.jpg",
    baldosa: "terrazzo.png"
  }
};

const memoria = {}; // para no pedir dos veces la misma
const PENDIENTES = [];

function miraRemoto(url) {
  // HEAD no siempre está permitido; un GET con rango 0-0 es lo más barato que funciona
  return fetch(url, { headers: { Range: "bytes=0-0" } })
    .then((r) => r.ok || r.status === 206)
    .catch(() => false);
}

/* Devuelve una THREE.Texture, o null si no hay nada que cargar. `repeticion` son las veces
   que se repite la textura: en three 0.116 es `wrap`/`repeat`, no `texture.repeat.set`. */
export function loadFabrickTexture(nombre, repeticion) {
  const r = repeticion || [1, 1];

  if (memoria[nombre]) {
    const t = memoria[nombre];
    t.repeat.set(r[0], r[1]);
    return t;
  }

  const urlLocal = `${CONFIG.local}${nombre}.jpg`;
  const textura = new THREE.TextureLoader().load(
    urlLocal,
    (t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(r[0], r[1]);
      memoria[nombre] = t;
      // crossOrigin imprescindible para que las texturas de otro dominio no manchen la consola
      // y para que el segundo uso venga de la caché del navegador
      t.anisotropy = 8;
    },
    undefined,
    () => {
      // no existe en local -> CDN
      miraRemoto(urlLocal).catch(() => {});
      const remoto = `${CONFIG.cdn}${CONFIG.remotos[nombre] || "hardwood2_diffuse.jpg"}`;
      new THREE.TextureLoader().load(
        remoto,
        (t2) => {
          t2.wrapS = t2.wrapT = THREE.RepeatWrapping;
          t2.repeat.set(r[0], r[1]);
          t2.anisotropy = 8;
          textura.image = t2.image;
          textura.needsUpdate = true;
          memoria[nombre] = textura;
        },
        undefined,
        () => {
          // tampoco hay CDN: material liso del color de la marca, para que nunca se vea un hueco
          textura.image = null;
          textura.needsUpdate = true;
        }
      );
    }
  );
  textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
  textura.repeat.set(r[0], r[1]);
  textura.anisotropy = 8;
  PENDIENTES.push(textura);
  return textura;
}

/* Pintura: no es fichero, es color. */
export function pinturaFabrick(colorHex) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex || "#FFFFFF"),
    roughness: 0.92,
    metalness: 0
  });
}

/* Material de superficie, con textura o con color plano. */
export function materialFabrick(tipo, opciones) {
  const o = opciones || {};
  if (tipo === "pintura") return pinturaFabrick(o.color);
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(o.color || "#FFFFFF"),
    roughness: o.rugosidad !== undefined ? o.rugosidad : 0.7,
    metalness: 0
  });
  if (o.textura) m.map = loadFabrickTexture(o.textura, o.repeticion);
  return m;
}

/* Descarga por adelantado las texturas que se usan en la casa, para que la primera vista
   no espere. Devuelve una promesa; si alguna falla, sigue igual. */
export function precargarFabrick(nombres) {
  return Promise.all(
    (nombres || []).map((n) => {
      const url = `${CONFIG.local}${n}.jpg`;
      return fetch(url, { method: "HEAD" })
        .then((r) => {
          if (r.ok) return loadFabrickTexture(n);
          return loadFabrickTexture(n); // el cargador ya cae al CDN
        })
        .catch(() => null);
    })
  );
}