/* ==========================================================================
   ESCENA MUNDIAL — El mismo patrón, repetido en todo el planeta
   ==========================================================================
   3 partes independientes, cada una con su propio controlador de scroll
   más abajo en este archivo:

   PARTE 1 — pinneada (mismo mecanismo que escena-6a: pin de 100vh + N
   disparadores de 100vh + un actualizarPaso(paso) con comparaciones ">=").
   Actos 1 (cambio de escala) y 2 (el mundo empieza a aparecer): 7 pasos.

   PARTE 2 — la grilla (acto 3), en SCROLL NORMAL, no pinneada. Los
   gráficos de Flourish traen su propio título/leyenda incrustado en el
   embed; forzarlos a entrar en una grilla recortada a 100vh los hacía
   solaparse con el resto del contenido. Acá cada fila (frase + 4 gráficos
   a tamaño completo) se revela sola con un IntersectionObserver liviano
   apenas entra en pantalla — si hay que scrollear para ver las 16, es lo
   esperado.

   PARTE 3 — pinneada otra vez (mismo mecanismo que la parte 1): acto 4,
   el cierre que empalma con la escena final existente.

   Todos los textos, ciudades, overlays y destacados salen de
   js/datos-mundo.js.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

    if (typeof CIUDADES_MUNDO === "undefined") return; // Falta datos-mundo.js

    // PRNG determinístico (mismo patrón que el resto del proyecto): posición
    // "orgánica" de los nombres flotantes, pero igual en cada carga.
    function crearRandom(semilla) {
        let a = semilla >>> 0;
        return function () {
            a |= 0; a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    const azar = crearRandom(240817);
    const entre = (min, max) => min + azar() * (max - min);

    // Arma un conjunto de "beats" de texto (cada array interno de `lineas`
    // es un beat: sus renglones aparecen juntos) dentro de `contenedor`.
    // Devuelve los elementos creados, en orden.
    function crearBeats(contenedor, lineas, prefijoClase, atributo) {
        if (!contenedor) return [];
        return lineas.map((renglones, i) => {
            const beat = document.createElement("div");
            beat.className = prefijoClase;
            beat.setAttribute(atributo, String(i + 1));
            renglones.forEach(texto => {
                const p = document.createElement("p");
                p.textContent = texto;
                beat.appendChild(p);
            });
            contenedor.appendChild(beat);
            return beat;
        });
    }

    function cargarCelda(celda) {
        const placeholder = celda.querySelector(".flourish-embed");
        if (!placeholder || placeholder.dataset.cargado) return;
        if (!(window.Flourish && window.Flourish.loadEmbed)) return;
        window.Flourish.loadEmbed(placeholder);
        placeholder.dataset.cargado = "1";

        const chequearIframe = setInterval(() => {
            const iframe = placeholder.querySelector("iframe");
            if (iframe) {
                clearInterval(chequearIframe);
                iframe.addEventListener("load", () => celda.classList.add("grafico-listo"));
            }
        }, 100);
    }

    // ======================================================================
    // PARTE 1 — intro pinneada (actos 1 y 2)
    // ======================================================================
    (function iniciarIntro() {
        const raiz = document.getElementById("mundo-intro-pin");
        if (!raiz) return;

        const contenedorNombres = document.getElementById("mundo-nombres-ciudades");
        const nombresEl = NOMBRES_MUNDO_ACTO2.map((nombre, i) => {
            const el = document.createElement("span");
            el.className = "mundo-nombre-ciudad";
            el.textContent = nombre;
            el.style.left = `${entre(8, 84)}%`;
            el.style.top = `${entre(14, 80)}%`;
            el.style.fontSize = `${entre(0.95, 1.5).toFixed(2)}rem`;
            el.style.transitionDelay = `${(i % 4) * 90}ms`;
            contenedorNombres.appendChild(el);
            return el;
        });

        const beatsActo1 = crearBeats(document.getElementById("mundo-acto1-texto"), NARRATIVA_MUNDO.acto1, "mundo-linea-acto1", "data-linea-m1");
        const beatsActo2 = crearBeats(document.getElementById("mundo-acto2-texto"), NARRATIVA_MUNDO.acto2, "mundo-frase-acto2", "data-frase-m2");

        const acto1 = document.getElementById("mundo-acto1");
        const acto2 = document.getElementById("mundo-acto2");
        const disparadores = document.querySelectorAll(".mundo-intro-disparador");
        const FRASE_ACTO2_POR_PASO = { 6: 1, 7: 2 };

        function actualizarPaso(paso) {
            if (acto1) acto1.classList.toggle("mundo-visible", paso >= 1 && paso <= 4);
            beatsActo1.forEach((beat, i) => beat.classList.toggle("activo-m", paso >= i + 1));

            if (acto2) acto2.classList.toggle("mundo-visible", paso >= 5 && paso <= 7);
            const nombresVisibles = paso === 5 ? 4 : paso === 6 ? 8 : paso >= 7 ? nombresEl.length : 0;
            nombresEl.forEach((el, i) => el.classList.toggle("mundo-nombre-activo", i < nombresVisibles));
            const fraseActiva = FRASE_ACTO2_POR_PASO[paso] || null;
            beatsActo2.forEach((beat, i) => beat.classList.toggle("activo-m", fraseActiva !== null && i + 1 === fraseActiva));
        }

        const observador = new IntersectionObserver((entradas) => {
            entradas.forEach(entrada => {
                if (entrada.isIntersecting) actualizarPaso(Number(entrada.target.getAttribute("data-paso-mundo")));
            });
        }, { root: null, rootMargin: "-30% 0px -50% 0px", threshold: 0 });

        disparadores.forEach(d => observador.observe(d));
    })();

    // ======================================================================
    // PARTE 2 — la grilla (acto 3), en scroll normal
    // ======================================================================
    (function iniciarGrilla() {
        const contenedorGrilla = document.getElementById("grilla-graficos-mundo");
        const seccionGrilla = document.getElementById("escena-mundo-grilla");
        if (!contenedorGrilla || !seccionGrilla) return;

        const guia = document.getElementById("mundo-guia");
        if (guia) guia.innerHTML = `<h3>${GUIA_GRILLA_MUNDO.titulo}</h3><p>${GUIA_GRILLA_MUNDO.texto}</p>`;
        const introGrilla = document.getElementById("mundo-intro-grilla");
        if (introGrilla) introGrilla.textContent = INTRO_GRILLA_MUNDO;

        // 4 filas: una frase (que ocupa todo el ancho de la grilla) seguida
        // de sus 4 ciudades. Nada de wrappers extra: la frase usa
        // "grid-column: 1 / -1" (ver CSS) para forzar su propia fila antes
        // de que entren las 4 celdas siguientes.
        const FILAS = CIUDADES_MUNDO.reduce((filas, ciudad, i) => {
            const indice = Math.floor(i / 4);
            (filas[indice] = filas[indice] || []).push(ciudad);
            return filas;
        }, []);

        const filasDOM = FILAS.map((ciudadesFila, i) => {
            const caption = document.createElement("p");
            caption.className = "mundo-narrativa-fila";
            (NARRATIVA_MUNDO.grilla[i] || []).forEach((linea, idx) => {
                if (idx > 0) caption.appendChild(document.createElement("br"));
                caption.appendChild(document.createTextNode(linea));
            });
            contenedorGrilla.appendChild(caption);

            const celdas = ciudadesFila.map(ciudad => {
                const celda = document.createElement("div");
                celda.className = "celda-grafico-mundo" + (ciudad.destacado ? " mundo-destacada" : "");
                // Sin etiqueta de ciudad propia: cada gráfico de Flourish ya
                // trae su nombre de ciudad incrustado adentro del embed.
                celda.innerHTML = `
                    <div class="cargando-grafico">Cargando gráfico…</div>
                    ${ciudad.overlay ? `<div class="grafico-overlay">${ciudad.overlay}</div>` : ""}
                    <div class="flourish-embed flourish-chart" data-src="${ciudad.src}"></div>
                `;
                contenedorGrilla.appendChild(celda);
                return celda;
            });

            return { caption, celdas, cargada: false };
        });

        // Intro chica (subtítulo de la sección): simple fade al entrar, no
        // hace falta que se retire nunca.
        const observadorSeccion = new IntersectionObserver((entradas) => {
            entradas.forEach(entrada => {
                if (entrada.isIntersecting && introGrilla) introGrilla.classList.add("mundo-visible");
            });
        }, { root: null, rootMargin: "-10% 0px -70% 0px", threshold: 0 });
        observadorSeccion.observe(seccionGrilla);

        // Guía ("¿Qué estás viendo?"): visible mientras la segunda fila
        // todavía no llegó, se apaga apenas se ve (ya cumplió su función) y
        // — importante — VUELVE a aparecer si el usuario scrollea hacia
        // arriba de nuevo por encima de la segunda fila. Mismo patrón que
        // ya usa el telón en main.js: mirar hacia qué lado del viewport
        // salió el target para saber si fue "bajando" o "subiendo".
        if (guia && filasDOM[1]) {
            const observadorGuia = new IntersectionObserver((entradas) => {
                entradas.forEach(entrada => {
                    if (entrada.isIntersecting) {
                        guia.classList.remove("mundo-visible");
                    } else if (entrada.boundingClientRect.top > 0) {
                        // La segunda fila está por debajo del viewport: o
                        // todavía no llegamos, o volvimos para arriba.
                        guia.classList.add("mundo-visible");
                    }
                });
            }, { root: null, rootMargin: "-10% 0px -70% 0px", threshold: 0 });
            observadorGuia.observe(filasDOM[1].caption);
        } else if (guia) {
            guia.classList.add("mundo-visible");
        }

        const observadorFilas = new IntersectionObserver((entradas) => {
            entradas.forEach(entrada => {
                if (!entrada.isIntersecting) return;
                const i = Number(entrada.target.getAttribute("data-fila-indice"));
                const fila = filasDOM[i];
                if (!fila) return;

                fila.caption.classList.add("mundo-visible");
                fila.celdas.forEach(c => c.classList.add("mundo-visible"));
                if (!fila.cargada) {
                    fila.cargada = true;
                    fila.celdas.forEach(cargarCelda);
                }

                // Resaltado contextual: recién cuando terminó de armarse la
                // última fila, marcamos las ciudades "destacado" y
                // atenuamos el resto (ver CSS ".mundo-grilla-resaltando").
                if (i === filasDOM.length - 1) contenedorGrilla.classList.add("mundo-grilla-resaltando");
            });
        }, { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0 });

        filasDOM.forEach((fila, i) => {
            fila.caption.setAttribute("data-fila-indice", String(i));
            observadorFilas.observe(fila.caption);
        });
    })();

    // ======================================================================
    // PARTE 3 — cierre pinneado (acto 4)
    // ======================================================================
    (function iniciarCierre() {
        const raiz = document.getElementById("mundo-cierre-pin");
        if (!raiz) return;

        const beatsCierre = crearBeats(document.getElementById("mundo-acto4-texto"), NARRATIVA_MUNDO.cierre, "mundo-linea-acto4", "data-linea-m4");
        const disparadores = document.querySelectorAll(".mundo-cierre-disparador");

        function actualizarPaso(paso) {
            beatsCierre.forEach((beat, i) => beat.classList.toggle("activo-m", paso >= i + 1));
        }

        const observador = new IntersectionObserver((entradas) => {
            entradas.forEach(entrada => {
                if (entrada.isIntersecting) actualizarPaso(Number(entrada.target.getAttribute("data-paso-cierre")));
            });
        }, { root: null, rootMargin: "-30% 0px -50% 0px", threshold: 0 });

        disparadores.forEach(d => observador.observe(d));
    })();

});
