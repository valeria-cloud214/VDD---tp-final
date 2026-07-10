/* ==========================================================================
   ESCENA DE TRANSICIÓN — Apagón + eco de Orión (entre escena-4 y escena-5)
   ==========================================================================
   Es el "salto grande" entre la zona-cuento (fotos, calidez) y la
   zona-datos (ruta, infografía): la pantalla se va a negro total, en ese
   negro queda Orión solo unos segundos —la misma constelación que viene
   acompañando a Jorge desde escena-2— y esa misma Orión es la que, al
   apagarse, se convierte en el campo de estrellas con el que arranca la
   escena de la ruta.

   Misma técnica de siempre para dibujar la constelación (halo suave +
   punto sólido + líneas finas, ver js/escena-cielos.js / escena-jorge.js),
   sólo que acá va centrada en pantalla y no sobre una foto.

   3 pasos de scroll, pinneados (mismo patrón que escena-transicion-datos.js
   y escena-transicion-fisica.js):
   1) Orión aparece sobre el negro.
   2) Se sostiene un instante (el "silencio" antes del salto).
   3) Se disuelve mientras asoma, detrás, el primer vistazo del cielo frío
      de la ruta — la escena-5 ya arranca directamente en ese tono.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const capa = document.getElementById("capa-orion-apagon");
    const pin = document.querySelector(".pin-orion-apagon");
    if (!capa || !pin) return; // La escena no está en esta página.

    const NS = "http://www.w3.org/2000/svg";
    function crearSVG(tag, attrs = {}) {
        const el = document.createElementNS(NS, tag);
        for (const clave in attrs) el.setAttribute(clave, attrs[clave]);
        return el;
    }

    // El viewBox de #svg-orion-apagon es 1366x768 (ver index.html). Mismos
    // offsets relativos que en js/escena-jorge.js: ese rango de "y" (entre
    // 280 y 462) ya cae naturalmente cerca del centro vertical del
    // viewBox, así que no hace falta ningún corrimiento extra — sólo
    // centrarla en el eje horizontal.
    const CENTRO_ORION_X = 683;

    const ESTRELLAS_ORION = [
        { dx: -88, y: 460, r: 7, color: "#cfe3ff" },   // Rigel
        { dx: -70, y: 295, r: 6.2, color: "#ffb37a" }, // Betelgeuse
        { dx: 80, y: 280, r: 4.6, color: "#eaf1ff" },  // Bellatrix
        { dx: 0, y: 366, r: 4.1, color: "#ffffff" },   // Alnilam
        { dx: 36, y: 374, r: 4, color: "#ffffff" },    // Alnitak
        { dx: 88, y: 462, r: 4.8, color: "#cfe3ff" },  // Saiph
        { dx: -32, y: 358, r: 3.9, color: "#ffffff" }  // Mintaka
    ];

    const LINEAS_ORION = [[1, 6], [2, 4], [6, 3], [3, 4], [6, 0], [4, 5]];

    const punto = (i) => [CENTRO_ORION_X + ESTRELLAS_ORION[i].dx, ESTRELLAS_ORION[i].y];

    const grupoLineas = crearSVG("g", { stroke: "#cfe0ff", "stroke-opacity": "0.5", "stroke-width": "1.4" });
    LINEAS_ORION.forEach(([a, b]) => {
        const [x1, y1] = punto(a), [x2, y2] = punto(b);
        grupoLineas.appendChild(crearSVG("line", { x1, y1, x2, y2 }));
    });
    capa.appendChild(grupoLineas);

    ESTRELLAS_ORION.forEach(e => {
        const x = CENTRO_ORION_X + e.dx, y = e.y;
        capa.appendChild(crearSVG("circle", {
            cx: x, cy: y, r: e.r * 2.6, fill: e.color, "fill-opacity": 0.22
        }));
        capa.appendChild(crearSVG("circle", {
            cx: x, cy: y, r: e.r, fill: e.color
        }));
    });

    // ======================================================================
    // SCROLL — 3 pasos
    // ======================================================================
    const disparadores = document.querySelectorAll(".oa-disparador");

    function actualizarPaso(paso) {
        pin.classList.toggle("oa-oscurece", paso >= 1);
        pin.classList.toggle("oa-orion-visible", paso >= 1 && paso < 3);
        pin.classList.toggle("oa-orion-disolviendo", paso >= 3);
        pin.classList.toggle("oa-fondo-visible", paso >= 3);
    }

    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                actualizarPaso(Number(entrada.target.getAttribute("data-paso-oa")));
            }
        });
    }, { root: null, rootMargin: "-30% 0px -50% 0px", threshold: 0 });

    disparadores.forEach(d => observador.observe(d));

});