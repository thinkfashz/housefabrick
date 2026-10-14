/* PLANO DE LA CASA — Soluciones Fabrick
 *
 * Sistema de coordenadas: X hacia la derecha (0..12), Z hacia el fondo (0..9.25).
 * El origen (0,0) es la esquina interior de la fachada. 1 unidad = 1 metro.
 *
 * NOTA SOBRE EL PLANO: este fichero está traducido de las medidas que都合ieron por texto
 * (12.00 x 9.25). El JPG original (public/ref/plano.jpg) NO está en el repositorio, así que
 * las posiciones de huecos y la lista exacta de ventanas están marcadas como APROXIMADAS.
 * Cuando se suba el plano, hay que revisar PUERTAS y VENTANAS de aquí.
 *
 * Descuadre que viene del enunciado: 4+1.75+3.25 = 9.00 y 2.25+1.75+5 = 9.00, pero el fondo
 * total se declara 9.25. Aquí el fondo es 9.25 y la diferencia de 0.25 va al fondo de la SALA
 * y de la RECAMARA 1 (columnas central y derecha), que quedan en 5.25 de fondo.
 */

export const MEDIDAS = {
  ancho: 12.0,
  fondo: 9.25,
  altoMuro: 2.5,
  grosorMuro: 0.2,
  altoPuerta: 2.1,
  anchoPuerta: 0.9
};

/* Las estancias. caja = [x0, z0, x1, z1] en metros. */
export const ESTANCIAS = [
  { id: "recamara2", nombre: "Recámara 2", codigo: "R2", caja: [0, 0, 4, 4] },
  { id: "banio2", nombre: "Baño 2", codigo: "B2", caja: [0, 4, 4, 5.75] },
  { id: "recamara3", nombre: "Recámara 3", codigo: "R3", caja: [0, 5.75, 4, 9.25] },

  { id: "comedor", nombre: "Comedor", codigo: "CM", caja: [4, 0, 8, 4] },
  { id: "sala", nombre: "Sala", codigo: "SA", caja: [4, 4, 8, 9.25] },

  { id: "cocina", nombre: "Cocina", codigo: "CO", caja: [8, 0, 12, 2.25] },
  { id: "lavadero", nombre: "Lavadero", codigo: "LV", caja: [8, 2.25, 10.25, 4] },
  { id: "bano1", nombre: "Baño 1", codigo: "B1", caja: [10.25, 2.25, 12, 4] },
  { id: "recamara1", nombre: "Recámara 1", codigo: "R1", caja: [8, 4, 12, 9.25] }
];

/* Puertas interiores. APROXIMADAS: dependen del plano.
   'p' = punto de paso en el muro, 'g' = hacia qué lado gira (sentido antihorario). */
export const PUERTAS = [
  { id: "P-01", de: "sala", a: "comedor", p: [6.0, 4.0], g: 1 },
  { id: "P-02", de: "sala", a: "recamara1", p: [8.0, 6.5], g: 1 },
  { id: "P-03", de: "sala", a: "recamara3", p: [4.0, 7.5], g: 1 },
  { id: "P-04", de: "sala", a: "banio2", p: [4.0, 4.875], g: 1 },
  { id: "P-05", de: "comedor", a: "cocina", p: [8.0, 1.2], g: 1 },
  { id: "P-06", de: "comedor", a: "lavadero", p: [8.0, 3.1], g: 1 },
  { id: "P-07", de: "lavadero", a: "bano1", p: [10.25, 3.1], g: 1 },
  { id: "P-08", de: "recamara2", a: "comedor", p: [4.0, 2.0], g: 1 },
  { id: "P-09", de: "recamara2", a: "banio2", p: [2.0, 4.0], g: 1 }
];

/* Puerta principal, en la fachada (Z = 0), mirando a la sala/comedor. */
export const PUERTA_PRINCIPAL = { id: "P-00", p: [6.0, 0.0], ancho: 1.2, g: -1 };

/* Ventanas. APROXIMADAS. Muro exterior + posición a lo largo de ese muro. */
export const VENTANAS = [
  { id: "V-01", muro: "N", x: 6.0, ancho: 1.4, alto: 1.3, y: 0.9 },   // fachada, junto a la puerta
  { id: "V-02", muro: "N", x: 2.0, ancho: 1.2, alto: 1.2, y: 1.0 },
  { id: "V-03", muro: "O", z: 2.0, ancho: 1.2, alto: 1.2, y: 1.0 },
  { id: "V-04", muro: "O", z: 7.5, ancho: 1.4, alto: 1.3, y: 0.9 },
  { id: "V-05", muro: "S", x: 2.0, ancho: 1.4, alto: 1.3, y: 0.9 },
  { id: "V-06", muro: "S", x: 6.0, ancho: 1.6, alto: 1.4, y: 0.9 },
  { id: "V-07", muro: "S", x: 10.0, ancho: 1.4, alto: 1.3, y: 0.9 },
  { id: "V-08", muro: "E", z: 1.125, ancho: 1.0, alto: 1.1, y: 1.0 },
  { id: "V-09", muro: "E", z: 6.5, ancho: 1.4, alto: 1.3, y: 0.9 }
];

/* Los cuatro muros perimetrales. interior = true significa que dan a la calle. */
export const MUROS = [
  { id: "W-N", eje: "x", v: 0.0, de: 0.0, a: 12.0 },      // fachada
  { id: "W-S", eje: "x", v: 9.25, de: 0.0, a: 12.0 },     // fondo
  { id: "W-O", eje: "z", v: 0.0, de: 0.0, a: 9.25 },      // izquierda
  { id: "W-E", eje: "z", v: 12.0, de: 0.0, a: 9.25 }      // derecha
];

/* Muros interiores, deducidos de las cajas de las estancias. */
export function murosInteriores() {
  const t = MEDIDAS.grosorMuro;
  const M = MEDIDAS.ancho;
  const F = MEDIDAS.fondo;
  return [
    // separa las tres columnas (x = 4 y x = 8)
    { id: "WI-1", eje: "z", v: 4.0, de: 0.0, a: F, ab: [0, 4.0], tipo: "tabique" },
    { id: "WI-2", eje: "z", v: 8.0, de: 0.0, a: F, ab: [2.25, 4.0], tipo: "tabique" },
    // separa dormitorios / baño en la columna izquierda
    { id: "WI-3", eje: "x", v: 4.0, de: 0.0, a: 4.0, ab: [0.9, 4.0], tipo: "tabique" },
    { id: "WI-4", eje: "x", v: 5.75, de: 0.0, a: 4.0, ab: [1.4, 4.0], tipo: "tabique" },
    // comedor / sala
    { id: "WI-5", eje: "x", v: 4.0, de: 4.0, a: 8.0, ab: [5.1, 7.9], tipo: "tabique" },
    // cocina / lavadero-baño
    { id: "WI-6", eje: "x", v: 2.25, de: 8.0, a: 12.0, ab: [8.9, 11.1], tipo: "tabique" },
    // lavadero / baño 1
    { id: "WI-7", eje: "z", v: 10.25, de: 2.25, a: 4.0, ab: [], tipo: "tabique" },
    // sala / recámara 1
    { id: "WI-8", eje: "z", v: 8.0, de: 4.0, a: 9.25, ab: [4.9, 7.6], tipo: "tabique" },
    // recámara 3 / sala
    { id: "WI-9", eje: "z", v: 4.0, de: 5.75, a: 9.25, ab: [], tipo: "tabique" }
  ];
}

/* ¿En qué punto cae (x, z)? Devuelve el id de la estancia, o null si es exterior. */
export function estanciaEn(x, z) {
  const e = ESTANCIAS.find(
    (s) => x >= s.caja[0] && x <= s.caja[2] && z >= s.caja[1] && z <= s.caja[3]
  );
  return e ? e.id : null;
}

/* Fabrique: iso-superficie con dos o tres lados fuera de la casa. */
export function esExterior(x, z) {
  return (
    x < 0 || z < 0 || x > MEDIDAS.ancho || z > MEDIDAS.fondo
  );
}