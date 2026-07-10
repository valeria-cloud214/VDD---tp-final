/* ==========================================================================
   ESCENA 6A — De la observación a la investigación
   ==========================================================================
   Hasta acá Jorge sólo estuvo mirando. Esta escena es el momento en que
   empieza a querer entender. El fondo ya no es la silueta de una ciudad en
   particular (antes era Junín): es sólo un campo de estrellas — esta escena
   ya no pasa "en" ningún lugar puntual, es el momento en que Jorge deja de
   mirar el cielo de una ciudad y empieza a pensar en los datos en general.

   4 partes en 9 pasos de scroll. El texto no siempre reemplaza al anterior:
   en las partes 1 y 3 se va ACUMULANDO, para que se sienta como una idea
   que se arma de a poco y no como pantallas sueltas:
   1) el razonamiento inicial se arma línea por línea (pasos 1-3);
   2) un único bloque editorial, con mucho aire (paso 4);
   3) las hipótesis se acumulan una debajo de otra (pasos 5-8);
   4) todo se disuelve y queda sólo la frase de cierre (paso 9).
   En paralelo, las estrellas se van convirtiendo en información (nodos y
   líneas finas) y un velo oscurece el fondo hacia el final — mismos
   disparadores visuales de siempre (anotado / patrón / final).

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

    // ======================================================================
    // 1. ESTRELLAS — todo el fondo de la escena, sin horizonte que reservar
    //    abajo. Cada tantas estrellas queda "emparejada" con un pequeño
    //    marcador geométrico en las mismas coordenadas (capa #td-nodos,
    //    oculta hasta el paso "patrón"): así, cuando llega ese momento, no
    //    aparece nada nuevo — la propia estrella se revela como dato.
    // ======================================================================
    const capaEstrellas = document.getElementById("td-estrellas");
    const capaNodos = document.getElementById("td-nodos");
    const TOTAL_ESTRELLAS = 190;
    const nodosCoords = [];

    for (let i = 0; i < TOTAL_ESTRELLAS; i++) {
        const cx = entre(25, ANCHO_MUNDO - 25);
        const cy = entre(15, 985);
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
    // 2. ANOTACIONES — trazos finos, como si Jorge empezara a analizar lo
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
    // 3. SCROLL — los 9 pasos de la escena (ver el desglose por partes en
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
        // Transformación visual progresiva del cielo (mismos disparadores
        // de siempre, remapeados a los 9 pasos nuevos).
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
