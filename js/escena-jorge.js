/* ==========================================================================
   ESCENA 2 — Orión superpuesto a las fotos
   ==========================================================================
   Dibuja Orión en SVG, ENCIMA de las fotos, siempre visible durante toda la
   escena (no depende del paso de scroll: Jorge ya lo ve desde que arranca).

   Misma técnica y mismos colores que ya usa js/escena-cielos.js (halo suave
   + punto sólido + líneas finas), para que sea la misma constelación a los
   ojos de quien mira, en todo el sitio.

   Si en alguna de las 8 fotos Orión no queda bien ubicado respecto de la
   ventana de la imagen, ajustá CENTRO_ORION_X / DESPLAZAMIENTO_Y acá abajo
   — están pensadas para moverse en conjunto, sin tocar la forma.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const capa = document.getElementById("capa-orion-overlay");
    if (!capa) return; // La escena no está en esta página.

    const NS = "http://www.w3.org/2000/svg";
    function crearSVG(tag, attrs = {}) {
        const el = document.createElementNS(NS, tag);
        for (const clave in attrs) el.setAttribute(clave, attrs[clave]);
        return el;
    }

    // El viewBox de #svg-orion-overlay es 1366x768 (ver index.html). Estas
    // dos constantes son las únicas que hace falta tocar para reposicionar
    // toda la constelación:
    const CENTRO_ORION_X = 1205;   // centro horizontal del Cinturón de Orión
    const DESPLAZAMIENTO_Y = -150; // corrimiento vertical respecto de la
                                    // versión de escena-cielos.js

    // Mismos nombres, offsets y colores que ESTRELLAS_ORION en
    // js/escena-cielos.js — sólo cambia dónde queda el centro.
    const ESTRELLAS_ORION = [
        { dx: -88, y: 460 + DESPLAZAMIENTO_Y, r: 6, color: "#cfe3ff" },   // Rigel
        { dx: -70, y: 295 + DESPLAZAMIENTO_Y, r: 5.4, color: "#ffb37a" }, // Betelgeuse
        { dx: 80, y: 280 + DESPLAZAMIENTO_Y, r: 4, color: "#eaf1ff" },    // Bellatrix
        { dx: 0, y: 366 + DESPLAZAMIENTO_Y, r: 3.6, color: "#ffffff" },   // Alnilam
        { dx: 36, y: 374 + DESPLAZAMIENTO_Y, r: 3.5, color: "#ffffff" },  // Alnitak
        { dx: 88, y: 462 + DESPLAZAMIENTO_Y, r: 4.2, color: "#cfe3ff" },  // Saiph
        { dx: -32, y: 358 + DESPLAZAMIENTO_Y, r: 3.4, color: "#ffffff" }  // Mintaka
    ];

    // Pares por índice sobre ESTRELLAS_ORION (mismo trazado que en
    // escena-cielos.js): Betelgeuse-Mintaka, Bellatrix-Alnitak,
    // Mintaka-Alnilam, Alnilam-Alnitak, Mintaka-Rigel, Alnitak-Saiph.
    const LINEAS_ORION = [[1, 6], [2, 4], [6, 3], [3, 4], [6, 0], [4, 5]];

    const punto = (i) => [CENTRO_ORION_X + ESTRELLAS_ORION[i].dx, ESTRELLAS_ORION[i].y];

    // Líneas finas primero, para que queden por detrás de los puntos
    const grupoLineas = crearSVG("g", { stroke: "#cfe0ff", "stroke-opacity": "0.4", "stroke-width": "1.2" });
    LINEAS_ORION.forEach(([a, b]) => {
        const [x1, y1] = punto(a), [x2, y2] = punto(b);
        grupoLineas.appendChild(crearSVG("line", { x1, y1, x2, y2 }));
    });
    capa.appendChild(grupoLineas);

    // Halo suave + punto sólido por estrella (idéntico a escena-cielos.js)
    ESTRELLAS_ORION.forEach(e => {
        const [x, y] = [CENTRO_ORION_X + e.dx, e.y];
        capa.appendChild(crearSVG("circle", {
            cx: x, cy: y, r: e.r * 2.4, fill: e.color, "fill-opacity": 0.18
        }));
        capa.appendChild(crearSVG("circle", {
            cx: x, cy: y, r: e.r, fill: e.color
        }));
    });

});