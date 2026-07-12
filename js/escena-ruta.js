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
        // Mismo radio y opacidad que usa escena-luz.js (CONFIG.estrellas):
        // r entre 1.3 y 3.6, opacidad entre 0.55 y 1 — para que el cielo se
        // sienta parte del mismo sistema visual en las dos escenas.
        for (let i = 0; i < 90; i++) {
            capa.appendChild(crearSVG("circle", {
                cx: entre(0, 1400), cy: entre(15, 380), r: entre(1.3, 3.6),
                fill: "#f5f7ff", opacity: entre(0.55, 1)
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
    // 4. EL AUTO — hecho de cero, calcado de la referencia que pasó el
    //    usuario: silueta bien redondeada tipo "auto de juguete", contorno
    //    negro grueso uniforme (look sticker/dibujado a mano), una sola
    //    ventana grande partida al medio por un parante fino, ruedas
    //    simples (aro claro + centro oscuro, sin rayos) y espejo lateral.
    //    Acá va en rojo en vez del celeste original.
    //
    //    Todo el dibujo va adentro de un grupo escalado (CUERPO_ESCALA) para
    //    que el auto se vea más chico sin tener que recalcular a mano cada
    //    coordenada; el ancla de esa escala es el punto donde tocan el piso
    //    las ruedas (RUEDA_CY), así el auto se achica "desde abajo" y no
    //    queda flotando ni hundido en la ruta.
    // ======================================================================
    const RUEDA_CY = 458;
    const RUEDA_R = 27;
    const RUEDA_TRASERA_CX = -58;
    const RUEDA_DELANTERA_CX = 58;
    const AUTO_COLOR = "#2f8fae";        // antes: "#4fc3e6" — celeste más oscuro
    const AUTO_COLOR_SOMBRA = "#1e647c"; // antes: "#2e93ad"
    const CONTORNO = "#1a1512";
    const CUERPO_ESCALA = 0.72;

    const grupoCuerpo = crearSVG("g", {
        // Espejado horizontal (scale X negativo): el auto sigue viajando de
        // izquierda a derecha (ver X_INICIO/X_FIN más abajo), pero ahora se
        // ve invertido — mismo ancla en x=0, no hace falta compensar con
        // ningún translate extra en X.
        transform: `translate(0, ${RUEDA_CY * (1 - CUERPO_ESCALA)}) scale(${-CUERPO_ESCALA}, ${CUERPO_ESCALA})`
    });
    grupoAuto.appendChild(grupoCuerpo);

    // Cada rueda es un grupo "eje" fijo (no rota) + un grupo "disco" adentro
    // que sí rota — así el aro y el centro giran juntos como una rueda de
    // verdad, sin desarmarse. Simples, como en la referencia: sin rayos,
    // sólo aro claro + centro oscuro + una marquita que delata el giro.
    const ruedas = []; // { disco, cx } — se usa en el scroll más abajo

    function generarRueda(cx) {
        const eje = crearSVG("g", {});
        const disco = crearSVG("g", {});
        disco.appendChild(crearSVG("circle", {
            cx, cy: RUEDA_CY, r: RUEDA_R, fill: "#1c1a1a", stroke: CONTORNO, "stroke-width": 3
        }));
        disco.appendChild(crearSVG("circle", { cx, cy: RUEDA_CY, r: 15, fill: "#d9dade" }));
        disco.appendChild(crearSVG("circle", { cx, cy: RUEDA_CY, r: 15, fill: "none", stroke: CONTORNO, "stroke-width": 2 }));
        // Marquita que gira con la rueda — sin ella, aunque gire, se ve
        // igual en cada frame.
        disco.appendChild(crearSVG("line", {
            x1: cx - 9, y1: RUEDA_CY - 9, x2: cx + 9, y2: RUEDA_CY + 9,
            stroke: CONTORNO, "stroke-width": 2.5, "stroke-linecap": "round", opacity: 0.5
        }));
        eje.appendChild(disco);
        ruedas.push({ disco, cx });
        return eje;
    }

    (function generarAuto() {
        // Sombra ovalada en el piso — afuera del grupo escalado, para que no
        // se achique junto con la carrocería.
        grupoAuto.appendChild(crearSVG("ellipse", {
            cx: -2, cy: 494, rx: 78, ry: 11, fill: "#000000", opacity: 0.3
        }));

        // Arcos sobre las ruedas: sombra semicircular oscura detrás de cada
        // rueda, dibujada ANTES que la carrocería — da la sensación de un
        // hueco recortado en la chapa (igual que en la referencia, donde se
        // ve un huequito alrededor de cada rueda) sin necesitar un path con
        // boolean/evenodd.
        [RUEDA_TRASERA_CX, RUEDA_DELANTERA_CX].forEach(cx => {
            grupoCuerpo.appendChild(crearSVG("path", {
                d: `M ${cx - 36},460 A 36 36 0 0 1 ${cx + 36},460 Z`,
                fill: AUTO_COLOR_SOMBRA
            }));
        });

        // Carrocería: silueta única bien redondeada (nada de esquinas duras,
        // como el ícono de referencia), con contorno negro grueso uniforme
        // tipo sticker. Techo curvo de punta a punta, trompa redondeada
        // adelante (derecha, hacia donde avanza), parte trasera también
        // curva (no vertical seca) para que se lea "de juguete".
        grupoCuerpo.appendChild(crearSVG("path", {
            d: "M-112,460 " +
               "C-95,436 -140,408 -65,388 " +
               "C-50,368 -48,349 -40,336 " +
               "C-14,325 20,323 46,328 " +
               "C70,333 92,349 102,370 " +
               "C110,388 113,410 110,432 " +
               "C108,446 110,454 108,460 Z",
            fill: AUTO_COLOR, stroke: CONTORNO, "stroke-width": 5, "stroke-linejoin": "round"
        }));

        // Ventana: un solo vidrio grande (como en la referencia, casi todo
        // el ancho de la cabina), marco propio con contorno y un parante
        // central fino que lo separa en dos.
        grupoCuerpo.appendChild(crearSVG("rect", {
            x: -22, y: 345, width: 45, height: 37, rx: 8,
            fill: "#0f1622", stroke: CONTORNO, "stroke-width": 10
        }));
        grupoCuerpo.appendChild(crearSVG("rect", {
            x: -22, y: 345, width: 45, height: 37, rx: 8, fill: "#f9f9f9d6"
        }));

        grupoCuerpo.appendChild(crearSVG("rect", {
            x: -34, y: 393, width: 16, height: 5, rx: 2.5, fill: CONTORNO, opacity: 0.55
        }));

        // Faro delantero — puntito claro cerca de la trompa.
        grupoCuerpo.appendChild(crearSVG("circle", { cx: -98, cy: 415, r: 7, fill: "#ffe9b0" }));

        // Ruedas — adentro del mismo grupo escalado que la carrocería, para
        // que achiquen en la misma proporción y no queden desbalanceadas.
        grupoCuerpo.appendChild(generarRueda(RUEDA_TRASERA_CX));
        grupoCuerpo.appendChild(generarRueda(RUEDA_DELANTERA_CX));
    })();


    // ======================================================================
    // 5. SCROLL — posición del auto en sincro directo (sin pasos)
    // ======================================================================
    const X_INICIO = 60;
    const X_FIN = 1340;

    const contenedorRuta = document.querySelector(".contenedor-fijo-ruta");

    function actualizar() {
        const rect = seccion.getBoundingClientRect();
        const alturaScrolleable = seccion.offsetHeight - window.innerHeight;
        let progreso = alturaScrolleable > 0 ? (-rect.top) / alturaScrolleable : 0;
        progreso = Math.min(1, Math.max(0, progreso));

        // 1) VISIBILIDAD. La escena arranca con "visibility: hidden" (ver
        //    .escena-scroll-ruta en styles.css): como tiene margin-top -100vh
        //    para solaparse con escena-4, si estuviera visible desde el vamos
        //    se le vería asomar una franja blanca por abajo mientras todavía
        //    está corriendo el destello. El umbral es apretado a propósito
        //    (30px): para cuando se enciende, escena-4 ya está 100% blanca,
        //    así que el relevo entre una y otra es literalmente invisible —
        //    blanco sobre blanco.
        seccion.classList.toggle("ruta-en-escena", rect.top <= 30);

        // 2) EL VELO BLANCO (continuación del destello de escena-4) se disuelve
        //    recién cuando este sticky ya quedó pinneado arriba de todo — o sea,
        //    exactamente cuando la escena anterior terminó de salir. Antes de
        //    eso la pantalla sigue blanca, así que no hay ningún corte ni
        //    pantalla vacía entre una escena y la otra.
        if (contenedorRuta) {
            contenedorRuta.classList.toggle("ruta-revelada", rect.top <= 4);
        }

        const x = X_INICIO + progreso * (X_FIN - X_INICIO);
        grupoAuto.setAttribute("transform", `translate(${x}, 0)`);

        // Rotación de ruedas: ángulo = distancia recorrida / radio (en
        // radianes), así que a más avanza el auto, más vueltas dan — con
        // ruedas más chicas girarían más rápido para la misma distancia,
        // que es exactamente lo que pasa con ruedas de verdad.
        const distanciaRecorrida = x - X_INICIO;
        const angulo = (distanciaRecorrida / (RUEDA_R * CUERPO_ESCALA)) * (180 / Math.PI);
        ruedas.forEach(r => {
            r.disco.setAttribute("transform", `rotate(${angulo} ${r.cx} ${RUEDA_CY})`);
        });

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