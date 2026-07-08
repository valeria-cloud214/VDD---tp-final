/* ==========================================================================
   ESCENA 6 — Comparación de cielos (Buenos Aires / Firmat / Junín)
   ==========================================================================
   Reemplaza las tres fotos originales por una única ilustración SVG que se
   arma con JS: un cielo nocturno de base, más estrellas de fondo cuya
   cantidad y brillo cambian según la ciudad (eso es lo que se quiere mostrar:
   a menos contaminación lumínica, más estrellas). Orión se dibuja UNA sola
   vez (misma posición en las tres ciudades, es la constelación que Jorge
   siempre encuentra), pero sus propias estrellas se van revelando de a
   poco: en Buenos Aires sólo se distinguen bien las dos más brillantes, en
   Firmat aparecen unas cuantas más, y en Junín se ve completa. Así el hover
   también cambia con el lugar, en vez de mostrar siempre los mismos datos.

   El cambio entre ciudades lo sigue disparando el scroll existente en
   main.js (que le pone la clase "cielo-bsas" / "cielo-firmat" / "cielo-junin"
   a #cielo-estrellas); acá sólo generamos el contenido SVG y sumamos el
   hover interactivo sobre cada estrella de Orión.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const contenedorCielo = document.getElementById("cielo-estrellas");
    if (!contenedorCielo) return; // La escena no está en esta página.

    const NS = "http://www.w3.org/2000/svg";
    function crearSVG(tag, attrs = {}) {
        const el = document.createElementNS(NS, tag);
        for (const clave in attrs) el.setAttribute(clave, attrs[clave]);
        return el;
    }

    // PRNG determinístico: mismo cielo "orgánico" en cada carga de la página.
    function crearRandom(semilla) {
        let a = semilla >>> 0;
        return function () {
            a |= 0; a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    const azar = crearRandom(70719);
    const entre = (min, max) => min + azar() * (max - min);

    // ======================================================================
    // ANCHO DEL MUNDO
    // ======================================================================
    // Ya probamos dos veces "adivinar" un viewBox de proporción fija (900,
    // después 1300) y también medir el contenedor en JS para calcularlo al
    // vuelo — las dos formas dejaban franjas vacías en algunas pantallas
    // (la segunda, probablemente por timing: el contenedor puede no tener
    // todavía su tamaño final cuando corre este script). La solución
    // definitiva está en el propio SVG (ver index.html:
    // preserveAspectRatio="none"): eso hace que el navegador estire el
    // contenido para llenar EXACTO el contenedor, sin franjas y sin
    // recortes, sea cual sea la pantalla. Acá alcanza con un ancho de
    // referencia fijo — ya no necesita coincidir con nada.
    const ANCHO_MUNDO = 1300;

    /** Convierte una fracción del ancho (0 a 1) en una coordenada X real.
     *  Todas las posiciones "fijas" (torres, casas, árboles) se definen así
     *  en vez de en píxeles sueltos, para que sea fácil reacomodarlas. */
    const frac = (f) => ANCHO_MUNDO * f;

    const CONFIG = {
        cieloX: { min: 25, max: ANCHO_MUNDO - 25 },
        cieloY: { min: 15, max: 815 },
        estrellas: {
            bsas: { cantidad: 14, radioMin: 1, radioMax: 1.8, opacidadMin: 0.22, opacidadMax: 0.5 },
            firmat: { cantidad: 55, radioMin: 1, radioMax: 2.1, opacidadMin: 0.4, opacidadMax: 0.85 },
            junin: { cantidad: 170, radioMin: 1, radioMax: 2.5, opacidadMin: 0.55, opacidadMax: 1 }
        },
        viaLactea: { cantidad: 90 }
    };

    // ======================================================================
    // 1. ESTRELLAS DE FONDO — una densidad distinta por ciudad
    // ======================================================================
    function generarEstrellas(contenedor, cfg) {
        for (let i = 0; i < cfg.cantidad; i++) {
            const estrella = crearSVG("circle", {
                cx: entre(CONFIG.cieloX.min, CONFIG.cieloX.max),
                cy: entre(CONFIG.cieloY.min, CONFIG.cieloY.max),
                r: entre(cfg.radioMin, cfg.radioMax),
                fill: "#f5f7ff",
                opacity: entre(cfg.opacidadMin, cfg.opacidadMax)
            });
            contenedor.appendChild(estrella);
        }
    }
    generarEstrellas(document.getElementById("estrellas-bsas"), CONFIG.estrellas.bsas);
    generarEstrellas(document.getElementById("estrellas-firmat"), CONFIG.estrellas.firmat);
    generarEstrellas(document.getElementById("estrellas-junin"), CONFIG.estrellas.junin);

    // ======================================================================
    // 2. VÍA LÁCTEA — sólo se revela en el cielo más oscuro (Junín)
    // ======================================================================
    (function generarViaLactea() {
        const capa = document.getElementById("capa-via-lactea");
        if (!capa) return;

        // Nube difusa de fondo (una elipse rotada, muy tenue), centrada en
        // el ancho real del mundo (ver ANCHO_MUNDO más arriba).
        const centroViaLacteaX = ANCHO_MUNDO * 0.5;
        const banda = crearSVG("ellipse", {
            cx: centroViaLacteaX, cy: 430, rx: 750, ry: 65,
            fill: "#cfd9ff", opacity: 0.05,
            transform: `rotate(-28 ${centroViaLacteaX} 430)`
        });
        capa.appendChild(banda);

        // Textura: muchas estrellitas diminutas dispersas a lo largo de la
        // misma diagonal, para que se lea como una franja y no una mancha.
        const angulo = (-28 * Math.PI) / 180;
        const dx = Math.cos(angulo), dy = Math.sin(angulo);
        for (let i = 0; i < CONFIG.viaLactea.cantidad; i++) {
            const t = entre(-430, 430);
            const jitter = entre(-40, 40);
            const x = centroViaLacteaX + dx * t - dy * jitter;
            const y = 430 + dy * t + dx * jitter;
            capa.appendChild(crearSVG("circle", {
                cx: x, cy: y, r: entre(0.5, 1.3),
                fill: "#eef2ff", opacity: entre(0.25, 0.6)
            }));
        }
    })();

    // ======================================================================
    // 3. HORIZONTE — el paisaje de cada lugar, no sólo el cielo
    // ======================================================================
    // La idea: el cielo no cambia "porque sí" entre una ciudad y otra — cambia
    // porque el LUGAR cambia. Por eso cada horizonte tiene su propia escala:
    // Buenos Aires es una skyline alta y apretada con ventanas encendidas,
    // Firmat son edificios bajos de pueblo, y Junín son casitas entre árboles.

    /** Tinte de piso: un rect grande y sutil que da a cada suelo un tono
     *  propio (asfalto frío en la ciudad, tierra en el pueblo, verde oscuro
     *  en el paisaje serrano) sin necesitar una capa nueva para eso. */
    function agregarTinteSuelo(contenedor, color, opacidad) {
        contenedor.appendChild(crearSVG("rect", { x: 0, y: 800, width: ANCHO_MUNDO, height: 200, fill: color, opacity: opacidad }));
    }

    /** Genera una fila de edificios y, opcionalmente, ventanas encendidas
     *  (algunas sí, otras no, para que se vea orgánico y no un patrón). */
    function generarHorizonteEdificios(contenedor, { cantidad, anchoMin, anchoMax, altoMin, altoMax, color, ventanas }) {
        const paso = ANCHO_MUNDO / cantidad;
        for (let i = 0; i < cantidad; i++) {
            const w = entre(anchoMin, anchoMax);
            const h = entre(altoMin, altoMax);
            const x = i * paso + entre(-8, 8);
            const y = 850 - h;
            contenedor.appendChild(crearSVG("rect", { x, y, width: w, height: h, fill: color }));

            if (ventanas) {
                for (let wy = y + 10; wy < 840 - 10; wy += ventanas.paso) {
                    for (let wx = x + 7; wx < x + w - 7; wx += ventanas.paso) {
                        if (azar() > ventanas.densidad) continue;
                        contenedor.appendChild(crearSVG("rect", {
                            x: wx, y: wy, width: ventanas.ancho, height: ventanas.alto, fill: ventanas.color
                        }));
                    }
                }
            }
        }
    }

    /** Una casa (o cabaña, con el techo más empinado) chica: cuerpo + techo a
     *  dos aguas + una ventanita que no siempre está prendida. Se usa tanto
     *  para las casas de Firmat como para las cabañas de Junín. */
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

    /** Un pino simple (tronco + capas triangulares), para el paisaje de Junín. */
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

    // --- Buenos Aires: skyline alta, densa y bien encendida ----------------
    (function generarHorizonteBsas() {
        const capa = document.getElementById("horizonte-bsas");
        if (!capa) return;
        agregarTinteSuelo(capa, "#0e1220", 0.6); // asfalto frío
        generarHorizonteEdificios(capa, {
            cantidad: 13, anchoMin: 42, anchoMax: 72, altoMin: 95, altoMax: 210,
            color: "#181328",
            ventanas: { paso: 13, ancho: 4, alto: 6, densidad: 0.4, color: "#ffb454" }
        });
        // Un par de torres bien por encima del resto: refuerzan "gran ciudad".
        [frac(0.154), frac(0.777)].forEach(cx => {
            const w = 58, h = entre(240, 280), x = cx - w / 2, y = 850 - h;
            capa.appendChild(crearSVG("rect", { x, y, width: w, height: h, fill: "#161225" }));
            for (let wy = y + 12; wy < 838; wy += 13) {
                for (let wx = x + 7; wx < x + w - 7; wx += 13) {
                    if (azar() > 0.4) continue;
                    capa.appendChild(crearSVG("rect", { x: wx, y: wy, width: 4, height: 6, fill: "#ffb454" }));
                }
            }
        });
    })();

    // --- Firmat: edificios bajos de pueblo + casas, más sueltos ------------
    (function generarHorizonteFirmat() {
        const capa = document.getElementById("horizonte-firmat");
        if (!capa) return;
        agregarTinteSuelo(capa, "#1c1810", 0.5); // tierra / calle de pueblo
        generarHorizonteEdificios(capa, {
            cantidad: 6, anchoMin: 55, anchoMax: 88, altoMin: 30, altoMax: 58,
            color: "#181328",
            ventanas: { paso: 16, ancho: 4, alto: 6, densidad: 0.22, color: "#ffb454" }
        });
        // Casas bajas intercaladas entre los edificios: ya no es sólo un
        // centro comercial en miniatura, se ve un pueblo de verdad.
        [frac(0.077), frac(0.288), frac(0.512), frac(0.735), frac(0.942)].forEach(cx => {
            generarCasa(capa, cx, {
                ancho: entre(46, 60), alto: entre(20, 28), altoTecho: entre(14, 18),
                colorCuerpo: "#181328", colorTecho: "#120e1e", probVentana: 0.5
            });
        });
    })();

    // --- Junín: casitas y cabañas entre árboles, casi sin luces ------------
    (function generarHorizonteJunin() {
        const capa = document.getElementById("horizonte-junin");
        if (!capa) return;
        agregarTinteSuelo(capa, "#0d1c12", 0.55); // verde oscuro, paisaje

        // Árboles primero (quedan atrás de las casas y cabañas)
        const posicionesArboles = [0.045, 0.111, 0.183, 0.278, 0.333, 0.389, 0.478, 0.555, 0.622, 0.689, 0.767, 0.833, 0.889, 0.955].map(frac);
        posicionesArboles.forEach((x, i) => {
            generarArbol(capa, x, entre(44, 80), i % 2 === 0 ? "#122417" : "#0f1e13");
        });

        // Un par de casitas de pueblo (techo más bajo)...
        [frac(0.235), frac(0.665)].forEach(cx => {
            generarCasa(capa, cx, {
                ancho: 62, alto: 22, altoTecho: 18,
                colorCuerpo: "#181328", colorTecho: "#120e1e", probVentana: 0.6
            });
        });
        // ...y un par de cabañas de montaña (más angostas, techo bien
        // empinado — el típico refugio de madera de la zona andina).
        [frac(0.412), frac(0.812)].forEach(cx => {
            generarCasa(capa, cx, {
                ancho: 44, alto: 26, altoTecho: 30,
                colorCuerpo: "#1a1712", colorTecho: "#100c08", probVentana: 0.45
            });
        });

        // Más árboles adelante, sobre las casas, para que se sienta "rodeado".
        [0.212, 0.288, 0.377, 0.465, 0.554, 0.642, 0.735, 0.865].map(frac)
            .forEach(x => generarArbol(capa, x, entre(28, 48), "#0f1e13"));
    })();

    // ======================================================================
    // 4. ORIÓN — la figura no se mueve, pero se va revelando por ciudad
    // ======================================================================
    // Cada estrella tiene una magnitud real (mag, cuanto más baja más
    // brillante), pero lo que se MUESTRA es una "magnitud percibida": la
    // real más una penalización propia de cada ciudad, que simula cuánto le
    // cuesta a esa estrella destacarse contra el resplandor del lugar. Así
    // el número cambia con el lugar (no tendría sentido que la estrella se
    // vea distinto pero el dato quede fijo), y de paso decide sola —
    // comparándose con la Magnitud límite real de cada ciudad— cuáles
    // estrellas ya se distinguen y cuáles no.
    const ORDEN_CIUDADES = { bsas: 0, firmat: 1, junin: 2 };
    const LIMITE_CIUDAD = { bsas: 4.1, firmat: 5.4, junin: 6.3 };
    // En Junín la penalización es 0: bajo el cielo más oscuro de los tres,
    // lo que se ve es directamente la magnitud real de la estrella.
    const PENALIZACION_CIUDAD = { bsas: 3.5, firmat: 3.4, junin: 0 };

    function magnitudPercibida(magReal, ciudad) {
        return magReal + PENALIZACION_CIUDAD[ciudad];
    }
    function formatearMagnitud(num) {
        return num.toFixed(2).replace(".", ",");
    }
    /** A partir de qué ciudad la magnitud percibida ya entra dentro del
     *  límite de visibilidad de ese lugar (acumulativo: bsas → firmat → junin). */
    function primeraCiudadVisible(magReal) {
        if (magnitudPercibida(magReal, "bsas") <= LIMITE_CIUDAD.bsas) return "bsas";
        if (magnitudPercibida(magReal, "firmat") <= LIMITE_CIUDAD.firmat) return "firmat";
        return "junin";
    }

    // La figura de Orión tiene un tamaño fijo en unidades del mundo (no se
    // estira con el ancho de pantalla, como una constelación real); lo único
    // que cambia es dónde queda su centro, que siempre se recalcula al medio
    // exacto del ancho disponible (CENTRO_ORION).
    const CENTRO_ORION = ANCHO_MUNDO / 2;
    const ESTRELLAS_ORION = [
        { nombre: "Rigel", x: CENTRO_ORION - 88, y: 460, r: 6, color: "#cfe3ff", mag: 0.13, dato: "La estrella más brillante de Orión, unas 120.000 veces más luminosa que el Sol." },
        { nombre: "Betelgeuse", x: CENTRO_ORION - 70, y: 295, r: 5.4, color: "#ffb37a", mag: 0.42, dato: "Una supergigante roja: cuando termine su vida va a explotar como supernova." },
        { nombre: "Bellatrix", x: CENTRO_ORION + 80, y: 280, r: 4, color: "#eaf1ff", mag: 1.64, dato: "El hombro izquierdo del cazador, según la mitología griega." },
        { nombre: "Alnilam", x: CENTRO_ORION, y: 366, r: 3.6, color: "#ffffff", mag: 1.69, dato: "La estrella central del cinturón, aunque en realidad es la más lejana de las tres." },
        { nombre: "Alnitak", x: CENTRO_ORION + 36, y: 374, r: 3.5, color: "#ffffff", mag: 1.88, dato: "Cierra el Cinturón de Orión, justo al lado de la Nebulosa de la Llama." },
        { nombre: "Saiph", x: CENTRO_ORION + 88, y: 462, r: 4.2, color: "#cfe3ff", mag: 2.09, dato: "El otro pie del cazador: casi tan caliente como Rigel, pero mucho más lejos." },
        { nombre: "Mintaka", x: CENTRO_ORION - 32, y: 358, r: 3.4, color: "#ffffff", mag: 2.25, dato: "La primera de las tres estrellas del Cinturón de Orión." }
    ];

    // Líneas que arman la figura (por coordenadas, no por índice, para que se
    // lean solas sin depender del orden del array de arriba). Mismos offsets
    // desde CENTRO_ORION que usa cada estrella en ESTRELLAS_ORION.
    const LINEAS_ORION = [
        [CENTRO_ORION - 70, 295, CENTRO_ORION - 32, 358], // Betelgeuse → Mintaka
        [CENTRO_ORION + 80, 280, CENTRO_ORION + 36, 374], // Bellatrix → Alnitak
        [CENTRO_ORION - 32, 358, CENTRO_ORION, 366],      // Cinturón: Mintaka → Alnilam
        [CENTRO_ORION, 366, CENTRO_ORION + 36, 374],      // Cinturón: Alnilam → Alnitak
        [CENTRO_ORION - 32, 358, CENTRO_ORION - 88, 460], // Mintaka → Rigel
        [CENTRO_ORION + 36, 374, CENTRO_ORION + 88, 462]  // Alnitak → Saiph
    ];

    (function generarOrion() {
        const capa = document.getElementById("capa-orion");
        if (!capa) return;

        const lineas = crearSVG("g", { stroke: "#cfe0ff", "stroke-opacity": "0.4", "stroke-width": "1.2" });
        LINEAS_ORION.forEach(([x1, y1, x2, y2]) => {
            lineas.appendChild(crearSVG("line", { x1, y1, x2, y2 }));
        });
        capa.appendChild(lineas);

        ESTRELLAS_ORION.forEach(estrella => {
            const revelaEn = primeraCiudadVisible(estrella.mag);
            const g = crearSVG("g", {
                class: `estrella-orion revela-${revelaEn}`,
                "data-nombre": estrella.nombre,
                "data-magnitud-real": estrella.mag,
                "data-revela-en": revelaEn,
                "data-dato": estrella.dato
            });
            // Halo suave detrás (también crece un poco con el hover, vía CSS).
            // Usa fill-opacity (no "opacity") para que el fundido entre
            // "todavía no se distingue" y "ya se distingue" —que se maneja
            // con la propiedad CSS "opacity"— no lo pise.
            g.appendChild(crearSVG("circle", {
                cx: estrella.x, cy: estrella.y, r: estrella.r * 2.4,
                fill: estrella.color, "fill-opacity": 0.18, class: "punto-estrella"
            }));
            // El punto de la estrella en sí
            g.appendChild(crearSVG("circle", {
                cx: estrella.x, cy: estrella.y, r: estrella.r,
                fill: estrella.color, class: "punto-estrella"
            }));
            // Área de hover más grande que el punto visible: más fácil de
            // acertar con el mouse, sobre todo en las estrellas chicas.
            g.appendChild(crearSVG("circle", {
                cx: estrella.x, cy: estrella.y, r: estrella.r + 16,
                fill: "transparent"
            }));
            capa.appendChild(g);
        });
    })();

    // ======================================================================
    // 5. TOOLTIP — sigue al cursor mientras hoverea una estrella de Orión
    // ======================================================================
    (function conectarTooltip() {
        const tooltip = document.getElementById("tooltip-estrella");
        if (!tooltip) return;

        // A qué ciudad corresponde el cielo que se está mostrando ahora
        // mismo, para poder comparar contra el "revelaEn" de cada estrella.
        function ciudadActual() {
            if (contenedorCielo.classList.contains("cielo-junin")) return "junin";
            if (contenedorCielo.classList.contains("cielo-firmat")) return "firmat";
            return "bsas";
        }

        function posicionar(e) {
            const rect = contenedorCielo.getBoundingClientRect();
            const anchoTooltip = 260, altoTooltip = 130;
            let x = e.clientX - rect.left + 18;
            let y = e.clientY - rect.top + 18;
            if (x + anchoTooltip > rect.width) x = e.clientX - rect.left - anchoTooltip - 14;
            if (y + altoTooltip > rect.height) y = rect.height - altoTooltip - 10;
            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
        }

        document.querySelectorAll(".estrella-orion").forEach(g => {
            const nombre = g.getAttribute("data-nombre");
            const magReal = parseFloat(g.getAttribute("data-magnitud-real"));
            const dato = g.getAttribute("data-dato");
            const revelaEn = g.getAttribute("data-revela-en");

            g.addEventListener("mouseenter", (e) => {
                const ciudad = ciudadActual();
                const yaSeVe = ORDEN_CIUDADES[ciudad] >= ORDEN_CIUDADES[revelaEn];
                const magMostrada = formatearMagnitud(magnitudPercibida(magReal, ciudad));
                const nota = yaSeVe
                    ? "Desde acá se distingue bien."
                    : "Con la contaminación lumínica de este lugar, todavía cuesta encontrarla.";
                // Contenido armado con datos propios (no de usuarios): no hay
                // riesgo de inyección al usar innerHTML acá. La magnitud que
                // se muestra es la percibida DESDE ESTE LUGAR, no un dato de
                // libro: por eso cambia si se hoverea la misma estrella en
                // otra ciudad.
                tooltip.innerHTML = `<strong>${nombre}</strong><span class="magnitud">Magnitud aparente desde acá: ${magMostrada}</span><p>${dato}</p><p class="nota-visibilidad">${nota}</p>`;
                tooltip.classList.add("visible");
                posicionar(e);
            });
            g.addEventListener("mousemove", posicionar);
            g.addEventListener("mouseleave", () => tooltip.classList.remove("visible"));
        });
    })();

});
