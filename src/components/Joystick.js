import React, { useRef, useState } from "react";
import styled from "styled-components";

/* Joystick táctil: aparece donde apoyas el pulgar y lee hasta donde llegas. Manda un valor
   de -1 a 1 por cada eje; quien lo consume es FirstPersonPlayer. */

const Zona = styled.div`
  position: fixed; left: 0; bottom: 0; width: 46vw; height: 60vh;
  z-index: 24; touch-action: none; -webkit-user-select: none; user-select: none;
`;
const Base = styled.div`
  position: absolute; width: 120px; height: 120px; margin: -60px 0 0 -60px;
  border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.07);
  opacity: 0; transition: opacity 0.15s; pointer-events: none;
  ${(p) => p.on && "opacity: 1;"}
`;
const Pomo = styled.div`
  position: absolute; left: 50%; top: 50%; width: 52px; height: 52px;
  margin: -26px 0 0 -26px; border-radius: 50%;
  background: radial-gradient(circle at 34% 28%, #fff, #d2d2d2 58%, #9c9c9c);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.45);
`;

const RADIO = 46;   // px hasta el tope
const MUERTA = 0.14;

export default function Joystick({ onCambio }) {
  const [ver, setVer] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0, cx: 0, cy: 0 });
  const ref = useRef({ id: null, x0: 0, y0: 0, x: 0, y: 0 });

  const empieza = (e) => {
    ref.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY };
    setPos({ x: e.clientX, y: e.clientY, cx: e.clientX, cy: e.clientY });
    setVer(true);
  };

  const mueve = (e) => {
    if (ref.current.id !== e.pointerId) return;
    let dx = e.clientX - ref.current.x0;
    let dy = e.clientY - ref.current.y0;
    const n = Math.hypot(dx, dy);
    let x = 0, y = 0;
    if (n > 1) {
      const t = Math.min(1, n / RADIO);
      const l = (t - MUERTA) / (1 - MUERTA);
      if (l > 0) { x = (dx / n) * l; y = (dy / n) * l; }
      // fuera del tope, el pomo se queda pegado al borde
      dx = (dx / n) * RADIO;
      dy = (dy / n) * RADIO;
    }
    ref.current.x = dx; ref.current.y = dy;
    setPos((p) => ({ cx: p.cx, cy: p.cy, x: dx, y: dy }));
    onCambio({ x, y, correr: Math.hypot(x, y) > 0.85 });
  };

  const suelta = (e) => {
    if (ref.current.id !== e.pointerId) return;
    ref.current.id = null;
    setVer(false);
    onCambio({ x: 0, y: 0, correr: false });
  };

  return (
    <Zona
      onPointerDown={empieza}
      onPointerMove={mueve}
      onPointerUp={suelta}
      onPointerCancel={suelta}
    >
      <Base on={ver} style={{ left: pos.cx, top: pos.cy }}>
        <Pomo style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }} />
      </Base>
    </Zona>
  );
}

/* Retícula de punto de mira. */
export const Mira = styled.div`
  position: fixed; left: 50%; top: 50%; width: 6px; height: 6px;
  margin: -3px 0 0 -3px; z-index: 25; pointer-events: none; border-radius: 50%;
  background: rgba(255, 255, 255, 0.92); box-shadow: 0 0 0 1.5px rgba(0, 0, 0, 0.5);
`;

/* Aviso de "pulsa E para abrir". */
export const AvisoPuerta = styled.div`
  position: fixed; left: 50%; top: 56%; transform: translateX(-50%); z-index: 25;
  background: rgba(20, 22, 18, 0.85); color: #fff; padding: 9px 16px; border-radius: 6px;
  font-size: 13px; font-weight: 600; pointer-events: none; white-space: nowrap;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
`;