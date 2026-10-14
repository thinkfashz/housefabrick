import React, { useEffect, useState } from "react";
import styled from "styled-components";

/* El logotipo se lee de /logo-fabrick.json: ni el SVG ni el PNG están escritos en el código.
   Así se cambia la imagen sin tocar una línea de React. */

const Marco = styled.div`
  position: fixed; left: 20px; top: 16px; z-index: 30;
  width: 230px; pointer-events: none;
  img { width: 100%; height: auto; display: block; filter: drop-shadow(0 2px 6px rgba(0,0,0,.45)); }
`;

export default function LogoFabrick({ ancho = 230 }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let vivo = true;
    fetch("/logo-fabrick.json")
      .then((r) => r.json())
      .then((cfg) => {
        if (!vivo) return;
        const svg = cfg.logo && cfg.logo.files && cfg.logo.files.svg;
        const png = cfg.logo && cfg.logo.files && cfg.logo.files.png_fallback;
        if (!svg) return;
        // si el SVG no existe, cae al PNG sin romper nada
        const img = new Image();
        img.onload = () => { if (vivo) setSrc(svg); };
        img.onerror = () => { if (vivo && png) setSrc(png); };
        img.src = svg;
      })
      .catch(() => {});
    return () => { vivo = false; };
  }, []);

  if (!src) return null;
  return (
    <Marco style={{ width: ancho }}>
      <img src={src} alt="Soluciones Fabrick" />
    </Marco>
  );
}