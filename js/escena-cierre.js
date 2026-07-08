/* ==========================================================================
   ESCENA DE CIERRE — "El regreso"
   ==========================================================================
   Cierre emocional del proyecto. No es una visualización de datos más: es
   la misma ilustración del principio de la historia (la casa del pueblo, la
   ventana, los árboles, las montañas), sólo que ahora Jorge es adulto y ya
   no hay narración ni datos — sólo contemplación.

   Qué hace este archivo, en orden:
   1) La grilla de gráficos (escena 8) es scroll normal, sin tocar: acá no
      se hace nada con ella. No hay ningún velo/fundido a negro entre la
      grilla y esta escena — se probó y se sacó por completo porque un
      overlay fixed controlado desde afuera (IntersectionObserver) y
      tocado también por GSAP desde adentro quedaba en un estado roto al
      scrollear hacia atrás.
   2) Arma la ilustración SVG (montañas, árboles, la casa, Jorge, el farol
      del pueblo, las estrellas y Orión) dentro de #svg-cierre — visible
      desde el primer instante en que arranca la escena.
   3) Timeline única pinneada — mismo método que la escena de luz: el pin
      visual lo hace position:sticky por CSS (.pin-cierre), GSAP sólo
      scrubbea (pin:false). 5 frases cortas sobre la ilustración → pausa
      de contemplación → la cámara sube siguiendo la mirada de Jorge,
      aparece Orión + 3 frases → aparece el panel del interruptor.
   4) A partir de ahí ya no depende del scroll: el interruptor (click) dispara
      el apagado progresivo de las luces del pueblo y el regreso de las
      estrellas, y programa el mensaje final.
   No toca ninguna otra escena ni archivo existente más que main.js (que ya
   no maneja la vieja conclusión de la grilla) e index.html/styles.css.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        console.warn("GSAP/ScrollTrigger no están disponibles: la escena de cierre no se inicializa.");
        return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const svg = document.getElementById("svg-cierre");
    if (!svg) return; // La escena no está en esta página.

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
    const azar = crearRandom(19850614);
    const entre = (min, max) => min + azar() * (max - min);

    // ======================================================================
    // CONFIG
    // ======================================================================
    const CONFIG = {
        sueloY: 1320,
        cielo: { xMin: -400, xMax: 1900, yMin: -2080, yMax: 950 },
        estrellas: { cantidad: 340, radioMin: 1.1, radioMax: 3, opacidadMin: 0.4, opacidadMax: 1 },
        viaLactea: { cantidad: 80, cx: 760, cy: -850, rx: 620, ry: 60, angulo: -24 },
        camara: { reposoY: 0, cieloY: 1250 },
        // Nivel de contaminación del pueblo: no es una gran ciudad, así que
        // el "encendido" de partida es moderado, no extremo.
        nivelInicial: 45
    };

    // El oscurecimiento de la grilla mundial hacia negro NO usa GSAP: es un
    // simple fundido por CSS (igual que #telon en main.js), disparado por un
    // IntersectionObserver — ver esa lógica en main.js, junto a los demás
    // observers de scroll normal. Acá abajo sólo empieza la escena de cierre.

    // ======================================================================
    // 1. CONSTRUCCIÓN DE LA ILUSTRACIÓN
    // ======================================================================
    const mundo = document.getElementById("mundo-cierre");
    const capaEstrellas = document.getElementById("capa-estrellas-cierre");
    const capaViaLactea = document.getElementById("capa-via-lactea-cierre");
    const capaOrion = document.getElementById("capa-orion-cierre");
    const capaMontanas = document.getElementById("capa-montanas-cierre");
    const capaArboles = document.getElementById("capa-arboles-cierre");
    const capaFarol = document.getElementById("capa-farol-cierre");
    const capaCasa = document.getElementById("capa-casa-cierre");
    const capaCartel = document.getElementById("capa-cartel-cierre");
    const capaJorge = document.getElementById("capa-jorge-cierre");

    gsap.set(mundo, { svgOrigin: "0 0" });

    // --- Montañas (silueta estática) ---------------------------------------
    (function generarMontanas() {
        capaMontanas.appendChild(crearSVG("polygon", {
            points: "-400,1320 -150,1100 100,1220 350,980 600,1150 850,1000 1100,1180 1350,1050 1600,1200 1900,1320",
            fill: "#171029"
        }));
    })();

    // --- Árboles (mismo estilo "pino" que la escena de los cielos) ---------
    function generarArbol(contenedor, x, altura, colorCopa) {
        const anchoCopa = altura * 0.55;
        const altoTronco = altura * 0.2;
        contenedor.appendChild(crearSVG("rect", {
            x: x - 2, y: CONFIG.sueloY - altoTronco, width: 4, height: altoTronco, fill: "#1c1712"
        }));
        for (let i = 0; i < 3; i++) {
            const factor = 1 - i * 0.24;
            const wCapa = anchoCopa * factor;
            const yBase = CONFIG.sueloY - altoTronco - (i * altura * 0.62) / 3;
            const yPico = yBase - altura * 0.42;
            contenedor.appendChild(crearSVG("polygon", {
                points: `${x - wCapa / 2},${yBase} ${x + wCapa / 2},${yBase} ${x},${yPico}`,
                fill: colorCopa
            }));
        }
    }
    [150, 260, 380, 950, 1080, 1200, 1310].forEach((x, i) => {
        generarArbol(capaArboles, x, entre(90, 220), i % 2 === 0 ? "#16261a" : "#122117");
    });

    // --- La casa del pueblo: mismo encuadre que al principio de la historia -
    (function generarCasa() {
        // Cuerpo y techo
        capaCasa.appendChild(crearSVG("rect", { x: 545, y: 1130, width: 210, height: 190, fill: "#241c38" }));
        capaCasa.appendChild(crearSVG("polygon", { points: "535,1130 765,1130 650,980", fill: "#181328" }));
        capaCasa.appendChild(crearSVG("rect", { x: 705, y: 1010, width: 20, height: 50, fill: "#181328" }));

        // Marco de la ventana + luz interior (toggleable) + cruz de la ventana
        capaCasa.appendChild(crearSVG("rect", { x: 600, y: 1165, width: 100, height: 90, fill: "#100c1c" }));
        capaCasa.appendChild(crearSVG("rect", {
            x: 609, y: 1174, width: 82, height: 72, fill: "#ffcf8a", id: "ventana-luz-cierre"
        }));
        capaCasa.appendChild(crearSVG("line", { x1: 650, y1: 1165, x2: 650, y2: 1255, stroke: "#100c1c", "stroke-width": 5 }));
        capaCasa.appendChild(crearSVG("line", { x1: 600, y1: 1210, x2: 700, y2: 1210, stroke: "#100c1c", "stroke-width": 5 }));
    })();

    // --- Jorge adulto, apoyado junto a la ventana, mirando hacia arriba -----
    (function generarJorge() {
        capaJorge.appendChild(crearSVG("circle", { cx: 800, cy: 1155, r: 19, fill: "#0d0a16" }));
        capaJorge.appendChild(crearSVG("polygon", {
            points: "782,1174 818,1174 825,1320 775,1320", fill: "#0d0a16"
        }));
    })();

    // --- Farol del pueblo (con halo, toggleable) ----------------------------
    (function generarFarol() {
        capaFarol.appendChild(crearSVG("rect", { x: 515, y: 1200, width: 7, height: 120, fill: "#1a1622" }));
        capaFarol.appendChild(crearSVG("rect", { x: 519, y: 1200, width: 30, height: 6, fill: "#1a1622" }));
        capaFarol.appendChild(crearSVG("circle", {
            cx: 549, cy: 1204, r: 20, fill: "#ffdca0", opacity: 0.5, id: "farol-halo-cierre"
        }));
        capaFarol.appendChild(crearSVG("circle", {
            cx: 549, cy: 1204, r: 5.5, fill: "#ffdca0", id: "farol-bulbo-cierre"
        }));
    })();

    // --- Farolito de entrada (lo primero que se apaga) ----------------------
    (function generarCartel() {
        capaCartel.appendChild(crearSVG("rect", { x: 560, y: 1250, width: 7, height: 70, fill: "#1a1622" }));
        capaCartel.appendChild(crearSVG("rect", { x: 553, y: 1235, width: 16, height: 16, fill: "#1a1622" }));
        capaCartel.appendChild(crearSVG("circle", {
            cx: 561, cy: 1243, r: 11, fill: "#ffcf8a", id: "cartel-glow-cierre"
        }));
    })();

    // --- Estrellas de fondo --------------------------------------------------
    const estrellas = [];
    (function generarEstrellas() {
        for (let i = 0; i < CONFIG.estrellas.cantidad; i++) {
            const x = entre(CONFIG.cielo.xMin, CONFIG.cielo.xMax);
            const y = entre(CONFIG.cielo.yMin, CONFIG.cielo.yMax);
            const r = entre(CONFIG.estrellas.radioMin, CONFIG.estrellas.radioMax);
            const opacidadBase = entre(CONFIG.estrellas.opacidadMin, CONFIG.estrellas.opacidadMax);
            const seed = azar();
            const estrella = crearSVG("circle", { cx: x, cy: y, r, fill: "#f5f7ff", opacity: 0 });
            capaEstrellas.appendChild(estrella);
            estrellas.push({ el: estrella, opacidadBase, seed });
            // Nota: a propósito NO hay un tween de "titileo" por estrella acá.
            // Esa animación competiría por la misma propiedad "opacity" que
            // actualizarEstrellas() necesita controlar para el revelado
            // progresivo (scroll + interruptor), y una pisaría a la otra.
        }
    })();

    // --- Vía Láctea (sólo con el interruptor apagado del todo) --------------
    (function generarViaLactea() {
        const { cx, cy, rx, ry, angulo } = CONFIG.viaLactea;
        capaViaLactea.appendChild(crearSVG("ellipse", {
            cx, cy, rx, ry, fill: "#cfd9ff", opacity: 0.05, transform: `rotate(${angulo} ${cx} ${cy})`
        }));
        const rad = (angulo * Math.PI) / 180;
        const dx = Math.cos(rad), dy = Math.sin(rad);
        for (let i = 0; i < CONFIG.viaLactea.cantidad; i++) {
            const t = entre(-rx * 0.85, rx * 0.85);
            const jitter = entre(-35, 35);
            capaViaLactea.appendChild(crearSVG("circle", {
                cx: cx + dx * t - dy * jitter, cy: cy + dy * t + dx * jitter,
                r: entre(0.5, 1.3), fill: "#eef2ff", opacity: entre(0.25, 0.55)
            }));
        }
    })();

    // --- Orión: la misma constelación de toda la historia -------------------
    const ORION_CX = 720, ORION_CY = -770;
    const ORION_ESTRELLAS = [
        { dx: -30, dy: -55, r: 5.2, color: "#ffb37a" },  // Betelgeuse
        { dx: -12, dy: 65, r: 5.6, color: "#cfe3ff" },   // Rigel
        { dx: 48, dy: -70, r: 3.8, color: "#eaf1ff" },   // Bellatrix
        { dx: -10, dy: 8, r: 3.2, color: "#ffffff" },    // Mintaka
        { dx: 12, dy: 14, r: 3.4, color: "#ffffff" },    // Alnilam
        { dx: 34, dy: 20, r: 3.3, color: "#ffffff" },    // Alnitak
        { dx: 56, dy: 78, r: 4, color: "#cfe3ff" }       // Saiph
    ];
    (function generarOrion() {
        const lineas = crearSVG("g", { stroke: "#cfe0ff", "stroke-opacity": "0.45", "stroke-width": "1.2" });
        const p = (i) => [ORION_CX + ORION_ESTRELLAS[i].dx, ORION_CY + ORION_ESTRELLAS[i].dy];
        [[0, 3], [2, 5], [3, 4], [4, 5], [3, 1], [5, 6]].forEach(([a, b]) => {
            const [x1, y1] = p(a), [x2, y2] = p(b);
            lineas.appendChild(crearSVG("line", { x1, y1, x2, y2 }));
        });
        capaOrion.appendChild(lineas);
        ORION_ESTRELLAS.forEach(e => {
            capaOrion.appendChild(crearSVG("circle", {
                cx: ORION_CX + e.dx, cy: ORION_CY + e.dy, r: e.r, fill: e.color
            }));
        });
        gsap.set(capaOrion, { opacity: 0 });
    })();

    // ======================================================================
    // 2. NIVEL DE ESTRELLAS — reveal por scroll + reveal por interruptor
    // ======================================================================
    // "revealScroll" (0→1): cuánto se reveló el campo de estrellas al subir
    // la cámara. "nivelLuces" (0→1, 1=contaminación total): lo controla el
    // interruptor. El nivel final de cada estrella es una combinación de
    // ambos, igual que en la escena de contaminación lumínica.
    let revealScroll = 0;
    let nivelLuces = CONFIG.nivelInicial / 100;

    function nivelEstrellasActual() {
        return revealScroll * (1 - nivelLuces * 0.85); // nunca llega a 0 del todo
    }
    function actualizarEstrellas() {
        const nivel = nivelEstrellasActual();
        estrellas.forEach(e => {
            e.el.style.opacity = e.seed < nivel ? e.opacidadBase : 0.03;
        });
        gsap.set(capaOrion, { opacity: 0.55 + (1 - nivelLuces) * 0.4 * revealScroll });
    }

    // ======================================================================
    // 3. TIMELINE PRINCIPAL — pinneada con CSS sticky (igual que la luz)
    // ======================================================================
    (function timelinePrincipal() {
        const seccion = document.getElementById("escena-cierre");
        const pin = document.getElementById("pin-cierre");
        if (!seccion || !pin) return;

        const frases = {};
        document.querySelectorAll(".frase-cierre").forEach(f => {
            frases[f.getAttribute("data-frase-cierre")] = f;
        });
        const panel = document.getElementById("panel-interruptor-cierre");

        function mostrarFrase(clave, duracionIn = 1, duracionOut = 0.8) {
            const el = frases[clave];
            const tl = gsap.timeline();
            if (el) tl.to(el, { opacity: 1, duration: duracionIn }).to(el, { opacity: 0, duration: duracionOut }, "+=0.9");
            return tl;
        }

        const DURACION_SCRUB_VH = 1800;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: seccion,
                start: "top top",
                end: () => "+=" + window.innerHeight * (DURACION_SCRUB_VH / 100),
                scrub: 0.8,
                pin: false // el "pin" visual lo hace el position:sticky del CSS (mismo método que la escena de luz)
            }
        });

        // --- FASE 1: 5 frases cortas, directamente sobre la ilustración ----
        // (la casa ya está visible desde que arranca la escena: no hay
        // ningún velo negro de por medio). Cada frase termina de
        // desvanecerse ANTES de que arranque la siguiente, con margen.
        tl.to(frases.continente, { opacity: 1, duration: 0.7 }, 0)
          .to(frases.continente, { opacity: 0, duration: 0.7 }, 1.6)
          .to(frases.idioma, { opacity: 1, duration: 0.7 }, 2.6)
          .to(frases.idioma, { opacity: 0, duration: 0.7 }, 4.2)
          .to(frases.cultura, { opacity: 1, duration: 0.7 }, 5.2)
          .to(frases.cultura, { opacity: 0, duration: 0.7 }, 6.8)
          .to(frases.crece, { opacity: 1, duration: 0.7 }, 8.0)
          .to(frases.crece, { opacity: 0, duration: 0.7 }, 9.6) // pausa breve antes de la conclusión
          .to(frases.desaparece, { opacity: 1, duration: 0.8 }, 11.0)
          .to(frases.desaparece, { opacity: 0, duration: 0.8 }, 12.8);

        // --- FASE 2: pausa de contemplación (nada se anima) ----------------
        // (el hueco entre 13.6 y 17.0 es intencional: sólo scroll, sin cambios)

        // --- FASE 3: la cámara sube siguiendo la mirada de Jorge -----------
        tl.to(mundo, { y: CONFIG.camara.cieloY, duration: 2.2, ease: "power1.inOut" }, 17.0)
          .to({ v: 0 }, {
              v: 0.16, duration: 2,
              onUpdate: function () { revealScroll = this.targets()[0].v; actualizarEstrellas(); }
          }, 17.2)
          .to(capaOrion, { opacity: 0.5, duration: 1.6 }, 18.0);

        // 3 frases, una por vez, sin acumularse (cada una dura ~2.7 unidades
        // de principio a fin — ver mostrarFrase — así que se espacian 3
        // unidades entre sí para que no se pisen).
        tl.add(mostrarFrase("abuela"), 20.0)
          .add(mostrarFrase("orion-siempre"), 23.0)
          .add(mostrarFrase("dificil"), 26.0);

        // --- FASE 4: aparece el panel del interruptor ----------------------
        // pointerEvents va en la MISMA tween que la opacidad (no en un
        // .set/className aparte) para que, si el usuario scrollea hacia
        // atrás, el panel vuelva a quedar no-interactivo de forma prolija.
        tl.to(panel, { opacity: 1, duration: 1.2, pointerEvents: "auto" }, 29.0)
          // Colchón final: tiempo de sobra para leer la pregunta y decidir
          // tocar el interruptor antes de que el scroll se termine.
          .to({}, { duration: 4 }, 30.2);
    })();

    // ======================================================================
    // 4. INTERRUPTOR — apagar/prender la contaminación lumínica del pueblo
    // ======================================================================
    (function conectarInterruptor() {
        const boton = document.getElementById("interruptor-luz");
        const estado = document.getElementById("interruptor-estado");
        if (!boton || !estado) return;

        let encendido = true;
        let mensajeYaMostrado = false;

        function apagarLuces() {
            const tl = gsap.timeline();
            tl.to("#cartel-glow-cierre", { opacity: 0, duration: 0.4 }, 0)
              .to("#ventana-luz-cierre", { opacity: 0, duration: 0.5 }, 0.35)
              .to("#farol-halo-cierre, #farol-bulbo-cierre", { opacity: 0, duration: 0.5 }, 0.75)
              .to("#capa-halo-casa-cierre ellipse", { opacity: 0, duration: 1 }, 1.15)
              .to("#capa-resplandor-horizonte-cierre ellipse", { opacity: 0, duration: 1.3 }, 1.5)
              .to({ v: nivelLuces }, {
                  v: 0, duration: 2.6, ease: "sine.inOut",
                  onUpdate: function () { nivelLuces = this.targets()[0].v; actualizarEstrellas(); }
              }, 1.9)
              .to("#capa-via-lactea-cierre", { opacity: 1, duration: 1.6 }, 3.6)
              .call(() => programarMensajeFinal(), null, "+=1.2");
        }

        function prenderLuces() {
            const tl = gsap.timeline();
            tl.to("#capa-via-lactea-cierre", { opacity: 0, duration: 0.8 }, 0)
              .to({ v: nivelLuces }, {
                  v: CONFIG.nivelInicial / 100, duration: 1.8, ease: "sine.inOut",
                  onUpdate: function () { nivelLuces = this.targets()[0].v; actualizarEstrellas(); }
              }, 0.2)
              .to("#capa-resplandor-horizonte-cierre ellipse", { opacity: 1, duration: 1 }, 0.6)
              .to("#capa-halo-casa-cierre ellipse", { opacity: 1, duration: 0.8 }, 1)
              .to("#farol-halo-cierre, #farol-bulbo-cierre", { opacity: 1, duration: 0.4 }, 1.3)
              .to("#ventana-luz-cierre", { opacity: 1, duration: 0.4 }, 1.5)
              .to("#cartel-glow-cierre", { opacity: 1, duration: 0.4 }, 1.7);
        }

        boton.addEventListener("click", () => {
            encendido = !encendido;
            boton.setAttribute("aria-checked", String(encendido));
            estado.textContent = encendido ? "ON" : "OFF";
            if (encendido) prenderLuces(); else apagarLuces();
        });

        // ==================================================================
        // 5. MENSAJE FINAL — sólo una vez, después de apagar por primera vez
        // ==================================================================
        function programarMensajeFinal() {
            if (mensajeYaMostrado) return;
            mensajeYaMostrado = true;

            const m1 = document.querySelector('[data-mensaje-final="1"]');
            const m2 = document.querySelector('[data-mensaje-final="2"]');
            const m3 = document.querySelector('[data-mensaje-final="3"]');

            gsap.timeline({ delay: 2.5 }) // silencio de contemplación primero
                .to(m1, { opacity: 1, duration: 2 })
                .to(m1, { opacity: 0, duration: 1.5 }, "+=3")
                .to(m2, { opacity: 1, duration: 2 }, "+=0.6")
                .to(m2, { opacity: 0, duration: 1.5 }, "+=3")
                .to(m3, { opacity: 1, duration: 2.5 }, "+=1");
            // El mensaje 3 (el de cierre) se queda en pantalla: no se retira.
        }
    })();

});
