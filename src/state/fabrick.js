import * as THREE from "three";

/* Registro compartido de la maqueta Fabrick.
   La casa pinta los muros y las puertas, el jugador camina. Para que hablen entre ellos sin
   pasarse props por tres niveles, se guardan aquí. Es un objeto normal, no estado de React:
   se lee y se escribe dentro de useFrame, donde un setState por frame seria un desastre. */

export const FABRICK = {
  colliders: [],      // THREE.Box3, uno por muro
  puertas: {},        // id -> { x, z, abrir() }
  cercana: null,      // id de la puerta que tienes delante, a menos de 2 m
  estancia: null      // id de la estancia en la que estás
};

export function registraColls(cajas) {
  FABRICK.colliders = cajas || [];
}

export function registraPuerta(id, x, z, abrir) {
  FABRICK.puertas[id] = { x, z, abrir };
}

export function quitaPuertas() {
  FABRICK.puertas = {};
  FABRICK.cercana = null;
}

export function abreCercana() {
  const p = FABRICK.cercana && FABRICK.puertas[FABRICK.cercana];
  if (p) { p.abrir(); return true; }
  return false;
}

/* Punto de mira contra las puertas: la más cercana a menos de `alcance` que además esté
   delante de la cámara. */
export function miraPuertas(camara, alcance) {
  const d = alcance || 2.0;
  const dir = new THREE.Vector3();
  camara.getWorldDirection(dir);
  const x = camara.position.x, z = camara.position.z;
  let mejor = null, dm = d;
  Object.keys(FABRICK.puertas).forEach((id) => {
    const p = FABRICK.puertas[id];
    const dx = p.x - x, dz = p.z - z;
    const dist = Math.hypot(dx, dz);
    if (dist > d) return;
    // ¿está en el campo de visión? (producto escalar > 0,85 ≈ dentro de unos 30 grados)
    const cos = (dx * dir.x + dz * dir.z) / (dist || 1);
    if (cos > 0.85 && dist < dm) { dm = dist; mejor = id; }
  });
  return mejor;
}