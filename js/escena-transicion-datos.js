/* ==========================================================================
   ESCENA 6A — De la observación a la investigación
   ==========================================================================
   Hasta acá Jorge sólo estuvo mirando. Esta escena es el momento en que
   empieza a querer entender. El cielo que se ve es el mismo de Junín con el
   que terminó la escena 6 (misma composición, mismo tono — se regenera acá
   con la misma técnica de js/escena-cielos.js), pero ya a pantalla completa:
   el panel lateral de la escena 6 no se duplica acá, así que no hay ningún
   recuadro que aparezca y vuelva a desaparecer.

   4 partes en 9 pasos de scroll (antes eran 13 pasos para la misma idea —
   demasiados cambios de texto para lo que en el fondo es un solo
   razonamiento). El texto ya no siempre reemplaza al anterior: en las
   partes 1 y 3 se va ACUMULANDO, para que se sienta como una idea que se
   arma de a poco y no como pantallas sueltas:
   1) el razonamiento inicial se arma línea por línea (pasos 1-3);
   2) un único bloque editorial, con mucho aire (paso 4);
   3) las hipótesis se acumulan una debajo de otra (pasos 5-8);
   4) todo se disuelve y queda sólo la frase de cierre (paso 9).
   En paralelo, el paisaje se sigue simplificando hasta convertirse en
   información — mismos disparadores visuales de antes (simplifica /
   anotado / patrón / final), sólo remapeados a los pasos nuevos.

   El cambio de paso lo dispara el scroll (9 disparadores de 100vh, ver
   #escena-6a en index.html), con el mismo patrón de IntersectionObserver que
   ya usan escena-5/6c en main.js.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const cielo = document.getElementById("td-cielo");
    if (!cielo) return; // La escena no está en esta página.

    const NS = "http://www.w3.org/2000/svg";
    function crearSVG(tag, attrs = {}) {
        const el = document.createElementNS(NS, tag);
        for (const clave in attrs) el.setAttribute(clave, attrs[clave]);
        return el;
    }

    // PRNG determinístico: mismo cielo "orgánico" en cada carga de la página
    // (semilla propia, distinta de la de escena-cielos.js).
    function crearRandom(semilla) {
        let a = semilla >>> 0;
        return function () {
            a |= 0; a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    const azar = crearRandom(83114);
    const entre = (min, max) => min + azar() * (max - min);

    const ANCHO_MUNDO = 1300;
    const frac = (f) => ANCHO_MUNDO * f;

    // ======================================================================
    // 1. ESTRELLAS — misma densidad que el cielo de Junín en escena 6. Cada
    //    tantas estrellas queda "emparejada" con un pequeño marcador
    //    geométrico en las mismas coordenadas (capa #td-nodos, oculta hasta
    //    el paso "patrón"): así, cuando llega ese momento, no aparece nada
    //    nuevo — la propia estrella se revela como dato.
    // ======================================================================
    const capaEstrellas = document.getElementById("td-estrellas");
    const capaNodos = document.getElementById("td-nodos");
    const TOTAL_ESTRELLAS = 170;
    const nodosCoords = [];

    for (let i = 0; i < TOTAL_ESTRELLAS; i++) {
        const cx = entre(25, ANCHO_MUNDO - 25);
        const cy = entre(15, 815);
        const r = entre(1, 2.5);
        capaEstrellas.appendChild(crearSVG("circle", {
            cx, cy, r, fill: "#f5f7ff", opacity: entre(0.5, 1)
        }));

        if (i % 7 === 0) {
            capaNodos.appendChild(crearSVG("rect", {
                x: cx - 4, y: cy - 4, width: 8, height: 8,
                transform: `rotate(45 ${cx} ${cy})`,
                class: "td-nodo"
            }));
            nodosCoords.push([cx, cy]);
        }
    }

    // Unas pocas líneas finas conectando nodos cercanos en la secuencia: da
    // sensación de red de datos, no de gráfico prolijo.
    for (let i = 3; i < nodosCoords.length; i += 4) {
        const [x1, y1] = nodosCoords[i - 3];
        const [x2, y2] = nodosCoords[i];
        capaNodos.insertBefore(
            crearSVG("line", { x1, y1, x2, y2, class: "td-nodo-linea" }),
            capaNodos.firstChild
        );
    }

    // ======================================================================
    // 2. VÍA LÁCTEA — misma franja diagonal tenue que en Junín
    // ======================================================================
    (function generarViaLactea() {
        const capa = document.getElementById("td-via-lactea");
        const centroX = ANCHO_MUNDO * 0.5;
        capa.appendChild(crearSVG("ellipse", {
            cx: centroX, cy: 430, rx: 750, ry: 65,
            fill: "#cfd9ff", opacity: 0.05,
            transform: `rotate(-28 ${centroX} 430)`
        }));

        const angulo = (-28 * Math.PI) / 180;
        const dx = Math.cos(angulo), dy = Math.sin(angulo);
        for (let i = 0; i < 90; i++) {
            const t = entre(-430, 430);
            const jitter = entre(-40, 40);
            const x = centroX + dx * t - dy * jitter;
            const y = 430 + dy * t + dx * jitter;
            capa.appendChild(crearSVG("circle", {
                cx: x, cy: y, r: entre(0.5, 1.3),
                fill: "#eef2ff", opacity: entre(0.25, 0.6)
            }));
        }
    })();

    // ======================================================================
    // 3. HORIZONTE DE JUNÍN — árboles y casitas, misma estética que escena 6
    // ======================================================================
    function generarCasa(contenedor, cx, { ancho, alto, altoTecho, colorCuerpo, colorTecho, probVentana = 0.55 }) {
        const x = cx - ancho / 2, y = 850 - alto;
        contenedor.appendChild(crearSVG("rect", { x, y, width: ancho, height: alto, fill: colorCuerpo }));
        contenedor.appendChild(crearSVG("polygon", {
            points: `${x - 6},${y} ${x + ancho + 6},${y} ${x + ancho / 2},${y - altoTecho}`,
            fill: colorTecho
        }));
        if (azar() < probVentana) {
            contenedor.appendChild(crearSVG("rect", {
                x: x + ancho / 2 - 3, y: y + alto * 0.35, width: 6, height: 6, fill: "#ffb454"
            }));
        }
    }

    function generarArbol(contenedor, x, altura, colorCopa) {
        const anchoCopa = altura * 0.55;
        const altoTronco = altura * 0.2;
        contenedor.appendChild(crearSVG("rect", {
            x: x - 2, y: 850 - altoTronco, width: 4, height: altoTronco, fill: "#1c1712"
        }));
        const capas = 3;
        for (let i = 0; i < capas; i++) {
            const factor = 1 - i * 0.24;
            const wCapa = anchoCopa * factor;
            const yBase = 850 - altoTronco - (i * altura * 0.62) / capas;
            const yPico = yBase - altura * 0.42;
            contenedor.appendChild(crearSVG("polygon", {
                points: `${x - wCapa / 2},${yBase} ${x + wCapa / 2},${yBase} ${x},${yPico}`,
                fill: colorCopa
            }));
        }
    }

    (function generarHorizonteJunin() {
        const capa = document.getElementById("td-horizonte");
        capa.appendChild(crearSVG("rect", { x: 0, y: 800, width: ANCHO_MUNDO, height: 200, fill: "#0d1c12", opacity: 0.55 }));

        [0.045, 0.111, 0.183, 0.278, 0.333, 0.389, 0.478, 0.555, 0.622, 0.689, 0.767, 0.833, 0.889, 0.955]
            .map(frac)
            .forEach((x, i) => generarArbol(capa, x, entre(44, 80), i % 2 === 0 ? "#122417" : "#0f1e13"));

        [frac(0.235), frac(0.665)].forEach(cx => {
            generarCasa(capa, cx, { ancho: 62, alto: 22, altoTecho: 18, colorCuerpo: "#181328", colorTecho: "#120e1e", probVentana: 0.6 });
        });
        [frac(0.412), frac(0.812)].forEach(cx => {
            generarCasa(capa, cx, { ancho: 44, alto: 26, altoTecho: 30, colorCuerpo: "#1a1712", colorTecho: "#100c08", probVentana: 0.45 });
        });

        [0.212, 0.288, 0.377, 0.465, 0.554, 0.642, 0.735, 0.865].map(frac)
            .forEach(x => generarArbol(capa, x, entre(28, 48), "#0f1e13"));
    })();

    // ======================================================================
    // 4. ORIÓN — la misma figura de siempre, ya completa (estamos en Junín)
    // ======================================================================
    const CENTRO_ORION = ANCHO_MUNDO / 2;
    const ESTRELLAS_ORION = [
        { x: CENTRO_ORION - 88, y: 460, r: 6, color: "#cfe3ff" },
        { x: CENTRO_ORION - 70, y: 295, r: 5.4, color: "#ffb37a" },
        { x: CENTRO_ORION + 80, y: 280, r: 4, color: "#eaf1ff" },
        { x: CENTRO_ORION, y: 366, r: 3.6, color: "#ffffff" },
        { x: CENTRO_ORION + 36, y: 374, r: 3.5, color: "#ffffff" },
        { x: CENTRO_ORION + 88, y: 462, r: 4.2, color: "#cfe3ff" },
        { x: CENTRO_ORION - 32, y: 358, r: 3.4, color: "#ffffff" }
    ];
    const LINEAS_ORION = [
        [CENTRO_ORION - 70, 295, CENTRO_ORION - 32, 358],
        [CENTRO_ORION + 80, 280, CENTRO_ORION + 36, 374],
        [CENTRO_ORION - 32, 358, CENTRO_ORION, 366],
        [CENTRO_ORION, 366, CENTRO_ORION + 36, 374],
        [CENTRO_ORION - 32, 358, CENTRO_ORION - 88, 460],
        [CENTRO_ORION + 36, 374, CENTRO_ORION + 88, 462]
    ];

    (function generarOrion() {
        const capa = document.getElementById("td-orion");
        const lineas = crearSVG("g", { stroke: "#cfe0ff", "stroke-opacity": "0.4", "stroke-width": "1.2" });
        LINEAS_ORION.forEach(([x1, y1, x2, y2]) => lineas.appendChild(crearSVG("line", { x1, y1, x2, y2 })));
        capa.appendChild(lineas);

        ESTRELLAS_ORION.forEach(e => {
            capa.appendChild(crearSVG("circle", { cx: e.x, cy: e.y, r: e.r * 2.4, fill: e.color, "fill-opacity": 0.18 }));
            capa.appendChild(crearSVG("circle", { cx: e.x, cy: e.y, r: e.r, fill: e.color }));
        });
    })();

    // ======================================================================
    // 5. ANOTACIONES — trazos finos, como si Jorge empezara a analizar lo
    //    que vio. No son un gráfico: son apuntes sueltos sobre el cielo.
    // ======================================================================
    (function generarAnotaciones() {
        const capa = document.getElementById("td-anotaciones");
        const puntos = [[260, 220], [420, 160], [610, 250], [860, 190], [1040, 300]];

        for (let i = 1; i < puntos.length; i++) {
            const [x1, y1] = puntos[i - 1];
            const [x2, y2] = puntos[i];
            capa.appendChild(crearSVG("line", { x1, y1, x2, y2, class: "td-anotacion-linea" }));
        }
        puntos.forEach(([x, y]) => {
            capa.appendChild(crearSVG("circle", { cx: x, cy: y, r: 5, class: "td-anotacion-punto" }));
        });
    })();

    // ======================================================================
    // 6. SCROLL — los 9 pasos de la escena (ver el desglose por partes en
    //    el comentario del encabezado del archivo)
    // ======================================================================
    const lineasRazonamiento = document.querySelectorAll("[data-linea-td]");
    const contenedorRazonamiento = document.getElementById("td-razonamiento");
    const frases = document.querySelectorAll("[data-frase-td]");
    const hipotesis = document.querySelectorAll("[data-hip-td]");
    const contenedorHipotesis = document.getElementById("td-hipotesis-contenedor");
    const disparadores = document.querySelectorAll(".td-disparador");

    // Qué frase suelta corresponde a cada paso: 1 = bloque editorial
    // (segunda parte), 2 = frase de cierre (cuarta parte). El resto de los
    // pasos (razonamiento, hipótesis) no activan ninguna de éstas.
    const FRASE_POR_PASO = { 4: 1, 9: 2 };

    function actualizarPaso(paso) {
        // Transformación visual progresiva del paisaje (mismos disparadores
        // de siempre, remapeados a los 9 pasos nuevos).
        cielo.classList.toggle("td-simplifica", paso >= 3);
        cielo.classList.toggle("td-anotado", paso >= 4 && paso < 8);
        cielo.classList.toggle("td-patron", paso >= 8);
        cielo.classList.toggle("td-final", paso >= 9);

        // PRIMERA PARTE — el razonamiento se arma de a poco: cada línea
        // llega desde su propio paso y ninguna se retira; el bloque entero
        // se desvanece recién cuando arranca la segunda parte (paso 4).
        if (contenedorRazonamiento) contenedorRazonamiento.classList.toggle("td-visible", paso >= 1 && paso <= 3);
        lineasRazonamiento.forEach(l => {
            const desde = Number(l.getAttribute("data-linea-td")); // 1, 2, 2, 3
            l.classList.toggle("activo-td", paso >= desde);
        });

        // SEGUNDA y CUARTA PARTE — frases sueltas, sólo una activa a la vez.
        const fraseActiva = FRASE_POR_PASO[paso] || null;
        frases.forEach(f => {
            const num = Number(f.getAttribute("data-frase-td"));
            f.classList.toggle("activo-td", fraseActiva !== null && num === fraseActiva);
        });

        // TERCERA PARTE — hipótesis: se acumulan (cada una desde su propio
        // paso) y se desvanecen todas juntas cuando llega la frase de
        // cierre. La más reciente se lee con fuerza; las anteriores quedan
        // más tenues (ver .td-hipotesis-anterior).
        hipotesis.forEach(h => {
            const desde = Number(h.getAttribute("data-hip-td")) + 4; // 1→5, 2→6, 3→7, 4→8
            h.classList.toggle("activo-td", paso >= desde && paso < 9);
            h.classList.toggle("td-hipotesis-anterior", paso > desde);
        });
        if (contenedorHipotesis) contenedorHipotesis.classList.toggle("td-oculto", paso >= 9);
    }

    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                actualizarPaso(Number(entrada.target.getAttribute("data-paso-td")));
            }
        });
    }, { root: null, rootMargin: "-30% 0px -50% 0px", threshold: 0 });

    disparadores.forEach(d => observador.observe(d));

});
