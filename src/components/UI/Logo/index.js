import React from "react";
import styled, { withTheme } from "styled-components";

/* Lockup de marca: el icono de casa en amarillo y el nombre en negro, con «fabrick» sobre
   una pastilla amarilla. Así se ven los tres colores de la marca (amarillo, negro y blanco)
   y todo se lee bien sobre fondo blanco: el negro contrasta y el negro va sobre la pastilla. */
const Marco = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: "Gilroy", "Open Sans", Arial, sans-serif;
  line-height: 1;
  user-select: none;
`;

const Casa = styled.svg`
  flex: 0 0 auto;
  display: block;
`;

const Texto = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const Soluciones = styled.span`
  font-size: ${({ ancho }) => ancho / 7.4}px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.ink.normal};
  letter-spacing: 0.01em;
  white-space: nowrap;
`;

const Fabrick = styled.span`
  align-self: flex-start;
  font-size: ${({ ancho }) => ancho / 5.6}px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.ink.normal};
  background: ${({ theme }) => theme.colors.primary.normal};
  border-radius: 999px;
  padding: 3px 10px 4px;
`;

/* Ojo con `withTheme`: ThemeProvider pasa el tema por contexto, y solo lo reciben los
   styled-components. Un componente normal lo recibe únicamente si se envuelve en `withTheme`;
   sin eso, `theme` llega undefined y `theme.colors...` revienta la app entera al arrancar. */
function Logo({ width = 190, theme }) {
  const ancho = typeof width === "number" ? width : parseInt(width, 10) || 190;
  const alto = Math.round(ancho * 0.42);
  return (
    <Marco>
      <Casa width={alto} height={alto} viewBox="0 0 48 48" aria-hidden="true">
        <path
          d="M24 4 3 21h6v23h12V32h6v12h12V21h6L24 4Z"
          fill={theme.colors.primary.normal}
        />
        <path
          d="M24 12.5 10 23.5V40h8v-9h12v9h8V23.5L24 12.5Z"
          fill={theme.colors.ink.normal}
        />
      </Casa>
      <Texto>
        <Soluciones ancho={ancho}>soluciones</Soluciones>
        <Fabrick ancho={ancho}>fabrick</Fabrick>
      </Texto>
    </Marco>
  );
}

export default withTheme(Logo);