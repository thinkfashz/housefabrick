import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "react-three-fiber";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { FABRICK, miraPuertas } from "../state/fabrick";
import { estanciaEn } from "../models/Plano";

/* Control en primera persona, escrito a mano sobre three 0.116.
   Nada de rapier ni de física: solo comprobamos contra cajas (THREE.Box3) y movemos la
   cámara. Es lo bastante rápido para 60 fps en un móvil y no arrastra un WASM de 2 MB. */

const Ojos = 1.65;          // altura de la cámara
const Radio = 0.32;         // radio de colisión del cuerpo
const ANDAR = 2.0;          // m/s
const CORRER = 3.8;         // m/s
const SUAVE = 12;           // suavizado de la aceleración
const SENS = 0.0042;        // radianes por píxel al arrastrar en el móvil

export default function FirstPersonPlayer({
  posicionInicial = [6, Ojos, -2.5],
  entrada = null,          // ref con {x, y, correr} que escribe el joystick
  onBloqueo = null,        // callback(bool) al capturar o soltar el ratón
  onEstado = null          // callback({estancia, puerta}) unas 6 veces por segundo
}) {
  const { camera, gl } = useThree();
  const ref = useRef();
  const teclas = useRef({});
  const [activo, setActivo] = useState(false);
  const cada = useRef(0);

  useEffect(() => {
    const c = new PointerLockControls(camera, gl.domElement);
    ref.current = c;
    // el yaw/pitch los pone PointerLockControls sobre la cámara
    const onLock = () => {
      setActivo(true);
      if (onBloqueo) onBloqueo(true);
    };
    const onUnlock = () => {
      setActivo(false);
      if (entrada && entrada.current) { entrada.current.x = 0; entrada.current.y = 0; }
      if (onBloqueo) onBloqueo(false);
    };
    c.addEventListener("lock", onLock);
    c.addEventListener("unlock", onUnlock);
    return () => {
      c.removeEventListener("lock", onLock);
      c.removeEventListener("unlock", onUnlock);
      c.disconnect && c.disconnect();
    };
  }, [camera, gl, onBloqueo, entrada]);

  useEffect(() => {
    camera.position.set(posicionInicial[0], posicionInicial[1], posicionInicial[2]);
  }, [posicionInicial]);

  useEffect(() => {
    const baja = (e) => { teclas.current[e.code] = true; };
    const sube = (e) => { teclas.current[e.code] = false; };
    window.addEventListener("keydown", baja);
    window.addEventListener("keyup", sube);
    return () => { window.removeEventListener("keydown", baja); window.removeEventListener("keyup", sube); };
  }, []);

  /* Colisión: se prueba mover a (x, z) contra cada caja; si choca, se prueba deslizarse en
     cada eje por separado, que es lo que hace que no se pegue a las esquinas. */
  const probaMover = useRef((dx, dz, cajas, ignorar) => {
    const x = camera.position.x, z = camera.position.z;
    const y = camera.position.y - Ojos;                 // a la altura de las piernas
    const choca = (nx, nz) => {
      for (let i = 0; i < cajas.length; i++) {
        const b = cajas[i];
        if (ignorar && b === ignorar) continue;
        if (!b || !b.min) continue;
        if (nx > b.min.x - Radio && nx < b.max.x + Radio &&
            nz > b.min.z - Radio && nz < b.max.z + Radio) return true;
      }
      return false;
    };
    if (!choca(x + dx, z + dz)) { camera.position.x += dx; camera.position.z += dz; return true; }
    // deslizarse por los muros
    if (!choca(x + dx, z)) { camera.position.x += dx; return true; }
    if (!choca(x, z + dz)) { camera.position.z += dz; return true; }
    return false;
  });

  /* Mirada táctil: PointerLockControls solo gira con el ratón capturado, así que en el móvil
     hace falta arrastrar a mano. Se apoya en la mitad derecha para no pelearse con el
     joystick de la izquierda. Solo actúa si el puntero NO está capturado. */
  useEffect(() => {
    const dom = gl.domElement;
    const arrastrando = { id: null, x: 0, y: 0 };
    const mitad = () => dom.getBoundingClientRect().left + dom.getBoundingClientRect().width / 2;

    const baja = (e) => {
      if (document.pointerLockElement === dom) return;     // ya lo lleva PointerLockControls
      if (e.pointerType !== "touch") return;
      if (e.clientX < mitad()) return;                     // mitad izquierda = joystick
      arrastrando.id = e.pointerId;
      arrastrando.x = e.clientX;
      arrastrando.y = e.clientY;
    };
    const mueve = (e) => {
      if (arrastrando.id !== e.pointerId) return;
      const dx = e.clientX - arrastrando.x;
      const dy = e.clientY - arrastrando.y;
      arrastrando.x = e.clientX;
      arrastrando.y = e.clientY;
      camera.rotation.order = "YXZ";
      camera.rotation.y -= dx * SENS;
      camera.rotation.x = Math.max(-1.35, Math.min(1.35, camera.rotation.x - dy * SENS));
    };
    const suelta = (e) => { if (arrastrando.id === e.pointerId) arrastrando.id = null; };

    dom.addEventListener("pointerdown", baja);
    dom.addEventListener("pointermove", mueve);
    dom.addEventListener("pointerup", suelta);
    dom.addEventListener("pointercancel", suelta);
    return () => {
      dom.removeEventListener("pointerdown", baja);
      dom.removeEventListener("pointermove", mueve);
      dom.removeEventListener("pointerup", suelta);
      dom.removeEventListener("pointercancel", suelta);
    };
  }, [camera, gl]);

  useFrame((_, delta) => {
    const dt = Math.min(0.05, delta);
    const t = teclas.current;
    const e = (entrada && entrada.current) || { x: 0, y: 0, correr: false };

    let adelante = 0, lateral = 0;
    if (t.KeyW || t.ArrowUp) adelante += 1;
    if (t.KeyS || t.ArrowDown) adelante -= 1;
    if (t.KeyA || t.ArrowLeft) lateral -= 1;
    if (t.KeyD || t.ArrowRight) lateral += 1;
    adelante += -e.y;
    lateral += e.x;

    const n = Math.hypot(adelante, lateral);
    if (n > 1) { adelante /= n; lateral /= n; }

    const correr = t.ShiftLeft || t.ShiftRight || e.correr;
    const v = (correr ? CORRER : ANDAR) * dt;

    const yaw = camera.rotation.y;
    const sy = Math.sin(yaw), cy = Math.cos(yaw);
    probaMover.current(
      (-sy * adelante + cy * lateral) * v,
      (-cy * adelante - sy * lateral) * v,
      FABRICK.colliders
    );

    // los pies no bajan del suelo
    if (camera.position.y < Ojos) camera.position.y = Ojos;

    // estancia y puerta cercana: no tiene sentido mirarlo a 60 fps
    cada.current += delta;
    if (cada.current > 0.12) {
      cada.current = 0;
      const est = estanciaEn(camera.position.x, camera.position.z);
      const p = miraPuertas(camera, 2.0);
      FABRICK.estancia = est;
      FABRICK.cercana = p;
      if (onEstado) onEstado({ estancia: est, puerta: p });
    }
  });

  return null;
}

/* Calcula las cajas de colisión de una malla (para no escribirlas a mano). */
export function cajasDe(objeto, ignorar) {
  const cajas = [];
  objeto.updateMatrixWorld(true);
  objeto.traverse((o) => {
    if (!o.isMesh) return;
    if (ignorar && ignorar(o)) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    const b = o.geometry.boundingBox.clone();
    b.applyMatrix4(o.matrixWorld);
    // los muros tienen 2,5 de alto y nos basta con la parte baja
    cajas.push(b);
  });
  return cajas;
}

/* Une cajas en un array plano, para pasárselas tal cual al jugador. */
export function aplanar(listas) {
  const out = [];
  listas.forEach((l) => l && l.forEach && l.forEach((c) => out.push(c)));
  return out;
}

export { Ojos as ALTURA_OJOS, Radio as RADIO_CUERPO };