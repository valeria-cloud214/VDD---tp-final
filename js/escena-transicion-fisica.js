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
    // 1. MINI-GRÁFICO — nube de puntos reales (una por ciudad de
    //    grafico-chico.csv) que aparecen uno a uno, y recién después una
    //    línea de tendencia recta que se dibuja ENCIMA: primero el dato,
    //    después el resumen.
    // ======================================================================
    const capaPuntos = document.getElementById("tf-puntos-grafico");
    const lineaGrafico = document.getElementById("tf-linea-grafico");
    const NS_SVG = "http://www.w3.org/2000/svg";

    function prepararTrazo() {
        if (!lineaGrafico) return;
        const largo = lineaGrafico.getTotalLength();
        lineaGrafico.style.strokeDasharray = `${largo}`;
        lineaGrafico.style.strokeDashoffset = `${largo}`;
    }

    let puntosGrafico = []; // <circle> ya creados, para revelarlos de a uno
    let temporizadoresPuntos = [];
    let temporizadorLinea = null;

    // Muestra (o esconde) la nube de puntos de a uno y, sólo después de que
    // terminaron de aparecer todos, dibuja la línea de tendencia encima.
    function revelarGrafico(activo) {
        temporizadoresPuntos.forEach(clearTimeout);
        temporizadoresPuntos = [];
        clearTimeout(temporizadorLinea);

        if (!activo) {
            puntosGrafico.forEach(c => c.classList.remove("tf-punto-visible"));
            if (lineaGrafico) lineaGrafico.style.strokeDashoffset = lineaGrafico.style.strokeDasharray;
            return;
        }

        const demoraEntrePuntos = 70;
        puntosGrafico.forEach((circulo, i) => {
            temporizadoresPuntos.push(
                setTimeout(() => circulo.classList.add("tf-punto-visible"), 150 + i * demoraEntrePuntos)
            );
        });
        if (lineaGrafico) {
            const demoraLinea = 150 + puntosGrafico.length * demoraEntrePuntos + 300;
            temporizadorLinea = setTimeout(() => {
                lineaGrafico.style.strokeDashoffset = "0";
            }, demoraLinea);
        }
    }

    if (lineaGrafico && capaPuntos && window.d3) {
        d3.csv("grafico-chico.csv").then((filas) => {
            if (!filas.length) throw new Error("CSV vacío");

            // Población en escala logarítmica (va de 3 a 3000 miles: en
            // escala lineal casi todo quedaría amontonado a la izquierda).
            const puntos = filas.map(d => ({
                x: Math.log10(+d.Poblacion_miles),
                y: +d.Indice_Contaminacion_Luminica
            }));

            // Regresión lineal simple (mínimos cuadrados), calculada sobre
            // el promedio por población (no ciudad por ciudad): así una
            // población con varias ciudades no pesa de más en la pendiente.
            const agregados = Array.from(
                d3.rollup(filas, v => d3.mean(v, d => +d.Indice_Contaminacion_Luminica), d => +d.Poblacion_miles),
                ([poblacion, indice]) => ({ x: Math.log10(poblacion), y: indice })
            );
            const n = agregados.length;
            const sumX = d3.sum(agregados, p => p.x);
            const sumY = d3.sum(agregados, p => p.y);
            const sumXY = d3.sum(agregados, p => p.x * p.y);
            const sumXX = d3.sum(agregados, p => p.x * p.x);
            const pendiente = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const ordenada = (sumY - pendiente * sumX) / n;
            const regresion = x => pendiente * x + ordenada;

            const [xMin, xMax] = d3.extent(puntos, p => p.x);
            const [yMinDato, yMaxDato] = d3.extent(puntos, p => p.y);
            const paddingY = (yMaxDato - yMinDato) * 0.25 || 0.3;

            const xScale = d3.scaleLinear().domain([xMin, xMax]).range([76, 286]);
            // Más arriba = mejor calidad de cielo: el eje se lee de forma
            // intuitiva sin necesitar ninguna etiqueta numérica.
            const yScale = d3.scaleLinear().domain([yMinDato - paddingY, yMaxDato + paddingY]).range([148, 14]);

            // --- NUBE DE PUNTOS: una por ciudad, tal cual figuran en el CSV
            puntosGrafico = puntos.map(p => {
                const circulo = document.createElementNS(NS_SVG, "circle");
                circulo.setAttribute("class", "tf-punto-grafico");
                circulo.setAttribute("cx", xScale(p.x));
                circulo.setAttribute("cy", yScale(p.y));
                circulo.setAttribute("r", 3.2);
                circulo.setAttribute("fill", "#f6c453");
                capaPuntos.appendChild(circulo);
                return circulo;
            });

            // --- LÍNEA DE TENDENCIA: recta, resume la regresión real ---
            lineaGrafico.setAttribute(
                "d",
                `M ${xScale(xMin)},${yScale(regresion(xMin))} L ${xScale(xMax)},${yScale(regresion(xMax))}`
            );

            prepararTrazo();

            // Si el scroll ya había llegado al paso del gráfico antes de que
            // terminara de cargar el CSV, disparamos la revelación ahora.
            if (pin.classList.contains("tf-grafico")) revelarGrafico(true);
        }).catch(() => {
            // Si el fetch falla (por ejemplo, abriendo el sitio como archivo
            // local sin servidor), se conserva el "d" de respaldo que ya
            // está en el HTML (sin nube de puntos, pero con la misma línea
            // recta de respaldo).
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
    // silencios, luces, infografía, farola— no activan ninguna). La frase 2
    // se mantiene también en el paso 4 (antes se apagaba justo cuando
    // aparecía el gráfico): ahora queda arriba, fija, mientras el gráfico
    // se revela debajo — "la evidencia visual de lo que acaba de decir".
    const FRASE_POR_PASO = { 2: 1, 3: 2, 4: 2, 5: 3, 12: 4 };

    function actualizarPaso(paso) {
        // Luces urbanas lejanas y muy discretas: aparecen con la segunda
        // frase y ya se retiraron antes de que empiece la infografía.
        pin.classList.toggle("tf-luces", paso >= 3 && paso < 6);

        // Mini-gráfico: en el paso 4 aparecen los puntos de a uno y, recién
        // después, la línea de tendencia; apenas llega la frase 3 (paso 5)
        // empieza a desvanecerse todo junto.
        const graficoActivo = paso === 4;
        pin.classList.toggle("tf-grafico", graficoActivo);
        revelarGrafico(graficoActivo);

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
