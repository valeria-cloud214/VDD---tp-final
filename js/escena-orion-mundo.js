/* ==========================================================================
   ORIÓN EN EL MUNDO — mapa mundial + cómo se ve Orión desde cada ciudad
   ==========================================================================
   Puente entre la intro mundial ("lo que descubrí en Argentina no era una
   excepción") y la grilla de contaminación lumínica por país.

   La idea narrativa: antes de mirar los datos de contaminación, Jorge vuelve
   a la promesa de la abuela — "Orión siempre va a estar ahí" — y decide
   comprobarla en serio. ¿Se ve desde cualquier parte del mundo? ¿Y se ve
   IGUAL? La respuesta (sí se ve, pero cada lugar la ve distinta) es lo que
   habilita la pregunta siguiente: ¿y la contaminación, también se repite?

   3 partes, todas dentro de una misma sección pinneada:

   PARTE 1 (pasos 1-6) — sólo texto, frase por frase: lo que rebotaba en su
   cabeza sobre la promesa de la abuela.

   PARTE 2 (pasos 7-10) — el mapa. Aparece en el paso 7 con las 17 ciudades
   marcadas y después hace foco, una por una, en 3 ciudades (una por cada
   forma distinta de ver Orión: hemisferio sur, hemisferio norte, y
   ecuatorial/latitudes bajas). En cada foco se muestra al costado el cielo
   de esa ciudad, con Orión en la orientación que le corresponde de verdad.

   PARTE 3 (pasos 11-14) — transición, frase por frase, hacia la grilla de
   contaminación: los pines quedan clickeables desde el paso 11 (tocás uno y
   se abre su cielo) y el texto empalma con la siguiente escena.

   El mapa se dibuja con d3-geo (ya viene en el bundle de d3 que carga el
   sitio) + topojson. Si la carga del mapa falla (por ejemplo, sin internet),
   la escena NO se rompe: queda la esfera y todos los pines igual — se
   pierde sólo el contorno de los continentes. No lleva grilla de
   meridianos: se sacó para que el mapa se vea más limpio.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const pin = document.querySelector(".pin-orion-mundo");
    if (!pin) return; // La escena no está en esta página.

    const NS = "http://www.w3.org/2000/svg";
    function crearSVG(tag, attrs = {}) {
        const el = document.createElementNS(NS, tag);
        for (const clave in attrs) el.setAttribute(clave, attrs[clave]);
        return el;
    }

    // ======================================================================
    // 1. DATOS — las 4 formas de ver Orión, y qué ciudades caen en cada una
    // ======================================================================
    // "rotacion" es cuántos grados hay que girar la constelación respecto de
    // la vista clásica del hemisferio norte (0° = el cazador de pie).
    const VISTAS = {
        sur: {
            id: "sur",
            titulo: "Cabeza abajo",
            hemisferio: "Hemisferio sur · latitudes −30° a −45°",
            rotacion: 180,
            texto: "Mirando al norte desde el hemisferio sur, Orión se ve completamente dada vuelta. Rigel, la azulada, queda arriba a la izquierda, como la punta de la figura; Betelgeuse, la roja, abajo a la derecha, como su base. Las Tres Marías cruzan el centro en diagonal, de abajo a la izquierda hacia arriba a la derecha.",
            color: "#f4a15d"
        },
        norte: {
            id: "norte",
            titulo: "El cazador de pie",
            hemisferio: "Hemisferio norte · latitudes medias y altas (+35° a +55°)",
            rotacion: 0,
            texto: "Es la postal clásica de los atlas: Orión perfectamente derecha. Betelgeuse arriba a la izquierda (el hombro este), Rigel abajo a la derecha (el pie oeste), y la nebulosa colgando en vertical, debajo de las tres estrellas horizontales del cinturón.",
            color: "#7fb2ff"
        },
        ecuador: {
            id: "ecuador",
            titulo: "Acostada, cruzando el cenit",
            hemisferio: "Latitudes bajas y ecuatoriales (−10° a +20°)",
            rotacion: 90,
            texto: "Cerca del ecuador, Orión pasa directamente por el punto más alto del cielo, de costado. Las Tres Marías quedan casi verticales, como los peldaños de una escalera que sube de este a oeste, y Betelgeuse y Rigel flanquean el cinturón a los lados: un arco horizontal flotando justo arriba tuyo.",
            color: "#d3a7ff"
        }
    };

    // lon/lat de cada ciudad + a qué vista pertenece. Las 4 marcadas con
    // "foco" son las que la escena recorre sola con el scroll (una por cada
    // forma distinta de ver la constelación); las demás quedan igual en el
    // mapa, para tocarlas después.
    const CIUDADES = [
        // --- Hemisferio sur (Orión cabeza abajo) ---
        { nombre: "Buenos Aires",     pais: "Argentina",       lon: -58.38, lat: -34.60, vista: "sur",     foco: 1 },
        { nombre: "Santiago",         pais: "Chile",           lon: -70.65, lat: -33.45, vista: "sur" },
        { nombre: "Ciudad del Cabo",  pais: "Sudáfrica",       lon:  18.42, lat: -33.92, vista: "sur" },

        // --- Hemisferio norte, latitudes medias/altas (el cazador de pie) ---
        { nombre: "Nueva York",       pais: "EE. UU.",         lon: -74.01, lat:  40.71, vista: "norte",   foco: 2 },
        { nombre: "Shanghái",         pais: "China",           lon: 121.47, lat:  31.23, vista: "norte" },
        { nombre: "Lisboa",           pais: "Portugal",        lon:  -9.14, lat:  38.72, vista: "norte" },
        { nombre: "Roma",             pais: "Italia",          lon:  12.50, lat:  41.90, vista: "norte" },
        { nombre: "Atenas",           pais: "Grecia",          lon:  23.73, lat:  37.98, vista: "norte" },
        { nombre: "Tokio",            pais: "Japón",           lon: 139.69, lat:  35.69, vista: "norte" },
        { nombre: "Toronto",          pais: "Canadá",          lon: -79.38, lat:  43.65, vista: "norte" },
        { nombre: "Zagreb",           pais: "Croacia",         lon:  15.98, lat:  45.82, vista: "norte" },
        { nombre: "Skopie",           pais: "Macedonia",       lon:  21.43, lat:  42.00, vista: "norte" },

        // --- Ecuatorial y latitudes bajas (Orión acostada, cruzando el cenit) ---
        { nombre: "Yakarta",          pais: "Indonesia",       lon: 106.85, lat:  -6.21, vista: "ecuador", foco: 3 },
        { nombre: "Belém",            pais: "Brasil",          lon: -48.50, lat:  -1.46, vista: "ecuador" },
        { nombre: "Mumbai",           pais: "India",           lon:  72.88, lat:  19.08, vista: "ecuador" },
        { nombre: "San Juan",         pais: "Puerto Rico",     lon: -66.12, lat:  18.47, vista: "ecuador" },
        { nombre: "Manila",           pais: "Filipinas",       lon: 120.98, lat:  14.60, vista: "ecuador" }
    ];

    // ======================================================================
    // 2. EL MAPA
    // ======================================================================
    const ANCHO = 1000, ALTO = 520;
    const svgMapa = document.getElementById("om-svg-mapa");
    const capaMundo = document.getElementById("om-mundo");
    const capaPines = document.getElementById("om-pines");

    const proyeccion = d3.geoNaturalEarth1()
        .fitExtent([[14, 14], [ANCHO - 14, ALTO - 14]], { type: "Sphere" });
    const camino = d3.geoPath(proyeccion);

    // Esfera: el "fondo" del mapa. Se dibuja siempre, aunque después falle
    // la carga de los continentes. (Sin grilla de meridianos: se sacó para
    // que el mapa se vea más limpio y grande.)
    capaMundo.appendChild(crearSVG("path", { d: camino({ type: "Sphere" }), class: "om-esfera" }));

    // Continentes (opcional: si falla el fetch, la escena sigue funcionando)
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json")
        .then(r => r.json())
        .then(topo => {
            if (!window.topojson) return;
            const tierra = topojson.feature(topo, topo.objects.land);
            const path = crearSVG("path", { d: camino(tierra), class: "om-tierra" });
            capaMundo.appendChild(path);
        })
        .catch(() => { /* sin continentes: queda la esfera + los pines */ });

    // ======================================================================
    // 3. ORIÓN — se dibuja en un círculo de cielo, girada según la vista
    // ======================================================================
    // Coordenadas relativas al centro de la constelación (vista clásica del
    // hemisferio norte). Girando el grupo entero se obtienen las otras 3
    // vistas, que es exactamente lo que pasa en la realidad: la constelación
    // es la misma, lo que cambia es desde dónde la mirás.
    const ORION = [
        { dx: -70, dy: -62, r: 5.2, color: "#ffb37a", nombre: "Betelgeuse" },
        { dx:  62, dy: -70, r: 4.0, color: "#eaf1ff", nombre: "Bellatrix" },
        { dx: -26, dy:  -6, r: 3.3, color: "#ffffff", nombre: "Mintaka" },
        { dx:   2, dy:   0, r: 3.5, color: "#ffffff", nombre: "Alnilam" },
        { dx:  30, dy:   6, r: 3.3, color: "#ffffff", nombre: "Alnitak" },
        { dx: -72, dy:  76, r: 5.6, color: "#cfe3ff", nombre: "Rigel" },
        { dx:  70, dy:  72, r: 4.2, color: "#cfe3ff", nombre: "Saiph" }
    ];
    // Pares por índice: hombros→cinturón→pies, el trazado de siempre.
    const ORION_LINEAS = [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]];

    function crearRandom(semilla) {
        let a = semilla >>> 0;
        return function () {
            a |= 0; a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    const azar = crearRandom(31415);
    const entre = (min, max) => min + azar() * (max - min);

    const CIELO_R = 130;   // radio del círculo de cielo
    const CIELO_CX = 150;
    const CIELO_CY = 150;

    // El círculo de cielo se arma una sola vez; al cambiar de ciudad sólo se
    // rota el grupo de Orión (transición CSS) — así el cambio entre una vista
    // y otra se ve como un giro, no como un corte. Que es, literalmente, lo
    // que la escena quiere contar.
    const svgCielo = document.getElementById("om-svg-cielo");
    const grupoOrion = document.getElementById("om-orion");

    (function armarCielo() {
        const fondo = document.getElementById("om-cielo-fondo");
        for (let i = 0; i < 70; i++) {
            const ang = entre(0, Math.PI * 2);
            const rad = entre(0, CIELO_R - 4);
            fondo.appendChild(crearSVG("circle", {
                cx: CIELO_CX + Math.cos(ang) * rad,
                cy: CIELO_CY + Math.sin(ang) * rad,
                r: entre(0.7, 1.8), fill: "#f5f7ff", opacity: entre(0.25, 0.7)
            }));
        }

        const lineas = crearSVG("g", { class: "om-orion-lineas" });
        ORION_LINEAS.forEach(([a, b]) => {
            lineas.appendChild(crearSVG("line", {
                x1: CIELO_CX + ORION[a].dx * 0.72, y1: CIELO_CY + ORION[a].dy * 0.72,
                x2: CIELO_CX + ORION[b].dx * 0.72, y2: CIELO_CY + ORION[b].dy * 0.72
            }));
        });
        grupoOrion.appendChild(lineas);

        ORION.forEach(e => {
            const x = CIELO_CX + e.dx * 0.72, y = CIELO_CY + e.dy * 0.72;
            grupoOrion.appendChild(crearSVG("circle", {
                cx: x, cy: y, r: e.r * 2.3, fill: e.color, "fill-opacity": 0.2
            }));
            grupoOrion.appendChild(crearSVG("circle", { cx: x, cy: y, r: e.r, fill: e.color }));
        });
    })();

    // ======================================================================
    // 4. LOS PINES DE CADA CIUDAD
    // ======================================================================
    const pinesPorNombre = {};

    CIUDADES.forEach(c => {
        const [x, y] = proyeccion([c.lon, c.lat]);
        const g = crearSVG("g", {
            class: "om-pin" + (c.foco ? " om-pin-foco" : ""),
            "data-ciudad": c.nombre,
            "data-vista": c.vista,
            transform: `translate(${x}, ${y})`
        });

        // Halo (se enciende en el foco / al tocarlo)
        g.appendChild(crearSVG("circle", { cx: 0, cy: 0, r: 16, class: "om-pin-halo" }));
        // Marcador de ubicación: la gotita clásica
        g.appendChild(crearSVG("path", {
            d: "M0,2 C-7,-6 -10,-10 -10,-14 A10,10 0 1 1 10,-14 C10,-10 7,-6 0,2 Z",
            class: "om-pin-gota"
        }));
        g.appendChild(crearSVG("circle", { cx: 0, cy: -14, r: 3.6, class: "om-pin-centro" }));

        const etiqueta = crearSVG("text", { x: 0, y: 18, class: "om-pin-etiqueta" });
        etiqueta.textContent = c.nombre;
        g.appendChild(etiqueta);

        g.addEventListener("click", () => abrirCiudad(c));
        capaPines.appendChild(g);
        pinesPorNombre[c.nombre] = g;
    });

    // ======================================================================
    // 5. EL PANEL DE CIELO — se abre solo en el recorrido, o al tocar un pin
    // ======================================================================
    const panel = document.getElementById("om-panel");
    const panelCiudad = document.getElementById("om-panel-ciudad");
    const panelVista = document.getElementById("om-panel-vista");
    const panelHemisferio = document.getElementById("om-panel-hemisferio");
    const panelTexto = document.getElementById("om-panel-texto");
    const panelCerrar = document.getElementById("om-panel-cerrar");

    let ciudadAbierta = null;

    function abrirCiudad(c) {
        // Sólo clickeable una vez que terminó el recorrido guiado (o sea,
        // durante el recorrido los focos los maneja el scroll).
        if (!pin.classList.contains("om-interactivo") && !c.foco) return;

        const v = VISTAS[c.vista];
        ciudadAbierta = c.nombre;

        panelCiudad.textContent = `${c.nombre}, ${c.pais}`;
        panelVista.textContent = v.titulo;
        panelHemisferio.textContent = v.hemisferio;
        panelTexto.textContent = v.texto;
        panel.classList.add("om-panel-abierto");
        panel.style.setProperty("--om-color-vista", v.color);

        // El giro de Orión: la misma constelación, mirada desde otro lugar.
        grupoOrion.style.transform = `rotate(${v.rotacion}deg)`;

        Object.entries(pinesPorNombre).forEach(([nombre, el]) => {
            el.classList.toggle("om-pin-activo", nombre === c.nombre);
        });
        pin.classList.add("om-hay-seleccion");
    }

    function cerrarPanel() {
        panel.classList.remove("om-panel-abierto");
        pin.classList.remove("om-hay-seleccion");
        ciudadAbierta = null;
        Object.values(pinesPorNombre).forEach(el => el.classList.remove("om-pin-activo"));
    }

    if (panelCerrar) panelCerrar.addEventListener("click", cerrarPanel);

    // ======================================================================
    // 6. SCROLL — 8 pasos
    // ======================================================================
    const textos = document.querySelectorAll("[data-paso-om]");
    const disparadores = document.querySelectorAll(".om-disparador");

    // Qué ciudad se enfoca en cada paso del recorrido guiado (una por cada
    // una de las 3 vistas: sur, norte, ecuatorial).
    const FOCO_POR_PASO = { 8: "Buenos Aires", 9: "Nueva York", 10: "Yakarta" };

    function actualizarPaso(paso) {
        // Pasos 1-6: sólo el texto de la abuela. El mapa entra en el 7.
        pin.classList.toggle("om-mapa-visible", paso >= 7);
        // Al terminar el recorrido guiado (pasos 8-10), todos los pines
        // quedan tocables.
        pin.classList.toggle("om-interactivo", paso >= 11);

        const ciudadPaso = FOCO_POR_PASO[paso];
        if (ciudadPaso) {
            const c = CIUDADES.find(x => x.nombre === ciudadPaso);
            if (c && ciudadAbierta !== c.nombre) abrirCiudad(c);
        } else if (paso < 8 && ciudadAbierta) {
            cerrarPanel();
        }
        // De ahí en más el panel queda como estaba: si el usuario toca
        // otro pin, lo cambia él.

        textos.forEach(t => {
            t.classList.toggle("om-texto-activo", Number(t.getAttribute("data-paso-om")) === paso);
        });
    }

    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                actualizarPaso(Number(entrada.target.getAttribute("data-paso-om")));
            }
        });
    }, { root: null, rootMargin: "-30% 0px -50% 0px", threshold: 0 });

    disparadores.forEach(d => observador.observe(d));

});