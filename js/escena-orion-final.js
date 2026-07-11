/* ==========================================================================
   ORIÓN SOBRE LA FOTO DE ÉL RECIBIÉNDOSE (dentro del paso 2 de escena-4)
   ==========================================================================
   El paso a paso de scroll (cuándo aparece, cuándo encandila) lo maneja
   LÓGICA ESCENA 4 en main.js — ese observer agrega/saca las clases
   .co-orion-aparece y .co-encandila sobre el mismo .paso-corte[data-paso="2"]
   (la foto de él recibiéndose no cambia ni se duplica).

   Este archivo sólo:
   1) dibuja la constelación una vez, al cargar la página.
   2) dispara la revelación de la escena de la ruta cuando aparece en
      pantalla (ver .ruta-revelada en styles.css).
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const capaOrion = document.getElementById("of-orion");
    if (!capaOrion) return; // La escena no está en esta página.

    const NS = "http://www.w3.org/2000/svg";
    function crearSVG(tag, attrs = {}) {
        const el = document.createElementNS(NS, tag);
        for (const clave in attrs) el.setAttribute(clave, attrs[clave]);
        return el;
    }

    // ======================================================================
    // ORIÓN — chica y pegada arriba a la derecha de la imagen (borde con el
    // panel de texto). El viewBox de #svg-orion-final es 1050x700 (mismo
    // ancho que el 75% de la imagen).
    //
    // Coordenadas locales (alrededor de un centro propio en 0,0) + un
    // transform de grupo (traslada y achica) — así ajustar tamaño o
    // posición es tocar sólo ESCALA_ORION / CENTRO_X / CENTRO_Y, sin
    // recalcular cada estrella a mano.
    // ======================================================================
    const ESCALA_ORION = 0.55;
    const CENTRO_X = 645;
    const CENTRO_Y = 150;

    const ESTRELLAS_ORION = [
        { dx: -88, dy: 89, r: 6, color: "#cfe3ff" },    // Rigel
        { dx: -70, dy: -76, r: 5.4, color: "#ffb37a" }, // Betelgeuse
        { dx: 80, dy: -91, r: 4, color: "#eaf1ff" },    // Bellatrix
        { dx: 0, dy: -5, r: 3.6, color: "#ffffff" },    // Alnilam
        { dx: 36, dy: 3, r: 3.5, color: "#ffffff" },    // Alnitak
        { dx: 88, dy: 91, r: 4.2, color: "#cfe3ff" },   // Saiph
        { dx: -32, dy: -13, r: 3.4, color: "#ffffff" }  // Mintaka
    ];
    const LINEAS_ORION = [[1, 6], [2, 4], [6, 3], [3, 4], [6, 0], [4, 5]];
    const punto = (i) => [
        CENTRO_X + ESTRELLAS_ORION[i].dx * ESCALA_ORION,
        CENTRO_Y + ESTRELLAS_ORION[i].dy * ESCALA_ORION
    ];

    const grupoLineas = crearSVG("g", { stroke: "#cfe0ff", "stroke-opacity": "0.45", "stroke-width": "1.2" });
    LINEAS_ORION.forEach(([a, b]) => {
        const [x1, y1] = punto(a), [x2, y2] = punto(b);
        grupoLineas.appendChild(crearSVG("line", { x1, y1, x2, y2 }));
    });
    capaOrion.appendChild(grupoLineas);

    ESTRELLAS_ORION.forEach(e => {
        const x = CENTRO_X + e.dx * ESCALA_ORION;
        const y = CENTRO_Y + e.dy * ESCALA_ORION;
        const r = e.r * ESCALA_ORION;
        capaOrion.appendChild(crearSVG("circle", {
            cx: x, cy: y, r: r * 2.4, fill: e.color, "fill-opacity": 0.2
        }));
        capaOrion.appendChild(crearSVG("circle", {
            cx: x, cy: y, r: r, fill: e.color
        }));
    });

    // El halo que después crece hasta encandilar todo ya está centrado en
    // el mismo punto (ver el <circle> fijo en index.html, cx=945 cy=175).

    // ======================================================================
    // REVELACIÓN DE LA RUTA — "emerge" apenas asoma en pantalla, con su
    // propia animación (ver .ruta-revelada en styles.css).
    // ======================================================================
    const escena5 = document.getElementById("escena-5");
    const contenedorRuta = document.querySelector(".contenedor-fijo-ruta");

    if (escena5 && contenedorRuta) {
        const observadorRuta = new IntersectionObserver((entradas) => {
            entradas.forEach(entrada => {
                if (entrada.isIntersecting) {
                    contenedorRuta.classList.add("ruta-revelada");
                }
            });
        }, { root: null, threshold: 0 });
        observadorRuta.observe(escena5);
    }

});