/* ==========================================================================
   LÍNEA DE TIEMPO — CÓRDOBA
   ==========================================================================
   Puente entre escena-luz (el mecanismo) y escena-mundo (el mismo patrón en
   todo el planeta): un caso local, con 4 años puntuales, mostrando cómo
   fue bajando la cantidad de estrellas visibles a medida que crecieron la
   población y la edificación. El primer beat de texto es el conector en
   primera persona que explica por qué se mira Córdoba capital en
   particular.

   ⚠️ Magnitud límite y estrellas visibles son ILUSTRATIVAS — no salen de
   una fuente medida. La población de cada año sí son datos reales.

   8 pasos de scroll, pinneados (mismo patrón que escena-transicion-datos.js
   / escena-transicion-fisica.js):
   1) Primera oración del conector, sobre el fondo estrellado (todavía sin
      línea de tiempo, y con las estrellas un poco desenfocadas).
   2) Segunda oración (se suma a la primera, ninguna se retira).
   3) Las 2 oraciones se retiran y recién ahí entra la línea de tiempo
      completa — las estrellas de fondo también se enfocan del todo.
   4) Foco en 1980.
   5) Foco en 2000.
   6) Foco en 2016.
   7) Foco en 2025.
   8) Cierre: por qué pasó esto (población + edificación) — acá se
      desbloquea la interactividad: cada círculo se puede tocar para abrir
      su ficha completa (ver PANEL DE DETALLE más abajo). Los 4 círculos
      quedan del mismo tamaño, ninguno se queda "en foco".

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

    // ⚠️ Magnitud límite y estrellas visibles siguen siendo ILUSTRATIVAS —
    // no salen de una fuente medida. La población sí son datos reales
    // (Córdoba capital, según año).
    const CORDOBA = [
        {
            anio: 1980, id: "1980", x: 150, densidad: 1,
            magnitud: "6,1", estrellas: "≈2.500", poblacion: "990.968 habitantes",
            nota: "Casi sin resplandor artificial: se distinguían miles de estrellas a simple vista."
        },
        {
            anio: 2000, id: "2000", x: 483, densidad: 0.55,
            magnitud: "5,0", estrellas: "≈900", poblacion: "1,25 millones de habitantes",
            nota: "La ciudad había crecido en población y en construcción — el resplandor ya tapaba las estrellas más débiles."
        },
        {
            anio: 2016, id: "2016", x: 817, densidad: 0.2,
            magnitud: "4,0", estrellas: "≈150", poblacion: "1.350.000 habitantes",
            nota: "Más edificios y más luces encendidas toda la noche: del cielo original quedaban apenas las estrellas más brillantes."
        },
        {
            anio: 2025, id: "2025", x: 1150, densidad: 0.06,
            magnitud: "3,2", estrellas: "≈35", poblacion: "1.637.000 habitantes",
            nota: "Hoy, en pleno centro, el resplandor de la ciudad opaca casi todo lo demás."
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

        // Clickeable recién cuando termina la recorrida (ver
        // .ct-interactivo más abajo) — el guard vive en abrirDetalle().
        grupo.addEventListener("click", () => abrirDetalle(d));

        capaPuntos.appendChild(grupo);
    });

    // ======================================================================
    // 2b. CÍRCULO EXPANDIDO — al tocar un año, este círculo (mucho más
    //     grande, centrado) muestra su cielo ocupando casi toda la
    //     pantalla. Se arma una sola vez acá y se repuebla de estrellas en
    //     cada apertura (ver mostrarCirculoGrande).
    // ======================================================================
    const RADIO_GRANDE = 230;
    const CENTRO_GRANDE_X = 480;
    const CENTRO_GRANDE_Y = 340;

    const capaCirculoGrande = document.getElementById("ct-circulo-grande");
    const clipGrandeId = "ct-clip-grande";
    const clipGrande = crearSVG("clipPath", { id: clipGrandeId });
    clipGrande.appendChild(crearSVG("circle", { cx: CENTRO_GRANDE_X, cy: CENTRO_GRANDE_Y, r: RADIO_GRANDE }));
    defs.appendChild(clipGrande);

    capaCirculoGrande.appendChild(crearSVG("circle", {
        cx: CENTRO_GRANDE_X, cy: CENTRO_GRANDE_Y, r: RADIO_GRANDE + 18,
        fill: "#ffd166", "fill-opacity": 0.22
    }));
    capaCirculoGrande.appendChild(crearSVG("circle", {
        cx: CENTRO_GRANDE_X, cy: CENTRO_GRANDE_Y, r: RADIO_GRANDE,
        fill: "#0a0c16", stroke: "#4a4560", "stroke-width": 2.5
    }));
    const estrellasGrandes = crearSVG("g", { id: "ct-circulo-grande-estrellas", "clip-path": `url(#${clipGrandeId})` });
    capaCirculoGrande.appendChild(estrellasGrandes);
    const textoAnioGrande = crearSVG("text", {
        x: CENTRO_GRANDE_X, y: CENTRO_GRANDE_Y - RADIO_GRANDE - 30, id: "ct-circulo-grande-anio"
    });
    capaCirculoGrande.appendChild(textoAnioGrande);

    // Repuebla el círculo grande con la densidad de estrellas del año
    // elegido — mismo criterio que las mini estrellas de los puntos chicos.
    function mostrarCirculoGrande(d) {
        estrellasGrandes.innerHTML = "";
        const cantidad = Math.round(90 * d.densidad) + 4;
        for (let i = 0; i < cantidad; i++) {
            const ang = entre(0, Math.PI * 2);
            const rad = entre(0, RADIO_GRANDE - 6);
            estrellasGrandes.appendChild(crearSVG("circle", {
                cx: CENTRO_GRANDE_X + Math.cos(ang) * rad,
                cy: CENTRO_GRANDE_Y + Math.sin(ang) * rad,
                r: entre(1, 2.6), fill: "#f5f7ff", opacity: entre(0.55, 1)
            }));
        }
        textoAnioGrande.textContent = d.anio;
    }

    // ======================================================================
    // 3. PANEL DE DETALLE — se desbloquea recién en el cierre (paso 8): ahí
    //    cada círculo se puede tocar para abrir su ficha completa
    //    (población, magnitud límite, estrellas visibles, nota).
    // ======================================================================
    const panelDetalle = document.getElementById("ct-detalle");
    const botonCerrarDetalle = document.getElementById("ct-detalle-cerrar");
    const campoAnio = document.getElementById("ct-detalle-anio");
    const campoPoblacion = document.getElementById("ct-detalle-poblacion");
    const campoMagnitud = document.getElementById("ct-detalle-magnitud");
    const campoEstrellas = document.getElementById("ct-detalle-estrellas");
    const campoNota = document.getElementById("ct-detalle-nota");

    function abrirDetalle(d) {
        if (!pin.classList.contains("ct-interactivo")) return; // todavía no llegó al cierre

        // Tocar el mismo año que ya está abierto lo cierra (toggle).
        if (panelDetalle.classList.contains("ct-detalle-abierto") && panelDetalle.dataset.anioAbierto === String(d.anio)) {
            cerrarDetalle();
            return;
        }

        campoAnio.textContent = d.anio;
        campoPoblacion.textContent = d.poblacion;
        campoMagnitud.textContent = d.magnitud;
        campoEstrellas.textContent = d.estrellas;
        campoNota.textContent = d.nota;
        panelDetalle.dataset.anioAbierto = String(d.anio);
        panelDetalle.classList.add("ct-detalle-abierto");
        pin.classList.add("ct-detalle-abierto");
        mostrarCirculoGrande(d);

        ["1980", "2000", "2016", "2025"].forEach(id => {
            const punto = document.getElementById(`ct-punto-${id}`);
            if (punto) punto.classList.toggle("ct-punto-seleccionado", id === String(d.anio));
        });
    }

    function cerrarDetalle() {
        panelDetalle.classList.remove("ct-detalle-abierto");
        pin.classList.remove("ct-detalle-abierto");
        delete panelDetalle.dataset.anioAbierto;
        document.querySelectorAll(".ct-punto-seleccionado").forEach(p => p.classList.remove("ct-punto-seleccionado"));
    }

    if (botonCerrarDetalle) botonCerrarDetalle.addEventListener("click", cerrarDetalle);
    // Tocar el fondo (fuera de los círculos y de la tarjeta) también cierra.
    pin.addEventListener("click", (evento) => {
        if (evento.target === pin || evento.target.id === "svg-cordoba-linea" || evento.target.tagName === "rect") {
            cerrarDetalle();
        }
    });

    // ======================================================================
    // 4. SCROLL — 8 pasos
    // ======================================================================
    const resplandor = document.getElementById("ct-resplandor");
    const frasesConector = document.querySelectorAll("[data-frase-conector]");
    const textos = document.querySelectorAll("[data-paso-ct]");
    const disparadores = document.querySelectorAll(".ct-disparador");

    // Cuánto resplandor y cuánto se apagan las estrellas de fondo en cada
    // paso — va creciendo en paralelo a como avanzan los años. Los pasos
    // 1-2 (conector) mantienen el fondo más tenue y desenfocado; recién en
    // el paso 3 (entra la línea de tiempo) el cielo se ve nítido del todo.
    const RESPLANDOR_POR_PASO = { 1: 0, 2: 0, 3: 0, 4: 0.12, 5: 0.4, 6: 0.68, 7: 0.9, 8: 0.9 };
    const ESTRELLAS_FONDO_POR_PASO = { 1: 0.55, 2: 0.55, 3: 1, 4: 0.85, 5: 0.6, 6: 0.4, 7: 0.22, 8: 0.22 };
    const FOCO_POR_PASO = { 4: "1980", 5: "2000", 6: "2016", 7: "2025" };

    function actualizarPaso(paso) {
        resplandor.style.opacity = RESPLANDOR_POR_PASO[paso] ?? 0;
        capaEstrellasFondo.style.opacity = ESTRELLAS_FONDO_POR_PASO[paso] ?? 1;
        // "No tan nítido" mientras se lee el conector (pasos 1-2): un
        // desenfoque chico sobre el campo de estrellas, que se disuelve
        // apenas entra la línea de tiempo.
        capaEstrellasFondo.style.filter = paso <= 2 ? "blur(3px)" : "blur(0px)";

        // Conector: cada oración se suma a la anterior (ninguna se retira)
        // y ambas desaparecen juntas apenas se pasa al paso 3.
        frasesConector.forEach(f => {
            const desde = Number(f.getAttribute("data-frase-conector"));
            f.classList.toggle("activo-conector", paso >= desde && paso <= 2);
        });

        // La línea de tiempo (línea + los 4 círculos) recién aparece cuando
        // ya se leyeron las 2 oraciones del conector.
        pin.classList.toggle("ct-linea-visible", paso >= 3);

        const focoActivo = FOCO_POR_PASO[paso] || null;
        ["1980", "2000", "2016", "2025"].forEach(id => {
            pin.classList.toggle(`ct-foco-${id}`, focoActivo === id);
        });
        // En el cierre (paso 8) ningún año queda "en foco": los 4 círculos
        // se ven del mismo tamaño, listos para tocarlos.
        pin.classList.toggle("ct-interactivo", paso === 8);

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