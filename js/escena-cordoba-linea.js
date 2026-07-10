/* ==========================================================================
   LÍNEA DE TIEMPO — CÓRDOBA
   ==========================================================================
   Puente entre escena-luz (el mecanismo) y escena-mundo (el mismo patrón en
   todo el planeta): un caso local, con 4 años puntuales, mostrando cómo
   fue bajando la cantidad de estrellas visibles a medida que crecieron la
   población y la edificación.

   ⚠️ Los datos de CORDOBA (magnitud límite, estrellas visibles, población)
   son ILUSTRATIVOS — se armaron para que la escena funcione, no salen de
   una fuente medida. Antes de publicar, reemplazar por datos reales
   (mismo criterio que ya usa el panel de ciudades de escena-6).

   6 pasos de scroll, pinneados (mismo patrón que escena-transicion-datos.js
   / escena-transicion-fisica.js):
   1) Aparece la línea de tiempo completa, con los 4 círculos ya con su
      propia mini cantidad de estrellas adentro (overview).
   2) Foco en 1980.
   3) Foco en 2000.
   4) Foco en 2016.
   5) Foco en 2025.
   6) Cierre: por qué pasó esto (población + edificación), con 2025 todavía
      en foco.

   En paralelo, el resplandor cálido de fondo crece paso a paso y el campo
   de estrellas de fondo se va apagando — mismo lenguaje visual que
   escena-luz.js, aplicado acá a una línea de tiempo en vez de a un slider.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const pin = document.querySelector(".pin-cordoba");
    if (!pin) return; // La escena no está en esta página.

    const NS = "http://www.w3.org/2000/svg";
    function crearSVG(tag, attrs = {}) {
        const el = document.createElementNS(NS, tag);
        for (const clave in attrs) el.setAttribute(clave, attrs[clave]);
        return el;
    }

    // PRNG determinístico (mismo patrón que el resto del proyecto): mismo
    // cielo "orgánico" en cada carga de la página.
    function crearRandom(semilla) {
        let a = semilla >>> 0;
        return function () {
            a |= 0; a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    const azar = crearRandom(19800101);
    const entre = (min, max) => min + azar() * (max - min);

    // ⚠️ Ver nota de datos ilustrativos en el encabezado del archivo.
    const CORDOBA = [
        {
            anio: 1980, id: "1980", x: 150, densidad: 1,
            magnitud: "6,1", estrellas: "≈2.500", poblacion: "≈980 mil",
        },
        {
            anio: 2000, id: "2000", x: 483, densidad: 0.55,
            magnitud: "5,0", estrellas: "≈900", poblacion: "≈1,3 millones",
        },
        {
            anio: 2016, id: "2016", x: 817, densidad: 0.2,
            magnitud: "4,0", estrellas: "≈150", poblacion: "≈1,5 millones",
        },
        {
            anio: 2025, id: "2025", x: 1150, densidad: 0.06,
            magnitud: "3,2", estrellas: "≈35", poblacion: "≈1,6 millones",
        }
    ];

    const RADIO_PUNTO = 40;
    const Y_PUNTOS = 420;

    // ======================================================================
    // 1. ESTRELLAS DE FONDO — campo disperso, mismo criterio que
    //    escena-luz.js (color y tamaño), se va apagando con el resplandor.
    // ======================================================================
    const capaEstrellasFondo = document.getElementById("ct-estrellas-fondo");
    (function generarEstrellasFondo() {
        for (let i = 0; i < 110; i++) {
            capaEstrellasFondo.appendChild(crearSVG("circle", {
                cx: entre(0, 1400), cy: entre(20, 380), r: entre(1.3, 3.2),
                fill: "#f5f7ff", opacity: entre(0.4, 0.95)
            }));
        }
    })();

    // ======================================================================
    // 2. LOS 4 PUNTOS DE LA LÍNEA DE TIEMPO — cada uno con su propia mini
    //    cantidad de estrellas adentro (recortadas al círculo con
    //    clip-path), así la diferencia entre años ya se nota en el
    //    overview, antes de hacer foco en ninguno.
    // ======================================================================
    const capaPuntos = document.getElementById("ct-puntos");
    const svgCordoba = document.getElementById("svg-cordoba-linea");
    const defs = svgCordoba.querySelector("defs");

    CORDOBA.forEach(d => {
        const grupo = crearSVG("g", { id: `ct-punto-${d.id}`, class: "ct-punto" });

        // Halo cálido detrás, apagado hasta que este año entra en foco.
        grupo.appendChild(crearSVG("circle", {
            cx: d.x, cy: Y_PUNTOS, r: RADIO_PUNTO + 26,
            fill: "#ffd166", "fill-opacity": 0.25, class: "ct-punto-halo"
        }));

        // Círculo del cielo de ese año + su propio clip para recortar las
        // estrellas exactamente adentro.
        const clipId = `ct-clip-${d.id}`;
        const clip = crearSVG("clipPath", { id: clipId });
        clip.appendChild(crearSVG("circle", { cx: d.x, cy: Y_PUNTOS, r: RADIO_PUNTO }));
        defs.appendChild(clip);

        grupo.appendChild(crearSVG("circle", {
            cx: d.x, cy: Y_PUNTOS, r: RADIO_PUNTO,
            fill: "#0a0c16", stroke: "#4a4560", "stroke-width": 2
        }));

        // Mini estrellas adentro del círculo — cantidad proporcional a
        // "densidad" (1 = 1980, casi 0 = 2025).
        const miniEstrellas = crearSVG("g", { "clip-path": `url(#${clipId})` });
        const cantidad = Math.round(28 * d.densidad) + 2;
        for (let i = 0; i < cantidad; i++) {
            const ang = entre(0, Math.PI * 2);
            const rad = entre(0, RADIO_PUNTO - 4);
            miniEstrellas.appendChild(crearSVG("circle", {
                cx: d.x + Math.cos(ang) * rad,
                cy: Y_PUNTOS + Math.sin(ang) * rad,
                r: entre(0.9, 2.1), fill: "#f5f7ff", opacity: entre(0.6, 1)
            }));
        }
        grupo.appendChild(miniEstrellas);

        // Año, debajo del círculo.
        const texto = crearSVG("text", {
            x: d.x, y: Y_PUNTOS + RADIO_PUNTO + 34, class: "ct-punto-anio"
        });
        texto.textContent = d.anio;
        grupo.appendChild(texto);

        capaPuntos.appendChild(grupo);
    });

    // ======================================================================
    // 3. SCROLL — 6 pasos
    // ======================================================================
    const resplandor = document.getElementById("ct-resplandor");
    const textos = document.querySelectorAll("[data-paso-ct]");
    const disparadores = document.querySelectorAll(".ct-disparador");

    // Cuánto resplandor y cuánto se apagan las estrellas de fondo en cada
    // paso — va creciendo en paralelo a como avanzan los años.
    const RESPLANDOR_POR_PASO = { 1: 0, 2: 0.12, 3: 0.4, 4: 0.68, 5: 0.9, 6: 0.9 };
    const ESTRELLAS_FONDO_POR_PASO = { 1: 1, 2: 0.85, 3: 0.6, 4: 0.4, 5: 0.22, 6: 0.22 };
    const FOCO_POR_PASO = { 2: "1980", 3: "2000", 4: "2016", 5: "2025", 6: "2025" };

    function actualizarPaso(paso) {
        resplandor.style.opacity = RESPLANDOR_POR_PASO[paso] ?? 0;
        capaEstrellasFondo.style.opacity = ESTRELLAS_FONDO_POR_PASO[paso] ?? 1;

        const focoActivo = FOCO_POR_PASO[paso] || null;
        ["1980", "2000", "2016", "2025"].forEach(id => {
            pin.classList.toggle(`ct-foco-${id}`, focoActivo === id && paso < 6);
        });
        pin.classList.toggle("ct-cierre", paso === 6);

        textos.forEach(t => {
            t.classList.toggle("ct-texto-activo", Number(t.getAttribute("data-paso-ct")) === paso);
        });
    }

    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                actualizarPaso(Number(entrada.target.getAttribute("data-paso-ct")));
            }
        });
    }, { root: null, rootMargin: "-30% 0px -50% 0px", threshold: 0 });

    disparadores.forEach(d => observador.observe(d));

});