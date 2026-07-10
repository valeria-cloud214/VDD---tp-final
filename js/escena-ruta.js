/* ==========================================================================
   ESCENA 5 — Ruta con auto
   ==========================================================================
   Reemplaza la foto + texto de "decidí estudiar Astronomía" por un mapa
   ilustrado: un camino horizontal con 3 carteles (Buenos Aires, Firmat,
   Junín) y un auto que lo recorre.

   A propósito NO usa IntersectionObserver + pasos como el resto de las
   escenas: el auto lee la posición del scroll en cada frame y se mueve en
   sincro directo con el dedo/rueda del mouse, para que el movimiento sea
   continuo de verdad y no una sucesión de saltos. Los carteles se
   "encienden" solos cuando el auto los pasa.

   Mismo lenguaje visual que el resto del sitio: crearSVG + PRNG
   determinístico para las estrellas (ver js/escena-cielos.js), colores ya
   usados en otras escenas (acento #ffd166, cielo #0a1220 → #1c2a4a).
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const seccion = document.getElementById("escena-5");
    const grupoAuto = document.getElementById("ruta-auto");
    if (!seccion || !grupoAuto) return; // La escena no está en esta página.

    const NS = "http://www.w3.org/2000/svg";
    function crearSVG(tag, attrs = {}) {
        const el = document.createElementNS(NS, tag);
        for (const clave in attrs) el.setAttribute(clave, attrs[clave]);
        return el;
    }

    function crearRandom(semilla) {
        let a = semilla >>> 0;
        return function () {
            a |= 0; a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    const azar = crearRandom(19850604);
    const entre = (min, max) => min + azar() * (max - min);

    // ======================================================================
    // 1. CIELO — estrellas discretas + horizonte, arriba del camino
    // ======================================================================
    (function generarEstrellas() {
        const capa = document.getElementById("ruta-estrellas");
        for (let i = 0; i < 90; i++) {
            capa.appendChild(crearSVG("circle", {
                cx: entre(0, 1400), cy: entre(15, 380), r: entre(0.8, 2.2),
                fill: "#f5f7ff", opacity: entre(0.3, 0.9)
            }));
        }
    })();

    (function generarHorizonte() {
        const capa = document.getElementById("ruta-horizonte");
        capa.appendChild(crearSVG("path", {
            d: "M0,470 L0,430 Q120,400 260,420 Q420,445 560,410 Q740,368 900,415 " +
               "Q1080,458 1220,425 Q1320,402 1400,430 L1400,470 Z",
            fill: "#0d1420"
        }));
    })();

    // ======================================================================
    // 2. LÍNEA CENTRAL DEL CAMINO (discontinua)
    // ======================================================================
    (function generarLineaCentral() {
        const capa = document.getElementById("ruta-linea-central");
        const linea = crearSVG("line", {
            x1: 0, y1: 519, x2: 1400, y2: 519,
            stroke: "#e8c873", "stroke-width": 5, "stroke-dasharray": "34 26", opacity: 0.85
        });
        capa.appendChild(linea);
    })();

    // ======================================================================
    // 3. CARTELES — Buenos Aires, Firmat, Junín, sobre el camino
    // ======================================================================
    const CIUDADES = [
        { nombre: "Buenos Aires", x: 150 },
        { nombre: "Firmat", x: 700 },
        { nombre: "Junín", x: 1250 }
    ];

    const carteles = []; // { el, umbral } — se usa en el scroll más abajo

    (function generarCarteles() {
        const capa = document.getElementById("ruta-carteles");

        CIUDADES.forEach(ciudad => {
            const g = crearSVG("g", { class: "ruta-cartel", transform: `translate(${ciudad.x}, 0)` });

            // Halo cálido detrás del tablero, apagado hasta que el auto pasa
            g.appendChild(crearSVG("circle", {
                cx: 0, cy: 300, r: 100, fill: "url(#ruta-grad-halo-cartel)", class: "ruta-cartel-halo"
            }));

            // Poste
            g.appendChild(crearSVG("rect", {
                x: -6, y: 340, width: 12, height: 145, fill: "#3e2b1c"
            }));

            // Tablero
            g.appendChild(crearSVG("rect", {
                x: -95, y: 270, width: 190, height: 74, rx: 10,
                class: "ruta-cartel-tablero", "stroke-width": 3
            }));

            // Nombre de la ciudad
            const texto = crearSVG("text", {
                x: 0, y: 315, "text-anchor": "middle",
                "font-family": "'Nunito', sans-serif", "font-weight": 700, "font-size": 26,
                class: "ruta-cartel-texto"
            });
            texto.textContent = ciudad.nombre;
            g.appendChild(texto);

            capa.appendChild(g);
            carteles.push({ el: g, umbral: ciudad.x - 10 });
        });
    })();

    // ======================================================================
    // 4. EL AUTO — réplica del ícono de auto de juguete que pasó el usuario,
    //    en rojo: una sola silueta sólida (sin bordes ni piezas sueltas),
    //    dos ventanas blancas, ruedas simples tipo "dona" (negro-blanco-
    //    negro, sin rayos) y una sombra ovalada abajo. Se arma una sola vez;
    //    su posición se actualiza con el scroll.
    // ======================================================================
    const RUEDA_CY = 458;
    const RUEDA_TRASERA_CX = -62;
    const RUEDA_DELANTERA_CX = 58;
    const FITITO_ROJO = "#d32f2f";

    function generarRueda(cx) {
        const g = crearSVG("g", {});
        g.appendChild(crearSVG("circle", { cx, cy: RUEDA_CY, r: 26, fill: "#1a1a1a" }));
        g.appendChild(crearSVG("circle", { cx, cy: RUEDA_CY, r: 19, fill: "#ffffff" }));
        g.appendChild(crearSVG("circle", { cx, cy: RUEDA_CY, r: 11, fill: "#1a1a1a" }));
        return g;
    }

    (function generarAuto() {
        // Sombra ovalada, como en el ícono original
        grupoAuto.appendChild(crearSVG("ellipse", {
            cx: -2, cy: 494, rx: 98, ry: 13, fill: "#000000", opacity: 0.3
        }));

        // Carrocería: UNA sola silueta cerrada (nada de piezas sueltas con
        // su propio borde superpuesto), igual que el ícono de referencia —
        // atrás sube casi vertical hacia el techo, el techo es una curva
        // suave arriba, y adelante baja en una pendiente larga hasta el
        // paragolpes. Sin contorno: el ícono original tampoco tiene.
        grupoAuto.appendChild(crearSVG("path", {
            d: "M-105,466 L-105,436 C-105,388 -88,346 -50,330 " +
               "C-24,319 22,319 46,329 C74,341 98,373 103,410 " +
               "C106,428 106,448 104,466 Z",
            fill: FITITO_ROJO
        }));

        // Ventanas: dos rectángulos blancos separados por un parantito
        // (que es, simplemente, el rojo de la carrocería asomando en el
        // medio — no hace falta dibujarlo aparte)
        grupoAuto.appendChild(crearSVG("rect", {
            x: -58, y: 342, width: 44, height: 48, rx: 8, fill: "#ffffff"
        }));
        grupoAuto.appendChild(crearSVG("rect", {
            x: -4, y: 342, width: 50, height: 48, rx: 8, fill: "#ffffff"
        }));

        // Ruedas
        grupoAuto.appendChild(generarRueda(RUEDA_TRASERA_CX));
        grupoAuto.appendChild(generarRueda(RUEDA_DELANTERA_CX));
    })();


    // ======================================================================
    // 5. SCROLL — posición del auto en sincro directo (sin pasos)
    // ======================================================================
    const X_INICIO = 60;
    const X_FIN = 1340;

    function actualizar() {
        const rect = seccion.getBoundingClientRect();
        const alturaScrolleable = seccion.offsetHeight - window.innerHeight;
        let progreso = alturaScrolleable > 0 ? (-rect.top) / alturaScrolleable : 0;
        progreso = Math.min(1, Math.max(0, progreso));

        const x = X_INICIO + progreso * (X_FIN - X_INICIO);
        grupoAuto.setAttribute("transform", `translate(${x}, 0)`);

        carteles.forEach(c => {
            c.el.classList.toggle("ruta-cartel-visitado", x >= c.umbral);
        });
    }

    let esperandoFrame = false;
    window.addEventListener("scroll", () => {
        if (!esperandoFrame) {
            requestAnimationFrame(() => { actualizar(); esperandoFrame = false; });
            esperandoFrame = true;
        }
    }, { passive: true });
    window.addEventListener("resize", actualizar);

    actualizar(); // estado inicial, por si la escena ya está a la vista al cargar

});