/* ==========================================================================
   ORIÓN + DESTELLO (dentro del paso 2 de escena-4)
   ==========================================================================
   Este archivo hace dos cosas:

   1) Dibuja la constelación una vez, al cargar la página. Cuándo APARECE lo
      decide LÓGICA ESCENA 4 en main.js: ese observer agrega .co-orion-aparece
      sobre .paso-corte[data-paso="2"] al llegar al disparador 3 (la foto de
      él recibiéndose no cambia ni se duplica — es la misma).

   2) Corre el DESTELLO, atado al scroll frame a frame (ver actualizarDestello()
      más abajo). No usa pasos ni transiciones CSS: el halo crece y la pantalla
      se va a blanco en función de la POSICIÓN del scroll, así el destello es
      perfectamente fluido, no se puede saltear, y siempre termina antes de
      que la escena de la ruta releve la pantalla.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const capaOrion = document.getElementById("of-orion");
    if (!capaOrion) return; // La escena no está en esta página.

    const NS = "http://www.w3.org/2000/svg";
    function crearSVG(tag, attrs = {}) {
        const el = document.createElementNS(NS, tag);
        for (const clave in attrs) el.setAttribute(clave, attrs[clave]);
        return el;
    }

    // ======================================================================
    // ORIÓN — chica y pegada arriba a la derecha de la imagen (borde con el
    // panel de texto). El viewBox de #svg-orion-final es 1050x700 (mismo
    // ancho que el 75% de la imagen).
    //
    // Coordenadas locales (alrededor de un centro propio en 0,0) + un
    // transform de grupo (traslada y achica) — así ajustar tamaño o
    // posición es tocar sólo ESCALA_ORION / CENTRO_X / CENTRO_Y, sin
    // recalcular cada estrella a mano.
    // ======================================================================
    const ESCALA_ORION = 0.55;
    const CENTRO_X = 645;
    const CENTRO_Y = 150;

    const ESTRELLAS_ORION = [
        { dx: -88, dy: 89, r: 6, color: "#cfe3ff" },    // Rigel
        { dx: -70, dy: -76, r: 5.4, color: "#ffb37a" }, // Betelgeuse
        { dx: 80, dy: -91, r: 4, color: "#eaf1ff" },    // Bellatrix
        { dx: 0, dy: -5, r: 3.6, color: "#ffffff" },    // Alnilam
        { dx: 36, dy: 3, r: 3.5, color: "#ffffff" },    // Alnitak
        { dx: 88, dy: 91, r: 4.2, color: "#cfe3ff" },   // Saiph
        { dx: -32, dy: -13, r: 3.4, color: "#ffffff" }  // Mintaka
    ];
    const LINEAS_ORION = [[1, 6], [2, 4], [6, 3], [3, 4], [6, 0], [4, 5]];
    const punto = (i) => [
        CENTRO_X + ESTRELLAS_ORION[i].dx * ESCALA_ORION,
        CENTRO_Y + ESTRELLAS_ORION[i].dy * ESCALA_ORION
    ];

    const grupoLineas = crearSVG("g", { stroke: "#cfe0ff", "stroke-opacity": "0.45", "stroke-width": "1.2" });
    LINEAS_ORION.forEach(([a, b]) => {
        const [x1, y1] = punto(a), [x2, y2] = punto(b);
        grupoLineas.appendChild(crearSVG("line", { x1, y1, x2, y2 }));
    });
    capaOrion.appendChild(grupoLineas);

    ESTRELLAS_ORION.forEach(e => {
        const x = CENTRO_X + e.dx * ESCALA_ORION;
        const y = CENTRO_Y + e.dy * ESCALA_ORION;
        const r = e.r * ESCALA_ORION;
        capaOrion.appendChild(crearSVG("circle", {
            cx: x, cy: y, r: r * 2.4, fill: e.color, "fill-opacity": 0.2
        }));
        capaOrion.appendChild(crearSVG("circle", {
            cx: x, cy: y, r: r, fill: e.color
        }));
    });

    // El halo que después crece hasta encandilar todo ya está centrado en
    // el mismo punto (ver el <circle> fijo en index.html).

    // ======================================================================
    // DESTELLO — atado al scroll, frame a frame (no por pasos ni por
    // transiciones CSS con tiempo propio).
    //
    // Antes esto lo disparaba un IntersectionObserver sobre disparadores que
    // quedaban por debajo del tramo pinneado: para cuando se disparaban, la
    // escena ya había scrolleado fuera de pantalla y el destello no se veía.
    //
    // Ahora el destello es una función de la POSICIÓN del scroll, no del
    // tiempo. Eso da tres cosas:
    //   1) Fluidez total: avanza exactamente al ritmo de la rueda/el dedo,
    //      sin lag ni animaciones que corren por su cuenta.
    //   2) Imposible de saltear: para llegar al blanco hay que scrollear a
    //      través del destello, así que siempre se aprecia.
    //   3) Imposible que quede a medias: a DESTELLO_FIN la pantalla ya está
    //      100% blanca, y recién ahí termina el tramo pinneado — o sea, el
    //      destello SIEMPRE termina antes de que se llegue a la parte
    //      blanca.
    //
    // Las dos constantes están en "progreso del tramo pinneado" (0 = recién
    // se pinneó, 1 = se está por soltar):
    //   - antes de 0.74 no pasa nada (se lee el texto y se mira a Orión)
    //   - entre 0.74 y 0.96 crece el halo y la pantalla se va a blanco
    //   - de 0.96 a 1 ya está todo blanco: es apenas un respiro antes de que
    //     la escena de la ruta tome la pantalla (con su propio velo blanco,
    //     ver .ruta-destello en styles.css — por eso no se ve ningún corte)
    // ======================================================================
    const seccion = document.getElementById("escena-4");
    const pasoRecibido = document.querySelector('.paso-corte[data-paso="2"]');
    const halo = document.getElementById("of-halo-grupo");
    const blanco = pasoRecibido ? pasoRecibido.querySelector(".of-blanco") : null;

    if (seccion && halo && blanco) {

        const DESTELLO_INICIO = 0.74;
        const DESTELLO_FIN = 0.96;
        const HALO_ESCALA_MAX = 30;

        function actualizarDestello() {
            const rect = seccion.getBoundingClientRect();
            const alturaPinneada = seccion.offsetHeight - window.innerHeight;
            let progreso = alturaPinneada > 0 ? (-rect.top) / alturaPinneada : 0;
            progreso = Math.min(1, Math.max(0, progreso));

            // t = 0 al empezar el destello, 1 cuando ya está todo blanco
            let t = (progreso - DESTELLO_INICIO) / (DESTELLO_FIN - DESTELLO_INICIO);
            t = Math.min(1, Math.max(0, t));

            // El halo arranca despacio y se dispara sobre el final: se siente
            // como una luz que se enciende, no como un círculo que se infla a
            // velocidad constante.
            const crecimiento = Math.pow(t, 2.2);
            halo.style.opacity = Math.min(1, t * 4);
            halo.style.transform = `scale(${0.4 + crecimiento * HALO_ESCALA_MAX})`;

            // El blanco entra en la última mitad del destello, cuando el halo
            // ya llenó buena parte de la pantalla — así primero se ve crecer
            // la luz y recién después el encandilamiento la termina de tapar.
            blanco.style.opacity = Math.min(1, Math.max(0, (t - 0.5) / 0.5));
        }

        let esperandoFrame = false;
        window.addEventListener("scroll", () => {
            if (!esperandoFrame) {
                esperandoFrame = true;
                requestAnimationFrame(() => {
                    actualizarDestello();
                    esperandoFrame = false;
                });
            }
        }, { passive: true });
        window.addEventListener("resize", actualizarDestello);

        actualizarDestello(); // estado inicial, por si ya está a la vista al cargar
    }

    // El destello no se corta al terminar esta escena: la escena de la ruta
    // arranca con su propio velo blanco encima (ver .ruta-destello en
    // styles.css), que se disuelve recién cuando su sticky queda pinneado —
    // así la pantalla nunca deja de estar en blanco al cruzar de una escena a
    // la otra, y la ruta aparece en ese mismo lugar. Ese momento lo decide
    // js/escena-ruta.js, que ya lee el scroll en cada frame.

});