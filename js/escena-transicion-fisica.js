/* ==========================================================================
   ESCENA 6C — Puente hacia la física de la contaminación lumínica
   ==========================================================================
   El scatter que el usuario acaba de recorrer mostraba una relación (más
   población, generalmente menos estrellas visibles), pero una relación no
   es una explicación. Esta escena es el pequeño descanso narrativo antes de
   entrar a esa explicación: el scatter se desvanece, quedan unos segundos
   de fondo oscuro y silencio, aparecen un par de frases sueltas y un
   mini-gráfico discreto (con datos reales de grafico-chico.csv), después una
   pequeña infografía resume el mecanismo en 4 pasos, y todo eso termina
   disolviéndose hasta dejar una única farola apagada — que se enciende
   lentamente con la frase final. Esa misma farola encendida es la imagen
   con la que arranca la escena "luz".

   El cambio de paso lo dispara el scroll (13 disparadores de 100vh, ver
   #escena-6c en index.html), con el mismo patrón de IntersectionObserver que
   ya usan las otras escenas de transición en main.js / escena-transicion-datos.js.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const pin = document.querySelector(".pin-transicion-fisica");
    if (!pin) return; // La escena no está en esta página.

    // ======================================================================
    // 1. MINI-GRÁFICO — línea de tendencia real (regresión lineal simple
    //    sobre log10(población) → calidad de cielo), calculada a partir de
    //    grafico-chico.csv. Se dibuja con la misma técnica de siempre
    //    (stroke-dasharray/dashoffset), sólo que el "d" ahora sale de datos
    //    reales en vez de estar escrito a mano.
    // ======================================================================
    const lineaGrafico = document.getElementById("tf-linea-grafico");

    function prepararTrazo() {
        if (!lineaGrafico) return;
        const largo = lineaGrafico.getTotalLength();
        lineaGrafico.style.strokeDasharray = `${largo}`;
        lineaGrafico.style.strokeDashoffset = `${largo}`;
    }

    if (lineaGrafico && window.d3) {
        d3.csv("grafico-chico.csv").then((filas) => {
            // Varias ciudades comparten población redondeada (ej. 120 mil):
            // se promedia su índice para tener un único punto por población,
            // así la tendencia queda limpia en vez de zigzagueante.
            const agregados = Array.from(
                d3.rollup(
                    filas,
                    v => d3.mean(v, d => +d.Indice_Contaminacion_Luminica),
                    d => +d.Poblacion_miles
                ),
                ([poblacion, indice]) => ({ poblacion, indice })
            ).sort((a, b) => a.poblacion - b.poblacion);

            if (!agregados.length) throw new Error("CSV vacío");

            // Población en escala logarítmica (va de 3 a 3000 miles: en
            // escala lineal casi todo quedaría amontonado a la izquierda).
            const puntos = agregados.map(d => ({ x: Math.log10(d.poblacion), y: d.indice }));

            // Regresión lineal simple (mínimos cuadrados): resume la
            // tendencia real sin dibujar los 16 puntos sueltos, que quedan
            // demasiado ruidosos para "un recordatorio visual" chico.
            const n = puntos.length;
            const sumX = d3.sum(puntos, p => p.x);
            const sumY = d3.sum(puntos, p => p.y);
            const sumXY = d3.sum(puntos, p => p.x * p.y);
            const sumXX = d3.sum(puntos, p => p.x * p.x);
            const pendiente = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const ordenada = (sumY - pendiente * sumX) / n;
            const y = x => pendiente * x + ordenada;

            const [xMin, xMax] = d3.extent(puntos, p => p.x);
            const [yMinDato, yMaxDato] = d3.extent(puntos, p => p.y);
            const paddingY = (yMaxDato - yMinDato) * 0.25 || 0.3;

            const xScale = d3.scaleLinear().domain([xMin, xMax]).range([18, 286]);
            // Más arriba = mejor calidad de cielo: el eje se lee de forma
            // intuitiva sin necesitar ninguna etiqueta numérica.
            const yScale = d3.scaleLinear().domain([yMinDato - paddingY, yMaxDato + paddingY]).range([148, 14]);

            lineaGrafico.setAttribute(
                "d",
                `M ${xScale(xMin)},${yScale(y(xMin))} L ${xScale(xMax)},${yScale(y(xMax))}`
            );
            prepararTrazo();
        }).catch(() => {
            // Si el fetch falla (por ejemplo, abriendo el sitio como archivo
            // local sin servidor), se conserva el "d" de respaldo que ya
            // está en el HTML.
            prepararTrazo();
        });
    } else {
        prepararTrazo();
    }

    // ======================================================================
    // 2. EL SCATTER SE DESVANECE — sentinela propio al final de
    //    .seccion-grafico (#contenedor-svg todavía sigue pegajoso ahí, así
    //    que el fade ocurre mientras el gráfico sigue en pantalla, no
    //    después de que ya scrolleó fuera de vista).
    // ======================================================================
    const contenedorSvgScatter = document.getElementById("contenedor-svg");
    const disparadorSalidaGrafico = document.querySelector(".tf-disparador-salida-grafico");

    if (contenedorSvgScatter && disparadorSalidaGrafico) {
        const observadorSalida = new IntersectionObserver((entradas) => {
            entradas.forEach(entrada => {
                contenedorSvgScatter.classList.toggle("tf-desvanecido", entrada.isIntersecting);
            });
        }, { root: null, rootMargin: "0px", threshold: 0 });
        observadorSalida.observe(disparadorSalidaGrafico);
    }

    // ======================================================================
    // 3. SCROLL — los 13 pasos de la escena
    // ======================================================================
    const frases = document.querySelectorAll("[data-frase-tf]");
    const bloquesInfo = document.querySelectorAll("[data-info-bloque]");
    const flechasInfo = document.querySelectorAll("[data-info-flecha]");
    const disparadores = document.querySelectorAll(".tf-disparador");

    // Qué frase suelta corresponde a cada paso (el resto de los pasos —
    // silencios, luces, gráfico, infografía, farola— no activan ninguna).
    const FRASE_POR_PASO = { 2: 1, 3: 2, 5: 3, 12: 4 };

    function actualizarPaso(paso) {
        // Luces urbanas lejanas y muy discretas: aparecen con la segunda
        // frase y ya se retiraron antes de que empiece la infografía.
        pin.classList.toggle("tf-luces", paso >= 3 && paso < 6);

        // Mini-gráfico: termina de dibujarse en el paso 4; apenas llega la
        // frase 3 (paso 5) empieza a desvanecerse.
        pin.classList.toggle("tf-grafico", paso === 4);
        if (lineaGrafico) {
            lineaGrafico.style.strokeDashoffset = paso === 4 ? "0" : lineaGrafico.style.strokeDasharray;
        }

        // Infografía puente: visible mientras se van revelando sus 4
        // bloques (pasos 6 a 9); se desvanece exactamente igual que el
        // mini-gráfico apenas se pasa al siguiente paso (10, silencio).
        pin.classList.toggle("tf-infografia-visible", paso >= 6 && paso < 10);
        bloquesInfo.forEach(b => {
            const desde = Number(b.getAttribute("data-info-bloque")) + 5; // 1→6, 2→7, 3→8, 4→9
            b.classList.toggle("visible-tf", paso >= desde);
        });
        flechasInfo.forEach(f => {
            // La flecha N se ilumina cuando aparece el bloque N+1.
            const desde = Number(f.getAttribute("data-info-flecha")) + 6; // 1→7, 2→8, 3→9
            f.classList.toggle("encendida-tf", paso >= desde);
        });

        // La farola aparece apagada y se enciende con la frase final.
        pin.classList.toggle("tf-farol", paso >= 11);
        pin.classList.toggle("tf-farol-encendido", paso >= 12);

        // Frases sueltas: sólo una activa a la vez.
        const fraseActiva = FRASE_POR_PASO[paso] || null;
        frases.forEach(f => {
            const num = Number(f.getAttribute("data-frase-tf"));
            f.classList.toggle("activo-tf", fraseActiva !== null && num === fraseActiva);
        });
    }

    const observadorPasos = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                actualizarPaso(Number(entrada.target.getAttribute("data-paso-tf")));
            }
        });
    }, { root: null, rootMargin: "-30% 0px -50% 0px", threshold: 0 });

    disparadores.forEach(d => observadorPasos.observe(d));

});
