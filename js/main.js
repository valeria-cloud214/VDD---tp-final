document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // LÓGICA ESCENA 2 (Fotos con crossfade real, 8 fotos / 4 párrafos)
    // ==========================================
    // "transition: background-image" no anima en ningún navegador, así que
    // el corte entre fotos era siempre seco. Con 2 capas superpuestas sí
    // hay una transición real: a la capa que está OCULTA se le pone la
    // foto que sigue, y recién ahí se le sube la opacidad mientras la otra
    // baja la suya.
    //
    // Ahora hay 8 fotos pero el texto sigue siendo el mismo de 4 párrafos:
    // cada párrafo acompaña 2 fotos seguidas (pasos 1-2 → párrafo 1,
    // 3-4 → párrafo 2, 5-6 → párrafo 3, 7-8 → párrafo 4).
    const capaFotoA = document.getElementById("fondo-jorge-a");
    const capaFotoB = document.getElementById("fondo-jorge-b");
    const disparadoresE2 = document.querySelectorAll(".disparador");
    const parrafos = document.querySelectorAll(".parrafo-historia");

    const PARRAFO_POR_PASO = { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4 };

    let capaVisible = capaFotoA;
    let capaOculta = capaFotoB;

    if (capaFotoA && capaFotoB) {
        capaFotoA.classList.add("foto1", "foto-visible");
    }

    const opcionesE2 = {
        root: null,
        rootMargin: "-10% 0px -50% 0px", // más ajustado que antes, ritmo parecido al de la ráfaga de escena 3
        threshold: 0
    };

    const observadorE2 = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                const paso = Number(entrada.target.getAttribute("data-foto"));

                if (capaFotoA && capaFotoB) {
                    const claseFoto = `foto${paso}`;
                    if (!capaVisible.classList.contains(claseFoto)) {
                        capaOculta.className = `fondo-dinamico fondo-capa-${capaOculta === capaFotoA ? "a" : "b"} ${claseFoto}`;
                        // Fuerza un reflow antes de subir la opacidad, si no
                        // el navegador puede saltarse la transición.
                        void capaOculta.offsetWidth;
                        capaOculta.classList.add("foto-visible");
                        capaVisible.classList.remove("foto-visible");
                        [capaVisible, capaOculta] = [capaOculta, capaVisible];
                    }
                }

                const parrafoActivo = String(PARRAFO_POR_PASO[paso]);
                parrafos.forEach(parrafo => {
                    parrafo.classList.toggle("activo", parrafo.getAttribute("data-parrafo") === parrafoActivo);
                });
            }
        });
    }, opcionesE2);

    disparadoresE2.forEach(d => observadorE2.observe(d));



    // ==========================================
    // LÓGICA ESCENA 3 (Ráfaga / Animación rápida)
    // ==========================================
    const fondoViaje = document.getElementById("fondo-viaje");
    const disparadoresE3 = document.querySelectorAll(".disparador-rafaga");

    // Foto inicial por defecto para la escena 3
    if (fondoViaje) fondoViaje.className = "fondo-dinamico e2-foto1";

    const opcionesE3 = {
        root: null,
        rootMargin: "-5% 0px -45% 0px", // Configuración ajustada para ráfagas rápidas
        threshold: 0
    };

    const observadorE3 = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                const paso = entrada.target.getAttribute("data-foto");
                
                // Cambia la foto velozmente sin alterar el texto
                fondoViaje.className = "fondo-dinamico";
                fondoViaje.classList.add(`e2-foto${paso}`);
            }
        });
    }, opcionesE3);

    disparadoresE3.forEach(d => observadorE3.observe(d));

// ==========================================
    // LÓGICA ESCENA 4 (Reparada)
    // ==========================================
    const disparadoresE4 = document.querySelectorAll(".disparador-corte");
    const pasosCorte = document.querySelectorAll(".paso-corte");

    const opcionesE4 = {
        root: null,
        rootMargin: "-15% 0px -15% 0px", // Margen equilibrado para evitar saltos bruscos
        threshold: 0
    };

    const observadorE4 = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                const corteActual = entrada.target.getAttribute("data-corte");
                
                pasosCorte.forEach(paso => {
                    if (paso.getAttribute("data-paso") === corteActual) {
                        paso.classList.add("activo-corte");
                    } else {
                        paso.classList.remove("activo-corte");
                    }
                });
            }
        });
    }, opcionesE4);

    disparadoresE4.forEach(d => observadorE4.observe(d));

    // La Escena 5 (ruta con el auto) ahora la maneja js/escena-ruta.js,
    // sincronizada directo con el scroll en vez de por disparadores.

    // ==========================================
    // LÓGICA ESCENA 6 (Viaje final + Grilla)
    // ==========================================
    const fondoViajeFinal = document.getElementById("fondo-viaje-final");
    const textoViaje = document.querySelector(".texto-centrado-viaje");
    const disparadoresE6 = document.querySelectorAll(".disparador-viaje");

    // Estado inicial: foto "inicio" de fondo y texto visible
    if (fondoViajeFinal) fondoViajeFinal.className = "fondo-pantalla-completa-viaje viaje-inicio";
    if (textoViaje) textoViaje.classList.add("activo-viaje");

    // El segundo bloque pegajoso (cielo + panel de ciudad) no tenía ningún
    // estado por defecto: hasta que el disparador "bsas" disparaba (bastante
    // más abajo en el scroll), se veía un cielo vacío y ningún panel activo.
    // Arrancamos directamente en Buenos Aires, igual que el bloque de arriba
    // ya arranca con su estado "inicio" sin esperar al scroll.
    const cieloInicial = document.getElementById("cielo-estrellas");

    // Cuenta un [data-count-hasta] (magnitud límite / estrellas / población /
    // altitud) desde 0 hasta su valor final, con un ease-out simple.
    // data-count-formato="miles" agrupa los miles (3.000.000) para población.
    function contarNumero(el, duracion = 900) {
        const destino = parseFloat(el.getAttribute("data-count-hasta"));
        if (Number.isNaN(destino)) return;
        const decimales = Number(el.getAttribute("data-count-decimales") || "0");
        const formateador = el.getAttribute("data-count-formato") === "miles"
            ? new Intl.NumberFormat("es-AR", { maximumFractionDigits: decimales })
            : null;
        const escribir = (valor) => { el.textContent = formateador ? formateador.format(valor) : valor.toFixed(decimales); };
        const inicio = performance.now();
        function paso(ahora) {
            const progreso = Math.min(1, (ahora - inicio) / duracion);
            const facilitado = 1 - Math.pow(1 - progreso, 3); // ease-out cúbico
            escribir(destino * facilitado);
            if (progreso < 1) requestAnimationFrame(paso);
            else escribir(destino);
        }
        requestAnimationFrame(paso);
    }

    // Activa la tarjeta de una ciudad (crossfade ya lo resuelve el CSS vía
    // ".activa") y dispara el count-up de sus números — la barra y los
    // puntos de contaminación se animan solos por CSS al mismo tiempo.
    function activarCiudad(elemento) {
        document.querySelectorAll(".info-ciudad").forEach(t => t.classList.remove("activa"));
        if (!elemento) return;
        elemento.classList.add("activa");
        elemento.querySelectorAll("[data-count-hasta]").forEach(el => contarNumero(el));
    }

    // Buenos Aires (la primera ciudad) tenía un comportamiento distinto a
    // las otras dos: como se activaba de forma síncrona acá mismo, el
    // navegador podía pintarla directamente en su estado final sin
    // transición visible, y recién con el disparador "bsas" (más abajo en
    // el scroll) se veía animar algo. Un doble requestAnimationFrame no
    // alcanzaba (el navegador puede procesar los dos callbacks antes de
    // pintar ningún frame intermedio). El truco que sí funciona en el resto
    // del proyecto (ver el crossfade de fotos de la escena 2, más arriba en
    // este archivo) es forzar un reflow síncrono entre el estado de reposo
    // y el estado activo: leer una propiedad de layout obliga al navegador
    // a aplicar el primer estado antes de seguir, así el cambio siguiente sí
    // se detecta como una transición real.
    if (cieloInicial) cieloInicial.className = ""; // estado de reposo: sin ciudad activa
    if (cieloInicial) void cieloInicial.offsetWidth; // fuerza el reflow
    if (cieloInicial) cieloInicial.className = "cielo-bsas";
    activarCiudad(document.querySelector(".bsas-info"));

    // ¿Qué significa la magnitud límite?: hover ya lo resuelve el CSS
    // (:hover / :focus-within); el click es para que también funcione con
    // un solo toque en mobile, donde no existe hover.
    (function conectarInfoMagnitud() {
        const contenedor = document.getElementById("ic-info-fija");
        const boton = document.getElementById("ic-info-boton");
        if (!contenedor || !boton) return;

        boton.addEventListener("click", (evento) => {
            evento.stopPropagation();
            const abierto = contenedor.classList.toggle("ic-info-abierta");
            boton.setAttribute("aria-expanded", String(abierto));
        });

        document.addEventListener("click", (evento) => {
            if (!contenedor.contains(evento.target)) {
                contenedor.classList.remove("ic-info-abierta");
                boton.setAttribute("aria-expanded", "false");
            }
        });
    })();

    const opcionesE6 = {
        root: null,
        rootMargin: "-30% 0px -50% 0px",
        threshold: 0
    };

    const observadorE6 = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                const paso = entrada.target.getAttribute("data-viaje");

                // El texto centrado solo se muestra en el paso "inicio"
                if (textoViaje) {
                    textoViaje.classList.toggle("activo-viaje", paso === "inicio");
                }

                // El paso "inicio" no toca el cielo ni el panel de ciudad: si
                // lo hiciera, borraría la "activa" que ya dejamos puesta por
                // defecto en Buenos Aires (más arriba) sin volver a ponerla
                // hasta que el disparador "bsas" disparase bastante después
                // — el panel se quedaba en blanco todo ese tramo de scroll.
                if (paso === "inicio") return;

                // El fondo dinámico cambia de foto en los pasos "bsas"-"junin"
                const cielo = document.getElementById("cielo-estrellas");

                if(cielo){

                    if(paso === "bsas"){
                        cielo.className = "cielo-bsas";
                    }

                    if(paso === "firmat"){
                        cielo.className = "cielo-firmat";
                    }

                    if(paso === "junin"){
                        cielo.className = "cielo-junin";
                    }

                }

                if (paso === "bsas") activarCiudad(document.querySelector(".bsas-info"));
                if (paso === "firmat") activarCiudad(document.querySelector(".firmat-info"));
                if (paso === "junin") activarCiudad(document.querySelector(".junin-info"));

            }
        });
    }, opcionesE6);

    disparadoresE6.forEach(d => observadorE6.observe(d));


// ==========================================
    // LÓGICA TELÓN
    // ==========================================
    const telon = document.getElementById("telon");
    const disparadoresTelon = document.querySelectorAll(".disparador-telon");
    const escena8 = document.getElementById("escena-8-transicion");

    const observadorTelon = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                telon.classList.add("telon-activo");
            } else {
                const rect = entrada.boundingClientRect;
                if (rect.top > 0) {
                    telon.classList.remove("telon-activo");
                }
            }
        });
    }, { root: null, rootMargin: "0px", threshold: 0.3 });

    disparadoresTelon.forEach(d => observadorTelon.observe(d));

    // Cuando aparece la escena 8, el telón se levanta
    const observadorLevantaTelon = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                telon.classList.remove("telon-activo");
            }
        });
    }, { root: null, rootMargin: "0px", threshold: 0.1 });

    if (escena8) observadorLevantaTelon.observe(escena8);


    
    // ==========================================
    // LÓGICA ESCENA 8 TRANSICIÓN
    // ==========================================
    const disparadores8t = document.querySelectorAll(".disparador-unificado-8t");
    const parrafos8t = document.querySelectorAll("[data-unificado-8t]");

    const observador8t = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                parrafos8t.forEach(p => p.classList.add("activo-unificado"));
            }
        });
    }, { root: null, rootMargin: "-30% 0px -50% 0px", threshold: 0 });

    disparadores8t.forEach(d => observador8t.observe(d));


    // ==========================================
    // LÓGICA ESCENA 8 — Grilla mundial
    // ==========================================
    // La conclusión de esta grilla ("no importa el continente/idioma...")
    // ya no se muestra acá: ahora es el arranque de la escena de cierre
    // (ver js/escena-cierre.js), que además se encarga de que la grilla se
    // desvanezca gradualmente en vez de aparecer un cartel de texto.
    
    const disparadoresMG = document.querySelectorAll(".disparador-mundo-graficos");
    const introMG = document.querySelector(".intro-graficos-mundo");
    const grillaMG = document.querySelector(".grilla-graficos-mundo");
    const celdasGrafico = document.querySelectorAll(".celda-grafico-mundo");

    const observadorMG = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                const paso = entrada.target.getAttribute("data-paso-mg");
                if (paso === "graficos") {
                    if (introMG) introMG.classList.add("activo-mg");
                }
            }
        });
    }, { root: null, rootMargin: "-10% 0px -20% 0px", threshold: 0 });

    disparadoresMG.forEach(d => observadorMG.observe(d));

    // ==========================================
    // Carga manual de cada gráfico Flourish de la grilla
    // ==========================================
    const observadorGraficosMG = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                const placeholder = entrada.target.querySelector(".flourish-embed");
                if (placeholder && !placeholder.dataset.cargado && window.Flourish && window.Flourish.loadEmbed) {
                    window.Flourish.loadEmbed(placeholder);
                    placeholder.dataset.cargado = "1";

                    requestAnimationFrame(() => {
                        entrada.target.style.transform = "translateZ(0)";
                        void entrada.target.offsetHeight;
                    });

                    // Flourish crea el <iframe> real recién después de loadEmbed(),
                    // así que esperamos a que aparezca y a que termine de cargar
                    // su contenido, en vez de asumir que ya está listo.
                    const chequearIframe = setInterval(() => {
                        const iframe = placeholder.querySelector("iframe");
                        if (iframe) {
                            clearInterval(chequearIframe);
                            iframe.addEventListener("load", () => {
                                entrada.target.classList.add("grafico-listo");
                            });
                        }
                    }, 100);
                }
            }
        });
    }, { root: null, rootMargin: "300px 0px", threshold: 0.01 });

    celdasGrafico.forEach(c => observadorGraficosMG.observe(c));

}); // ← cierre del DOMContentLoaded


    //----------------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------------

// 1. DIMENSIONES DEL GRÁFICO (Asegúrate de que use la mitad de la pantalla)
const margin = { top: 50, right: 70, bottom: 100, left: 70 };

// Usamos el 50% del ancho de la ventana para definir el contenedor base
const width = (window.innerWidth / 2) - margin.left - margin.right;
const height = window.innerHeight - margin.top - margin.bottom;

// 2. CREACIÓN DEL CONTENEDOR SVG
const svg = d3.select("#my_dataviz")
  .append("svg")
    // El SVG total mide exactamente el 50% de la pantalla
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    // Centramos el SVG usando estilos automáticos de bloque
    .style("display", "block")
    .style("margin", "auto") 
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Leemos tu archivo CSV
d3.csv("grafico-poblacion.csv").then( function(data) {

  // 1. EJE X: Escala de bandas para textos (Ciudades)
  const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(function(d) { return d.Ciudad; }))
      .padding(0.2);

  // Dibujamos el Eje X
  svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

  // 2. EJE Y: Escala lineal para los números (Población)
  const y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.Poblacion; })])
      .range([height, 0]);

  // Dibujamos el Eje Y
  svg.append("g")
      .call(d3.axisLeft(y));

  // 3. DIBUJAR LAS BARRAS (Nacen desmarcadas)
  const barras = svg.selectAll("rect")
      .data(data)
      .join("rect")
        .attr("x", function(d) { return x(d.Ciudad); })
        .attr("y", function(d) { return y(+d.Poblacion); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(+d.Poblacion); })
        .style("fill", "#69b3a2")
        .style("opacity", 0.5) 
        .style("transition", "opacity 0.4s ease"); // Transición suave para el encendido


   // 1. NUEVA ESCALA PARA EL ÍNDICE INDUSTRIAL
    const yIndustrial = d3.scaleLinear()
        .domain([0, 10]) 
        .range([height, 0]);

    // 2. CREACIÓN DE LOS PUNTOS (Ponlo justo debajo de tus barras)
    const puntos = svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", function(d) { return x(d.Ciudad) + x.bandwidth() / 2; })
        .attr("cy", function(d) { return yIndustrial(+d.Indice_Industrial_Nocturno); })
        .attr("r", 6)
        .style("fill", "#ff6b6b")
        .style("opacity", 0) // <--- NACEN COMPLETAMENTE OCULTOS
        .style("transition", "opacity 0.4s ease");     


  // Función para marcar una sola ciudad
  function marcarSolo(nombreCiudad) {
    puntos.style("opacity", 0);
    barras.style("opacity", function(d) {
      return d.Ciudad === nombreCiudad ? 1.0 : 0.1;
    });
  }

  // Función para marcar absolutamente todas
  function marcarTodas() {
    barras.style("opacity", 1.0);
    puntos.style("opacity", 0.0);
  }

  function marcarPuntos(){
    puntos.style("opacity", 1.0);
  }

  // --- CONTROL DE SCROLLYTELLING CON .stepG ---
  // Una sola fuente de verdad: qué tarjeta de texto está cruzando la mitad
  // de la pantalla decide qué se resalta en el gráfico. (Antes había un
  // segundo listener por umbrales de píxeles fijos, redundante y con un bug
  // de scope que tiraba un error en cada scroll.)
  const steps = document.querySelectorAll('.stepG');

  window.addEventListener("scroll", function() {
    // Definimos la línea imaginaria en la mitad vertical de la pantalla
    const mitadDePantalla = window.innerHeight / 2;

    steps.forEach(step => {
      // Obtenemos las coordenadas de la tarjeta actual respecto a la pantalla
      const limites = step.getBoundingClientRect();

      // Si la tarjeta está cruzando la mitad de la pantalla
      if (limites.top < mitadDePantalla && limites.bottom > mitadDePantalla) {

        // A) Resaltamos visualmente la tarjeta de texto actual
        steps.forEach(s => s.classList.remove('active'));
        step.classList.add('active');

        // B) Leemos qué ciudad tiene asignada esta tarjeta mediante su atributo HTML
        const ciudadActiva = step.getAttribute('data-ciudad');

        // C) Ejecutamos la animación correspondiente en el gráfico
        if (ciudadActiva === "inicial") {
          barras.style("opacity", 0.15); // Todo apagado
          puntos.style("opacity", 0);
        } else if (ciudadActiva === "todas") {
          marcarTodas();                 // Todo encendido
        } else if (ciudadActiva === "puntos") {
          marcarPuntos();                // Muestra el índice industrial nocturno
        } else {
          marcarSolo(ciudadActiva);      // Enciende CABA, Firmat o Junín dinámicamente
        }
      }
    });
  });

}).catch(function(error) {
  console.error("Error al cargar el archivo:", error);
});