document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // LÓGICA ESCENA 2 (Cambio de fotos y textos)
    // ==========================================
    const fondoJorge = document.getElementById("fondo-jorge");
    const disparadoresE2 = document.querySelectorAll(".disparador");
    const parrafos = document.querySelectorAll(".parrafo-historia");

    if (fondoJorge) fondoJorge.className = "fondo-dinamico foto1";

    const opcionesE2 = {
        root: null,
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0.1
    };

    const observadorE2 = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                const paso = entrada.target.getAttribute("data-foto");
                fondoJorge.className = "fondo-dinamico";
                fondoJorge.classList.add(`foto${paso}`);
                
                parrafos.forEach(parrafo => {
                    if (parrafo.getAttribute("data-parrafo") === paso) {
                        parrafo.classList.add("activo");
                    } else {
                        parrafo.classList.remove("activo");
                    }
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
   // ==========================================
    // LÓGICA ESCENA 5 (Pantalla Completa Unificada)
    // ==========================================
    const disparadoresE5 = document.querySelectorAll(".disparador-unificado");
    const parrafosUnificados = document.querySelectorAll(".parrafo-unificado");

    const opcionesE5 = {
        root: null,
        rootMargin: "-30% 0px -50% 0px",
        threshold: 0
    };

    const observadorE5 = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                const pasoU = entrada.target.getAttribute("data-paso-u");
                
                // Recorremos y activamos solo el elemento que corresponde
                parrafosUnificados.forEach(parrafo => {
                    if (parrafo.getAttribute("data-unificado") === pasoU) {
                        parrafo.classList.add("activo-unificado");
                    } else {
                        parrafo.classList.remove("activo-unificado");
                    }
                });
            }
        });
    }, opcionesE5);

    disparadoresE5.forEach(d => observadorE5.observe(d));

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
    if (cieloInicial) cieloInicial.className = "cielo-bsas";
    const bsasInfoInicial = document.querySelector(".bsas-info");
    if (bsasInfoInicial) bsasInfoInicial.classList.add("activa");

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
                const textosCiudad = document.querySelectorAll(".info-ciudad");

                textosCiudad.forEach(texto => {
                    texto.classList.remove("activa");
                });
                if(paso === "bsas"){
                    cielo.className = "cielo-bsas";
                    document.querySelector(".bsas-info").classList.add("activa");
                }

                if(paso === "firmat"){
                    cielo.className = "cielo-firmat";
                    document.querySelector(".firmat-info").classList.add("activa");
                }

                if(paso === "junin"){
                    cielo.className = "cielo-junin";
                    document.querySelector(".junin-info").classList.add("activa");
                }

            }
        });
    }, opcionesE6);

    disparadoresE6.forEach(d => observadorE6.observe(d));

    // ==========================================
    // LÓGICA ESCENA 6A (Transición datos)
    // ==========================================
    const disparadoresE6a = document.querySelectorAll(".disparador-unificado-6a");
    const parrafos6a = document.querySelectorAll("[data-unificado-6a]");

    const observador6a = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                const paso = entrada.target.getAttribute("data-paso-6a");
                parrafos6a.forEach(p => {
                    if (p.getAttribute("data-unificado-6a") === paso) {
                        p.classList.add("activo-unificado");
                    } else {
                        p.classList.remove("activo-unificado");
                    }
                });
            }
        });
    }, { root: null, rootMargin: "-30% 0px -50% 0px", threshold: 0 });

    disparadoresE6a.forEach(d => observador6a.observe(d));

    // ==========================================
    // LÓGICA ESCENA 6C (Transición puente)
    // ==========================================
    const disparadoresE6c = document.querySelectorAll(".disparador-unificado-6c");
    const parrafos6c = document.querySelectorAll("[data-unificado-6c]");

    const observador6c = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                const paso = entrada.target.getAttribute("data-paso-6c");
                parrafos6c.forEach(p => {
                    if (p.getAttribute("data-unificado-6c") === paso) {
                        p.classList.add("activo-unificado");
                    } else {
                        p.classList.remove("activo-unificado");
                    }
                });
            }
        });
    }, { root: null, rootMargin: "-30% 0px -50% 0px", threshold: 0 });

    disparadoresE6c.forEach(d => observador6c.observe(d));


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
    const disparadoresMG = document.querySelectorAll(".disparador-mundo-graficos");
    const introMG = document.querySelector(".intro-graficos-mundo");
    const grillaMG = document.querySelector(".grilla-graficos-mundo");
    const conclusionMG = document.querySelector(".conclusion-graficos-mundo");

    const observadorMG = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                const paso = entrada.target.getAttribute("data-paso-mg");
                if (paso === "graficos") {
                    if (introMG) introMG.classList.add("activo-mg");
                    if (grillaMG) grillaMG.classList.add("activo-mg");
                }
                if (paso === "conclusion") {
                    if (conclusionMG) conclusionMG.classList.add("activo-mg");
                }
            }
        });
    }, { root: null, rootMargin: "-10% 0px -20% 0px", threshold: 0 });

    disparadoresMG.forEach(d => observadorMG.observe(d));

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