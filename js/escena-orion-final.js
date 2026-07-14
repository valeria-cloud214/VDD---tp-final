/* ==========================================================================
   ORIÓN + DESTELLO (capítulo "corte", dentro de la escena unificada)
   ==========================================================================
   Este archivo hace dos cosas:

   1) Dibuja la constelación una vez, al cargar la página. Cuándo APARECE lo
      decide el capítulo corte en main.js: ese observer agrega
      .co-orion-aparece sobre #grupo-corte al llegar al tercer disparador
      (la foto vacía no cambia ni se duplica — es la misma).

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

    // Orientación: vista desde el hemisferio sur, mirando al norte — Orión
    // dada vuelta respecto de la vista clásica del hemisferio norte. Rigel
    // (azulada) arriba a la izquierda, Betelgeuse (roja) abajo a la derecha,
    // el Cinturón cruza el centro en diagonal de abajo-izquierda a
    // arriba-derecha.
    const ESTRELLAS_ORION = [
        { dx: -88, dy: -89, r: 6, color: "#cfe3ff" },   // Rigel
        { dx: 70, dy: 76, r: 5.4, color: "#ffb37a" },   // Betelgeuse
        { dx: -80, dy: 91, r: 4, color: "#eaf1ff" },    // Bellatrix
        { dx: 0, dy: 5, r: 3.6, color: "#ffffff" },     // Alnilam
        { dx: 36, dy: -3, r: 3.5, color: "#ffffff" },   // Alnitak
        { dx: 88, dy: -91, r: 4.2, color: "#cfe3ff" },  // Saiph
        { dx: -32, dy: 13, r: 3.4, color: "#ffffff" }   // Mintaka
    ];
    // Sin cruces: cada lado converge en el extremo del cinturón más cercano
    // (Rigel y Bellatrix van a Mintaka; Saiph y Betelgeuse van a Alnitak).
    const LINEAS_ORION = [[0, 6], [2, 6], [6, 3], [3, 4], [4, 5], [4, 1]];
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
    // Ahora que Jorge, la ráfaga y este capítulo comparten un solo sticky,
    // el progreso ya no se mide contra toda la sección (eso incluiría
    // Jorge y la ráfaga) sino contra el tramo específico donde pasa esto:
    // el tercer disparador del capítulo corte (190vh, el más largo). Como
    // ese div no es sticky — es un espaciador normal, en el flujo, debajo
    // del contenedor fijo — su getBoundingClientRect() cambia con cada
    // pixel de scroll, así que sirve igual de bien para leer el progreso.
    //
    //   - antes de que el tramo entre en pantalla no pasa nada
    //   - progreso 0 → 1 a lo largo de todo el tramo:
    //     · 0.00–0.15: respiro (recién apareció el texto de Orión)
    //     · 0.15–0.90: crece el halo y la pantalla se va a blanco
    //     · 0.90–1.00: ya está todo blanco, un respiro antes de que la
    //       escena de la ruta tome la pantalla (con su propio velo blanco,
    //       ver .ruta-destello en styles.css — por eso no se ve ningún corte)
    // ======================================================================
    const tramoDestello = document.querySelector('.disparador-corte[data-corte="3"]');
    const halo = document.getElementById("of-halo-grupo");
    const blanco = document.getElementById("of-blanco");
    const textoOrionA = document.querySelector('.texto-impacto[data-corte-texto="orion-a"]');
    const textoOrionB = document.querySelector('.texto-impacto[data-corte-texto="orion-b"]');
    // Mismo elemento que marca main.js con .co-orion-aparece al llegar al
    // disparador-corte="3" — lo usamos acá como "portón": mientras el
    // capítulo corte no llegó a ese tramo, esta función no debe tocar ni
    // el halo, ni el blanco, ni las frases de Orión. (Antes se llamaba una
    // vez al cargar la página, con progreso=0, y esa llamada prendía
    // igual .activo en "orion-a" — quedaba superpuesta arriba del párrafo
    // de Jorge desde el primer segundo, aunque la escena de Orión estuviera
    // a miles de píxeles de distancia scroll abajo.)
    const grupoCorte = document.getElementById("grupo-corte");

    if (tramoDestello && halo && blanco && grupoCorte) {

        const DESTELLO_INICIO = 0.15;
        const DESTELLO_FIN = 0.90;
        const HALO_ESCALA_MAX = 30;
        // A qué altura del tramo (0-1) el segundo beat de texto reemplaza al
        // primero — antes de que el halo empiece a crecer fuerte (0.15),
        // para que se alcancen a leer los dos con tranquilidad. (Antes estaba
        // en 0.35: el primer texto quedaba pegado en pantalla mucho más de
        // la cuenta, sin que pasara nada, mientras el halo ya venía creciendo.)
        const CAMBIO_TEXTO_ORION = 0.10;

        function actualizarDestello() {
            // Portón: si Orión todavía no "apareció" (no llegamos al
            // disparador-corte="3"), no tocar nada — se deja el estado que
            // ya define el CSS (halo y blanco apagados, texto de Orión sin
            // .activo) en vez de forzar un cálculo con progreso=0.
            if (!grupoCorte.classList.contains("co-orion-aparece")) return;

            const rect = tramoDestello.getBoundingClientRect();
            const alturaTramo = tramoDestello.offsetHeight;
            let progreso = alturaTramo > 0 ? (-rect.top) / alturaTramo : 0;
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

            // Segundo beat de texto de Orión: mismo mecanismo de "activo"
            // que el resto del sitio, pero decidido por scroll continuo en
            // vez de por un disparador nuevo (este tramo no se divide).
            if (textoOrionA && textoOrionB) {
                const mostrarB = progreso > CAMBIO_TEXTO_ORION;
                textoOrionA.classList.toggle("activo", !mostrarB);
                textoOrionB.classList.toggle("activo", mostrarB);
            }
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