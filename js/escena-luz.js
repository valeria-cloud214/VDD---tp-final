/* ==========================================================================
   ESCENA "LUZ" — Contaminación lumínica (inmersión SVG + GSAP ScrollTrigger)
   ==========================================================================
   Qué hace este archivo:
   1) Arma una única ilustración SVG (un corte vertical del mundo: ciudad,
      atmósfera y espacio) usando capas <g> independientes y comentadas.
   2) Genera de forma procedural los elementos repetitivos (ventanas,
      rayos de luz, estrellas) para que sean fáciles de ajustar desde el
      objeto CONFIG sin tocar el resto de las capas.
   3) Anima la "cámara" (el grupo #mundo) con GSAP + ScrollTrigger: el
      scroll no cambia de imagen, sólo mueve la cámara dentro de la misma
      ilustración (traslada y/x, y al final achica de forma uniforme para
      el efecto de "ver todo junto", sin deformar nada).
   4) La mini-introducción de Jorge frente al pizarrón es la primera fase
      de esa MISMA timeline (un overlay superpuesto a la ilustración, ya
      renderizada detrás) — no una sección aparte, para que la transición
      hacia la ciudad nunca deje un cuadro vacío/negro entre medio.
   5) Conecta el slider final: un único "nivel de contaminación" (0-100)
      que decide cuántas ventanas/faroles están encendidos, la cantidad
      de rayos, el brillo de la atmósfera y el contraste de las estrellas.
   No toca ninguna otra escena del sitio ni el main.js existente.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Si por algún motivo GSAP no cargó (CDN caído, etc.), no rompemos el resto del sitio.
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        console.warn("GSAP/ScrollTrigger no están disponibles: la escena de luz no se inicializa.");
        return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const svg = document.getElementById("svg-luz");
    if (!svg) return; // La escena no está en esta página.

    const NS = "http://www.w3.org/2000/svg";

    /** Crea un elemento SVG con atributos, sin depender de innerHTML. */
    function crearSVG(tag, attrs = {}) {
        const el = document.createElementNS(NS, tag);
        for (const clave in attrs) el.setAttribute(clave, attrs[clave]);
        return el;
    }

    /** PRNG determinístico (mulberry32): mismo layout "orgánico" en cada carga,
     *  en vez de un Math.random() distinto cada vez que se recarga la página. */
    function crearRandom(semilla) {
        let a = semilla >>> 0;
        return function () {
            a |= 0; a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    const azar = crearRandom(20260708);
    const entre = (min, max) => min + azar() * (max - min);

    // ======================================================================
    // CONFIG — todos los números "de diseño" de la escena, en un solo lugar
    // ======================================================================
    const CONFIG = {
        anchoMundo: 1600,          // ancho del viewBox
        sueloY: 780,               // línea de piso donde se apoyan edificios/autos/faroles
        edificios: { cantidad: 9, anchoMin: 95, anchoMax: 155, altoMin: 160, altoMax: 520, separacion: 18 },
        casas: { cantidad: 3, ancho: 90, alto: 70 },
        faroles: { cantidad: 10, alto: 140 },
        autos: { cantidad: 4 },
        carteles: { cantidad: 2 },
        ventanasPorFila: 5,
        // Campo de estrellas mucho más ancho que la ciudad (que sólo ocupa
        // 0-1600): así, cuando el paso 7 achica la cámara para mostrar todo
        // el recorrido de una vez, el cielo sigue lleno de estrellas en vez
        // de dejar bordes vacíos a los costados de una ciudad "flotando".
        estrellas: { cantidad: 550, xMin: -3200, xMax: 5000, yMin: -3150, yMax: -420 },
        atmosfera: { yTope: -400, yBase: 260 },
        espacioTopeY: -3200,       // borde superior del campo de estrellas
        // Traslación/escala de la cámara (#mundo) por paso narrativo.
        // screenX = worldX*scale + x ; screenY = worldY*scale + y (con
        // svgOrigin en "0 0"). En los pasos 1-6 sólo se anima "y" (paneo
        // vertical puro, scale:1). El paso 7 además achica y recentra en
        // X para mostrar todo el recorrido sin "aplastar" la ilustración.
        camara: {
            paso1: { y: 0 },
            paso2: { y: 34 },
            paso3: { y: 380 },
            paso4: { y: 430 },
            paso5: { y: 560 },
            paso6: { y: 1900 },
            // "Zoom out" uniforme (sin deformar), pero acotado: en vez de
            // encuadrar TODO el mundo (suelo a espacio profundo, que dejaba
            // la ciudad como una franjita minúscula y casi todo vacío), este
            // encuadre llega justo hasta un poco por encima de Orión — así
            // se ven bien juntos, de cerca, la ciudad, los rayos, el cielo y
            // la constelación, sin resignar tamaño.
            paso7: { x: 552, y: 601, scale: 0.31 }
        }
    };

    // ======================================================================
    // 1. CONSTRUCCIÓN DE LA ILUSTRACIÓN (capas SVG)
    // ======================================================================
    const mundo = document.getElementById("mundo");
    const capaEdificios = document.getElementById("capa-edificios");
    const capaCasas = document.getElementById("capa-casas");
    const capaVentanas = document.getElementById("capa-ventanas");
    const capaFaroles = document.getElementById("capa-faroles");
    const capaCarteles = document.getElementById("capa-carteles");
    const capaAutos = document.getElementById("capa-autos");
    const capaRayos = document.getElementById("capa-rayos");
    const capaEstrellas = document.getElementById("capa-estrellas");
    const capaOrion = document.getElementById("capa-constelacion-orion");
    const capaAtmosfera = document.getElementById("capa-atmosfera-forma");
    const capaResplandor = document.getElementById("capa-resplandor-forma");

    // El origen del sistema de coordenadas SVG queda fijo en (0,0): así,
    // todas las animaciones de cámara son una simple traslación/escala en Y,
    // sin sorpresas de "transform-origin" relativo al bounding box.
    gsap.set(mundo, { svgOrigin: "0 0" });

    // --- 1a. Edificios (silueta de la ciudad) -----------------------------
    // Se generan de forma procedural para poder ajustar la cantidad/tamaño
    // desde CONFIG sin tener que editar a mano decenas de <rect>.
    const edificios = []; // guardamos {x, y, w, h} de cada uno para ubicar ventanas y rayos
    (function generarEdificios() {
        const n = CONFIG.edificios.cantidad;
        const anchoDisponible = CONFIG.anchoMundo;
        const anchoAprox = anchoDisponible / n;
        const paletaEdificios = ["#2b2140", "#241c38", "#33254a", "#2a2042"];

        for (let i = 0; i < n; i++) {
            const w = entre(CONFIG.edificios.anchoMin, CONFIG.edificios.anchoMax);
            const h = entre(CONFIG.edificios.altoMin, CONFIG.edificios.altoMax);
            const x = i * anchoAprox + entre(-10, 10);
            const y = CONFIG.sueloY - h;
            const color = paletaEdificios[i % paletaEdificios.length];

            const rect = crearSVG("rect", {
                x, y, width: w, height: h,
                fill: color,
                rx: 2
            });
            capaEdificios.appendChild(rect);

            // Pequeño remate de techo para que no sea un simple bloque.
            const techo = crearSVG("rect", { x, y: y - 6, width: w, height: 6, fill: color });
            capaEdificios.appendChild(techo);

            edificios.push({ x, y, w, h });
        }
    })();

    // --- 1b. Casas bajas (variedad en primer plano) -----------------------
    (function generarCasas() {
        const n = CONFIG.casas.cantidad;
        for (let i = 0; i < n; i++) {
            const w = CONFIG.casas.ancho + entre(-10, 10);
            const h = CONFIG.casas.alto + entre(-8, 8);
            const x = entre(40, CONFIG.anchoMundo - 140) ;
            const y = CONFIG.sueloY - h;

            const cuerpo = crearSVG("rect", { x, y, width: w, height: h, fill: "#3a2a2f", rx: 2 });
            const techo = crearSVG("polygon", {
                points: `${x - 6},${y} ${x + w + 6},${y} ${x + w / 2},${y - 34}`,
                fill: "#241a22"
            });
            capaCasas.appendChild(cuerpo);
            capaCasas.appendChild(techo);

            // Una ventanita propia (no forma parte de la grilla de "capa-ventanas"
            // porque las casas son más chicas), con su propio seed para el slider.
            const ventanaCasa = crearSVG("rect", {
                x: x + w / 2 - 9, y: y + h * 0.35, width: 18, height: 18,
                fill: "#ffb454", class: "ventana", "data-seed": azar().toFixed(3)
            });
            capaVentanas.appendChild(ventanaCasa);
        }
    })();

    // --- 1c. Ventanas (grilla por edificio) --------------------------------
    (function generarVentanas() {
        const cols = CONFIG.ventanasPorFila;
        edificios.forEach(ed => {
            const margen = 10;
            const anchoUtil = ed.w - margen * 2;
            const vw = Math.min(14, anchoUtil / cols - 6);
            const filas = Math.max(2, Math.floor((ed.h - 30) / 34));
            const paso = (ed.h - 30) / filas;

            for (let f = 0; f < filas; f++) {
                for (let c = 0; c < cols; c++) {
                    const vx = ed.x + margen + c * (anchoUtil / cols) + 3;
                    const vy = ed.y + 18 + f * paso;
                    const ventana = crearSVG("rect", {
                        x: vx, y: vy, width: vw, height: vw * 1.15,
                        fill: "#ffb454",
                        class: "ventana",
                        "data-seed": azar().toFixed(3)
                    });
                    capaVentanas.appendChild(ventana);
                }
            }
        });
    })();

    // --- 1d. Faroles (postes de luz a lo largo del piso) -------------------
    const faroles = []; // {x, yBulbo} para usar como fuente de rayos
    (function generarFaroles() {
        const n = CONFIG.faroles.cantidad;
        const paso = CONFIG.anchoMundo / n;
        for (let i = 0; i < n; i++) {
            const x = paso * i + paso / 2 + entre(-14, 14);
            const yBulbo = CONFIG.sueloY - CONFIG.faroles.alto;

            const poste = crearSVG("rect", { x: x - 3, y: yBulbo, width: 6, height: CONFIG.faroles.alto, fill: "#1a1622" });
            const brazo = crearSVG("rect", { x: x - 2, y: yBulbo, width: 26, height: 5, fill: "#1a1622" });
            const halo = crearSVG("circle", {
                cx: x + 22, cy: yBulbo + 4, r: 16,
                fill: "url(#gradiente-halo-farol)",
                class: "farol-halo", "data-seed": azar().toFixed(3)
            });
            const bulbo = crearSVG("circle", {
                cx: x + 22, cy: yBulbo + 4, r: 4.5,
                fill: "#ffdca0", class: "farol-bulbo"
            });

            capaFaroles.appendChild(poste);
            capaFaroles.appendChild(brazo);
            capaFaroles.appendChild(halo);
            capaFaroles.appendChild(bulbo);

            faroles.push({ x: x + 22, y: yBulbo + 4 });
        }
    })();

    // --- 1e. Carteles / letreros con neón ----------------------------------
    const carteles = [];
    (function generarCarteles() {
        const candidatos = edificios.filter(e => e.h > 260);
        for (let i = 0; i < CONFIG.carteles.cantidad && i < candidatos.length; i++) {
            const ed = candidatos[i * 2 % candidatos.length];
            const w = 46, h = 18;
            const x = ed.x + ed.w / 2 - w / 2;
            const y = ed.y + ed.h * 0.4;
            const cartel = crearSVG("rect", {
                x, y, width: w, height: h, rx: 3,
                fill: i % 2 === 0 ? "#ff5c7a" : "#5ce1ff",
                class: "cartel-neon"
            });
            capaCarteles.appendChild(cartel);
            carteles.push({ x: x + w / 2, y: y + h / 2 });

            // Parpadeo de neón: sutil, continuo, no depende del scroll.
            gsap.to(cartel, {
                opacity: 0.55, duration: entre(1.4, 2.4), repeat: -1, yoyo: true, ease: "sine.inOut"
            });
        }
    })();

    // --- 1f. Autos (con leve deriva orgánica, no depende del scroll) -------
    (function generarAutos() {
        const n = CONFIG.autos.cantidad;
        for (let i = 0; i < n; i++) {
            const x = entre(60, CONFIG.anchoMundo - 120);
            const y = CONFIG.sueloY - 14;
            const auto = crearSVG("g", { class: "auto" });
            const cuerpo = crearSVG("rect", { x, y, width: 46, height: 14, rx: 5, fill: "#151221" });
            const cabina = crearSVG("rect", { x: x + 10, y: y - 8, width: 24, height: 10, rx: 4, fill: "#1c1830" });
            const faro = crearSVG("circle", { cx: x + 44, cy: y + 7, r: 2.6, fill: "#ffe3ad" });
            auto.appendChild(cuerpo); auto.appendChild(cabina); auto.appendChild(faro);
            capaAutos.appendChild(auto);

            gsap.to(auto, {
                x: entre(18, 40) * (azar() > 0.5 ? 1 : -1),
                duration: entre(5, 8), repeat: -1, yoyo: true, ease: "sine.inOut"
            });
        }
    })();

    // --- 1g. Rayos de luz (ciudad → atmósfera) ------------------------------
    // Cada rayo nace en una fuente (techo, farol o cartel) y sube hasta la
    // atmósfera. Guardamos dos formas de la misma curva (recta / dispersa)
    // para poder interpolar el "quiebre" en el paso 4 sin generar el doble
    // de elementos.
    const rayos = [];
    (function generarRayos() {
        const fuentes = []
            .concat(edificios.map(e => ({ x: e.x + e.w / 2, y: e.y })))
            .concat(faroles.map(f => ({ x: f.x, y: f.y })))
            .concat(carteles.map(c => ({ x: c.x, y: c.y })));

        fuentes.forEach((f, i) => {
            const destinoY = -360 - entre(0, 80);
            const path = crearSVG("path", {
                d: "", // se completa en la primera actualización de render()
                stroke: "url(#gradiente-rayo)",
                "stroke-width": entre(1, 2.4),
                fill: "none",
                class: "rayo",
                "data-seed": azar().toFixed(3)
            });
            capaRayos.appendChild(path);
            rayos.push({
                el: path,
                x0: f.x, y0: f.y, y1: destinoY,
                curvaBase: entre(-30, 30),
                curvaDispersa: entre(-140, 140)
            });
        });
    })();

    /** Recalcula el trazo de todos los rayos según cuánto "dispersos" están (0-1). */
    function actualizarCurvaturaRayos(dispersión) {
        rayos.forEach(r => {
            const curva = r.curvaBase + (r.curvaDispersa - r.curvaBase) * dispersión;
            const midY = (r.y0 + r.y1) / 2;
            r.el.setAttribute("d", `M ${r.x0} ${r.y0} Q ${r.x0 + curva} ${midY} ${r.x0 + curva * 1.4} ${r.y1}`);
        });
    }
    actualizarCurvaturaRayos(0);

    // --- 1h. Campo de estrellas de fondo ------------------------------------
    // Radio y opacidad base más grandes que un cielo "realista": la cámara
    // nunca llega a un zoom 1:1, así que una estrella demasiado chica termina
    // en una fracción de píxel y se pierde aunque tenga opacidad alta. Acá
    // priorizamos que se LEAN bien por sobre el realismo estricto.
    const estrellas = [];
    (function generarEstrellas() {
        for (let i = 0; i < CONFIG.estrellas.cantidad; i++) {
            const x = entre(CONFIG.estrellas.xMin, CONFIG.estrellas.xMax);
            const y = entre(CONFIG.estrellas.yMin, CONFIG.estrellas.yMax);
            const r = entre(1.3, 3.6);
            const opacidadBase = entre(0.55, 1);
            const estrella = crearSVG("circle", { cx: x, cy: y, r, fill: "#f5f7ff", opacity: opacidadBase });
            capaEstrellas.appendChild(estrella);
            estrellas.push({ el: estrella, opacidadBase });

            // Un tercio de las estrellas titila suavemente, de forma continua.
            if (azar() < 0.33) {
                gsap.to(estrella, {
                    opacity: opacidadBase * 0.35, duration: entre(1.5, 4), repeat: -1, yoyo: true, ease: "sine.inOut"
                });
            }
        }
    })();

    // ======================================================================
    // 2. NIVEL DE CONTAMINACIÓN — única fuente de verdad visual
    // ======================================================================
    // "estado.nivel" va de 0 (pueblo oscuro) a 100 (centro de una megaciudad).
    // Tanto el recorrido de scroll como el slider final escriben este mismo
    // valor y llaman a render(), así la ilustración nunca queda inconsistente.
    const estado = { nivel: 0 };

    function render(nivel) {
        const t = Math.max(0, Math.min(100, nivel)) / 100;

        // Ventanas y faroles: cuantos más "encendidos" cuanto mayor el nivel,
        // pero cada uno prende en un umbral distinto (su "seed") para que el
        // apagado/encendido se vea orgánico y no sincronizado.
        const ratioEncendido = 0.16 + t * 0.8; // 16% → 96% de elementos encendidos
        document.querySelectorAll("#capa-ventanas .ventana").forEach(v => {
            const seed = parseFloat(v.getAttribute("data-seed"));
            v.style.opacity = seed < ratioEncendido ? 0.95 : 0.06;
        });
        document.querySelectorAll("#capa-faroles .farol-halo").forEach(h => {
            const seed = parseFloat(h.getAttribute("data-seed"));
            h.style.opacity = seed < ratioEncendido ? 0.85 : 0.08;
        });

        // Rayos: más cantidad visible y más intensos cuanta más luz escapa.
        const ratioRayos = 0.25 + t * 0.75;
        rayos.forEach(r => {
            const seed = parseFloat(r.el.getAttribute("data-seed"));
            r.el.style.opacity = seed < ratioRayos ? 0.18 + t * 0.4 : 0;
        });

        // Resplandor de contaminación: el halo cálido que sube desde la ciudad.
        capaResplandor.style.opacity = (t * 0.85).toFixed(3);

        // Estrellas y constelación: pierden contraste pero nunca desaparecen
        // del todo (ver las dos funciones de abajo para el porqué de cada curva).
        aplicarOpacidadEstrellas(t);
        aplicarOpacidadOrion(t);

        estado.nivel = nivel;
    }

    // La opacidad final del campo de estrellas combina dos cosas: cuánto ya
    // se "reveló" por el scroll (revealEstrellas, 0→1 en el paso 6) y cuánto
    // se atenúa por contaminación. El rango es amplio (1 → 0.10) para que el
    // contraste entre "cielo oscuro" y "ciudad brillante" del slider se note
    // fuerte: con luz baja se ve un cielo repleto de estrellas, con luz alta
    // casi todas se pierden contra el resplandor (pero nunca al 0 exacto).
    let revealEstrellas = 0;
    function aplicarOpacidadEstrellas(t) {
        const factorContaminacion = 1 - t * 0.9; // mínimo 0.10
        gsap.set(capaEstrellas, { opacity: revealEstrellas * factorContaminacion });
    }

    // Orión es "la figura central" de la historia de Jorge: se atenúa mucho
    // menos que el resto del cielo (mínimo 0.45 en vez de 0.10), para que el
    // usuario entienda que, aun con mucha contaminación, las constelaciones
    // más brillantes siguen encontrándose — es el resto del cielo el que
    // desaparece a su alrededor.
    function aplicarOpacidadOrion(t) {
        if (!capaOrion) return;
        const factorContaminacion = 1 - t * 0.55; // mínimo 0.45
        gsap.set(capaOrion, { opacity: revealEstrellas * factorContaminacion });
    }

    render(0);

    // ======================================================================
    // 3. TIMELINE ÚNICA — intro del pizarrón + recorrido de cámara
    // ======================================================================
    // Todo (la intro de Jorge Y el viaje de cámara) vive en UNA sola
    // ScrollTrigger/timeline, pinneada por el mismo .pin-luz vía CSS sticky.
    // Antes la intro tenía su propia sección con su propio pin, y el "empalme"
    // entre las dos secciones podía desalinearse con el disparador del telón
    // y otros elementos, dejando huecos en negro. Al fusionarlas, no existe
    // ningún punto de corte entre "una escena" y "la otra": es un único
    // recorrido continuo sobre la misma ilustración, siempre visible.
    (function timelineUnica() {
        const seccion = document.getElementById("escena-luz");
        if (!seccion) return;

        const introOverlay = document.getElementById("intro-pizarron-overlay");
        const linea1 = document.getElementById("linea-pizarron-1");
        const linea2 = document.getElementById("linea-pizarron-2");
        const marcoIntro = document.getElementById("pizarron-intro-marco");
        const aulaIntro = introOverlay ? introOverlay.querySelector(".fondo-aula-img") : null;

        const textos = {
            1: document.querySelector('[data-paso-luz="1"]'),
            2: document.querySelector('[data-paso-luz="2"]'),
            3: document.querySelector('[data-paso-luz="3"]'),
            4: document.querySelector('[data-paso-luz="4"]'),
            5: document.querySelector('[data-paso-luz="5"]'),
            6: document.querySelector('[data-paso-luz="6"]'),
            7: document.querySelector('[data-paso-luz="7"]')
        };
        const panel = document.getElementById("panel-slider-luz");

        // Duración fija en vh de la parte "activa" del scroll (intro +
        // recorrido de cámara). El resto de la sección, más abajo en el
        // HTML, es el colchón para el telón final.
        const DURACION_SCRUB_VH = 1000;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: seccion,
                start: "top top",
                end: () => "+=" + window.innerHeight * (DURACION_SCRUB_VH / 100),
                scrub: 0.8,
                pin: false // el "pin" visual ya lo hace el position:sticky del CSS
            }
        });

        const dispersión = { valor: 0 };
        const nivelProxy = { v: 0 };

        // Nota: este cross-fade corre en tiempo real (no está scrubbeado por el
        // scroll) para que el cambio de frase se sienta como un fundido suave
        // y no como un salto instantáneo, incluso si el usuario scrollea rápido.
        function mostrarSoloTexto(n) {
            Object.entries(textos).forEach(([clave, t]) => {
                if (!t) return;
                const activo = Number(clave) === n;
                gsap.to(t, { opacity: activo ? 1 : 0, duration: 0.5, ease: "sine.inOut" });
                t.style.pointerEvents = activo ? "auto" : "none";
            });
        }

        // --- FASE 0 — Jorge frente al pizarrón (posiciones 0 a 4) ----------
        tl.set(linea1, { opacity: 0, y: 14 })
          .set(linea2, { opacity: 0, y: 14 })
          .to(linea1, { opacity: 1, y: 0, duration: 1 }, 0)
          .to(linea1, { opacity: 0, y: -14, duration: 0.6 }, 1.6)
          .to(linea2, { opacity: 1, y: 0, duration: 1 }, 1.9)
          .to(linea2, { opacity: 0, y: -14, duration: 0.5 }, 3.0)
          // Transición cinematográfica: el pizarrón se acerca y se disuelve,
          // revelando la ciudad (ya renderizada detrás, en su estado de reposo).
          .to(marcoIntro, { scale: 1.15, opacity: 0, duration: 0.8, ease: "power1.in" }, 3.2)
          .to(aulaIntro, { opacity: 0, duration: 0.8, ease: "power1.in" }, 3.2)
          // Una vez disuelto, sacamos el overlay de en medio del todo (si no,
          // aunque sea invisible seguiría "tapando" el panel del slider al
          // final, porque por defecto un div recibe clics aunque tenga
          // opacity:0).
          .set(introOverlay, { pointerEvents: "none" }, 4.0);

        // --- FASE 1: sólo la ciudad (posición 4.0) --------------------------
        tl.call(() => mostrarSoloTexto(1), null, 4.0)
          .set(mundo, { y: CONFIG.camara.paso1.y }, 4.0);

        // PASO 1 → 2: la cámara asciende apenas, aparecen los rayos
        tl.to(mundo, { y: CONFIG.camara.paso2.y, duration: 1, ease: "none" }, 4.4)
          .call(() => mostrarSoloTexto(2), null, 4.5)
          .to(nivelProxy, { v: 18, duration: 1, onUpdate: () => render(nivelProxy.v) }, 4.5);

        // PASO 3: aparece la atmósfera, los rayos la alcanzan
        tl.to(mundo, { y: CONFIG.camara.paso3.y, duration: 1, ease: "none" }, 5.6)
          .call(() => mostrarSoloTexto(3), null, 5.7)
          .to(capaAtmosfera, { opacity: 0.55, duration: 1 }, 5.7)
          .to(nivelProxy, { v: 26, duration: 1, onUpdate: () => render(nivelProxy.v) }, 5.7);

        // PASO 4: los rayos se dispersan (curvatura orgánica, sin flechas)
        tl.to(mundo, { y: CONFIG.camara.paso4.y, duration: 1, ease: "none" }, 6.8)
          .call(() => mostrarSoloTexto(4), null, 6.9)
          .to(dispersión, {
              valor: 1, duration: 1.2,
              onUpdate: () => actualizarCurvaturaRayos(dispersión.valor)
          }, 6.9);

        // PASO 5: el cielo deja de ser completamente oscuro (glow gradual)
        tl.to(mundo, { y: CONFIG.camara.paso5.y, duration: 1, ease: "none" }, 8.1)
          .call(() => mostrarSoloTexto(5), null, 8.2)
          .to(nivelProxy, { v: 40, duration: 1.2, onUpdate: () => render(nivelProxy.v) }, 8.2);

        // PASO 6: aparecen las estrellas — la cámara ya está en el espacio
        tl.to(mundo, { y: CONFIG.camara.paso6.y, duration: 1.6, ease: "power1.inOut" }, 9.4)
          .call(() => mostrarSoloTexto(6), null, 9.6)
          .to({ v: 0 }, {
              v: 1, duration: 1.4,
              onUpdate: function () {
                  revealEstrellas = this.targets()[0].v;
                  aplicarOpacidadEstrellas(estado.nivel / 100);
                  aplicarOpacidadOrion(estado.nivel / 100);
              }
          }, 9.6);

        // PASO 7: zoom out — se ve todo el recorrido de la luz de una vez.
        // Escala UNIFORME (no sólo en Y) + recentrado en X: el campo de
        // estrellas y el cielo son mucho más anchos que la ciudad (ver
        // CONFIG.estrellas), así que no queda nada "aplastado" ni con bordes
        // vacíos — la ciudad simplemente se ve pequeña dentro de un cielo
        // enorme, que es exactamente la idea.
        tl.to(mundo, {
            x: CONFIG.camara.paso7.x,
            y: CONFIG.camara.paso7.y,
            scale: CONFIG.camara.paso7.scale,
            duration: 1.6,
            ease: "power2.inOut"
          }, 11.2)
          .call(() => mostrarSoloTexto(7), null, 11.3)
          // Fijamos el nivel "actual" de contaminación (el punto de partida del slider)
          .to(nivelProxy, { v: 45, duration: 1, onUpdate: () => render(nivelProxy.v) }, 11.3);

        // Colchón final: el texto de cierre se retira y aparece el panel
        // interactivo. A partir de acá el scroll ya no mueve la cámara.
        tl.to(textos[7], { opacity: 0, duration: 0.6 }, 12.6)
          .to(panel, { opacity: 1, duration: 1, pointerEvents: "auto" }, 12.7);
    })();

    // ======================================================================
    // 5. SLIDER — "Probá aumentar la iluminación"
    // ======================================================================
    (function conectarSlider() {
        const slider = document.getElementById("slider-contaminacion");
        if (!slider) return;

        slider.addEventListener("input", () => {
            const valor = Number(slider.value);
            // Pequeño tween para que el cambio se sienta suave y no un salto,
            // consistente con el resto de las transiciones de la escena.
            gsap.to(estado, {
                nivel: valor,
                duration: 0.5,
                ease: "sine.out",
                onUpdate: () => render(estado.nivel)
            });
        });
    })();

});
