document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // LÓGICA ESCENA 2 (Fotos con crossfade real, 6 fotos / 6 párrafos)
    // ==========================================
    // "transition: background-image" no anima en ningún navegador, así que
    // el corte entre fotos era siempre seco. Antes esto se resolvía con 2
    // capas que se cruzaban (una subía opacidad mientras la otra bajaba),
    // pero si esas dos transiciones no arrancaban en el MISMO frame exacto
    // (algo que el navegador no garantiza), la suma de opacidades caía por
    // debajo de 1 por un instante y se veía un flash negro del fondo del
    // contenedor.
    //
    // Ahora son 2 capas con roles distintos, no simétricos:
    // - "base": SIEMPRE a opacidad 1, sin transición. Muestra la foto
    //   actual. Es la que impide que se vea negro debajo, pase lo que pase.
    // - "saliente": muestra la foto ANTERIOR y se desvanece de 1 a 0,
    //   revelando la base de abajo. Si esta transición se traba o arranca
    //   tarde, lo único que pasa es que se ve la foto vieja un toque más -
    //   nunca un hueco negro.
    //
    // 6 fotos (se sacaron la 4 y la 7 de las 8 originales) y ahora cada
    // párrafo acompaña a una sola foto — mapeo 1 a 1, ya no hace falta
    // repartir un párrafo entre 2 pasos.
    const capaBase = document.getElementById("fondo-jorge-base");
    const capaSaliente = document.getElementById("fondo-jorge-saliente");
    const disparadoresE2 = document.querySelectorAll(".disparador");
    const parrafos = document.querySelectorAll(".parrafo-historia");

    if (capaBase) capaBase.classList.add("foto1");

    const opcionesE2 = {
        root: null,
        rootMargin: "-10% 0px -50% 0px", // más ajustado que antes, ritmo parecido al de la ráfaga de escena 3
        threshold: 0
    };

    const observadorE2 = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                const paso = Number(entrada.target.getAttribute("data-foto"));
                const claseFoto = `foto${paso}`;

                if (capaBase && capaSaliente && !capaBase.classList.contains(claseFoto)) {
                    // 1) la foto que se estaba viendo (la de la base, hasta
                    //    ahora) pasa a la capa saliente, de una, a opacidad 1
                    //    y sin transición — todavía se sigue viendo igual.
                    capaSaliente.style.transition = "none";
                    capaSaliente.className = `fondo-dinamico fondo-capa-saliente ${capaBase.className.replace(/fondo-dinamico|fondo-capa-base/g, "").trim()}`;
                    capaSaliente.style.opacity = "1";

                    // 2) la base se actualiza a la foto nueva instantáneamente.
                    //    Como la base no tiene transición, ese cambio no se
                    //    ve: lo que se sigue viendo es la capa saliente, que
                    //    todavía está tapándola por completo.
                    capaBase.className = `fondo-dinamico fondo-capa-base ${claseFoto}`;

                    // Fuerza un reflow para que el navegador registre el
                    // estado de arriba antes de animar.
                    void capaSaliente.offsetWidth;

                    // 3) recién ahora la capa saliente se desvanece,
                    //    revelando la base (ya con la foto nueva) de abajo.
                    capaSaliente.style.transition = "";
                    capaSaliente.style.opacity = "0";
                }

                const parrafoActivo = String(paso);
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
    // El telón se levanta al llegar a la línea de tiempo de Córdoba (que
    // ahora se insertó ANTES de la escena mundial) — de ahí en más, el
    // fondo oscuro compartido entre las dos escenas alcanza para que el
    // paso de una a otra se sienta continuo, sin hacer falta un segundo
    // telón.
    const escena8 = document.getElementById("escena-cordoba-linea");

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

    // Cuando aparece la escena mundial, el telón se levanta. threshold es
    // relativo al alto TOTAL del elemento observado, no al viewport: con
    // 0.1 esto funcionaba mientras la escena medía unos pocos cientos de
    // vh, pero la parte 1 de la escena mundial (ver escena-mundo-intro-pin
    // en styles.css) pinnea varios cientos de vh — ningún scroll llega a
    // mostrar el 10% de ESE alto de una, así que el observer nunca
    // disparaba y el telón se quedaba negro para siempre. threshold: 0
    // dispara apenas asoma el primer píxel, que es lo que en realidad
    // queremos acá.
    const observadorLevantaTelon = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                telon.classList.remove("telon-activo");
            }
        });
    }, { root: null, rootMargin: "0px", threshold: 0 });

    if (escena8) observadorLevantaTelon.observe(escena8);

    // La vieja "escena 8 transición" (frase suelta) y "escena 8" (grilla
    // mundial ya armada) se reemplazaron por la escena mundial de 3 partes
    // (intro pinneada → grilla en scroll normal → cierre pinneado) — ver
    // js/escena-mundo.js (arma el DOM y la lógica de scroll a partir de
    // js/datos-mundo.js) y css/styles.css (".escena-mundo-intro-pin",
    // ".escena-mundo-grilla", ".escena-mundo-cierre-pin").

}); // ← cierre del DOMContentLoaded


    //----------------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------------

// 1. DIMENSIONES DEL GRÁFICO (Asegúrate de que use la mitad de la pantalla)
// "bottom" apenas más grande que el alto real de los nombres de ciudad
// rotados -45° (para que no queden cortados) y "top" ajustado para que
// quede prácticamente el mismo aire arriba que abajo: el SVG ya ocupa el
// 100% de la altura de la pantalla, así que lo que centra el contenido
// verticalmente es que estos dos márgenes sean parecidos entre sí.
const margin = { top: 95, right: 70, bottom: 110, left: 70 };

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

  // 1. EJE X "ciudades": escala de bandas, una por ciudad (el CSV ya viene
  // ordenado de menor a mayor población). Este es el eje que se ve en las
  // barras y en el dot plot — la evolución nunca lo toca hasta la quinta
  // etapa, cuando cambia de significado (ver ejeXIndustrial más abajo).
  const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(function(d) { return d.Ciudad; }))
      .padding(0.2);

  const ejeXCiudades = svg.append("g")
      .attr("class", "eje-grafico eje-x-ciudades")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));
  ejeXCiudades.selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
  // Nombre de la variable: al lado de la etiqueta de CABA (la última banda,
  // la más a la derecha), a la misma altura aproximada que esa etiqueta
  // rotada — no centrada más abajo, para no pedirle más margen inferior
  // del que ya necesitan los nombres de ciudad. Se desvanece junto con el
  // resto de este eje cuando cambia de significado (quinta etapa).
  ejeXCiudades.append("text")
      .attr("x", width + 4)
      .attr("y", 20)
      .attr("fill", "#94a3b8")
      .attr("text-anchor", "start")
      .style("font-size", "0.75rem")
      .text("Ciudades");

  // 2. EJE Y: escala lineal de población. No cambia NUNCA a lo largo de
  // toda la transición (barras → dot plot → scatter): es la referencia que
  // el lector no pierde en ningún momento.
  const y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.Poblacion; })])
      .range([height, 0]);

  const ejeY = svg.append("g")
      .attr("class", "eje-grafico eje-y")
      .call(d3.axisLeft(y));
  // Nombre de la variable, esquina superior izquierda: nunca se desvanece,
  // porque el eje Y (población) tampoco lo hace en ningún momento.
  ejeY.append("text")
      .attr("x", -40)
      .attr("y", -18)
      .attr("fill", "#94a3b8")
      .attr("text-anchor", "start")
      .style("font-size", "0.8rem")
      .text("Población");

  // EJE X "industrialización": nace oculto, superpuesto exactamente al eje
  // de ciudades. En la quinta etapa uno se apaga y el otro se enciende, así
  // el lector entiende primero que cambió el SIGNIFICADO del eje X, antes
  // de que ningún punto se mueva un solo píxel (ver eje-x-oculta /
  // eje-x-industrial en el switch de abajo).
  const xIndustrial = d3.scaleLinear()
      .domain([0, 10])
      .range([0, width]);

  const ejeXIndustrial = svg.append("g")
      .attr("class", "eje-grafico eje-x-industrial")
      .attr("transform", `translate(0, ${height})`)
      .style("opacity", 0)
      .call(d3.axisBottom(xIndustrial).ticks(6));
  ejeXIndustrial.append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "#94a3b8")
      .attr("text-anchor", "middle")
      .style("font-size", "0.8rem")
      .text("Índice de industrialización (aprox. iluminación artificial)");

  function mostrarEjeXCiudades(visible) { ejeXCiudades.style("opacity", visible ? 1 : 0); }
  function mostrarEjeXIndustrial(visible) { ejeXIndustrial.style("opacity", visible ? 1 : 0); }

  // Definición del brillo de los puntos: una lucecita cálida, no un círculo
  // plano — mismo lenguaje de color que faroles, ventanas y resplandores en
  // el resto del proyecto (ver gradiente-halo-farol en escena-luz.js).
  const defs = svg.append("defs");
  const gradGlow = defs.append("radialGradient")
      .attr("id", "grad-punto-industrial")
      .attr("cx", "50%").attr("cy", "50%").attr("r", "50%");
  gradGlow.append("stop").attr("offset", "0%").attr("stop-color", "#fff6e5").attr("stop-opacity", 0.95);
  gradGlow.append("stop").attr("offset", "40%").attr("stop-color", "#ffcf8a").attr("stop-opacity", 0.55);
  gradGlow.append("stop").attr("offset", "100%").attr("stop-color", "#ffb45e").attr("stop-opacity", 0);

  // 3. DIBUJAR LAS BARRAS (Nacen desmarcadas)
  const barras = svg.selectAll("rect")
      .data(data)
      .join("rect")
        .attr("x", function(d) { return x(d.Ciudad); })
        .attr("y", function(d) { return y(+d.Poblacion); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(+d.Poblacion); })
        .style("fill", "#38bdf8") // mismo azul de acento que las tarjetas de texto (--acento, zona-datos)
        .style("opacity", 0.5)
        .style("transition", "opacity 1.4s ease"); // Transición lenta: nada aparece/desaparece de golpe

    // Posición del punto mientras es parte del dot plot: exactamente la
    // misma altura que marca su población en el eje Y (el mismo punto en el
    // que termina la barra), sobre el centro de su banda en el eje X de
    // ciudades. Por eso el punto "nace sobre la barra" y funciona como dot
    // plot sin necesitar ningún ajuste.
    function posPoblacion(d) {
      return { cx: x(d.Ciudad) + x.bandwidth() / 2, cy: y(+d.Poblacion) };
    }

    // Posición final del punto dentro del scatter: el eje Y sigue siendo
    // población (no cambia), sólo el eje X pasa a ser el índice industrial.
    function posScatter(d) {
      return { cx: xIndustrial(+d.Indice_Industrial_Nocturno), cy: y(+d.Poblacion) };
    }

    // CREACIÓN DE LOS PUNTOS: cada uno es un grupo con un halo (glow suave)
    // y un núcleo brillante, no un círculo rojo plano. Se mueven animando
    // su "transform" (translate), así que basta con reescribir ese atributo
    // para que la transición de posición (CSS, ver styles.css) la anime sola.
    const puntos = svg.selectAll(".punto-industrial")
        .data(data)
        .join("g")
        .attr("class", "punto-industrial")
        .attr("transform", function(d) { const p = posPoblacion(d); return `translate(${p.cx}, ${p.cy})`; })
        .style("opacity", 0); // <--- NACEN COMPLETAMENTE OCULTOS

    puntos.append("circle").attr("class", "punto-halo").attr("r", 14).style("fill", "url(#grad-punto-industrial)");
    puntos.append("circle").attr("class", "punto-nucleo").attr("r", 2.5).style("fill", "#fff8ec");

    // Mueve todos los puntos a la posición que calcule posFn (con transición
    // suave, ver CSS) y ajusta su opacidad.
    function moverPuntos(posFn, opacidad) {
      puntos
        .attr("transform", function(d) { const p = posFn(d); return `translate(${p.cx}, ${p.cy})`; })
        .style("opacity", opacidad);
    }

  // --- FUNCIONES DE ESTADO, una por etapa de la narrativa ---

  // Primera etapa: sólo el conjunto de barras, atenuado, sin resaltar nada.
  function estadoPoblacionInicial() {
    mostrarEjeXCiudades(true); mostrarEjeXIndustrial(false);
    barras.style("opacity", 0.15);
    moverPuntos(posPoblacion, 0);
  }

  // Primera etapa (continuación): resalta una única ciudad entre las barras.
  function resaltarBarra(nombreCiudad) {
    mostrarEjeXCiudades(true); mostrarEjeXIndustrial(false);
    barras.style("opacity", function(d) { return d.Ciudad === nombreCiudad ? 1.0 : 0.1; });
    moverPuntos(posPoblacion, 0);
  }

  // Segunda etapa: sobre cada barra nace, muy de a poco, una lucecita
  // cálida — en el mismo lugar exacto que después ocupará como dot plot.
  // Las barras siguen intactas, sólo los puntos ganan opacidad.
  function nacePuntos(opacidadPuntos) {
    mostrarEjeXCiudades(true); mostrarEjeXIndustrial(false);
    barras.style("opacity", 1.0);
    moverPuntos(posPoblacion, opacidadPuntos);
  }

  // Tercera y cuarta etapa: dot plot. Único cambio respecto a la anterior:
  // las barras desaparecen. Los ejes (ciudades en X, población en Y) siguen
  // exactamente iguales, así el punto nunca queda sin referencia — y se
  // mantiene así durante los tres pasos de texto de la cuarta etapa.
  function estadoDotPlot() {
    mostrarEjeXCiudades(true); mostrarEjeXIndustrial(false);
    barras.style("opacity", 0);
    moverPuntos(posPoblacion, 1.0);
  }

  // Quinta etapa, paso 1: se apagan los nombres de ciudad. El eje Y no se
  // toca. Los puntos todavía no se mueven.
  function ocultarEjeCiudades() {
    mostrarEjeXCiudades(false); mostrarEjeXIndustrial(false);
    barras.style("opacity", 0);
    moverPuntos(posPoblacion, 1.0);
  }

  // Quinta etapa, paso 2: nace el nuevo eje (industrialización). Los puntos
  // siguen quietos en su posición de dot plot — primero cambia el
  // significado del eje, recién después cambian los datos.
  function mostrarEjeIndustrial() {
    mostrarEjeXCiudades(false); mostrarEjeXIndustrial(true);
    barras.style("opacity", 0);
    moverPuntos(posPoblacion, 1.0);
  }

  // Sexta etapa: transformación — con el nuevo eje ya instalado, cada punto
  // interpola lentamente su posición horizontal hacia el scatter. El eje Y
  // (población) sigue siendo el mismo de siempre.
  function transformarEnScatter() {
    mostrarEjeXCiudades(false); mostrarEjeXIndustrial(true);
    barras.style("opacity", 0);
    moverPuntos(posScatter, 1.0);
  }

  // Séptima etapa: ya no hay barras ni eje de ciudades — sólo se resalta o
  // se muestra el conjunto completo de puntos dentro del scatter ya formado.
  function resaltarPunto(nombreCiudad) {
    mostrarEjeXCiudades(false); mostrarEjeXIndustrial(true);
    barras.style("opacity", 0);
    puntos
      .attr("transform", function(d) { const p = posScatter(d); return `translate(${p.cx}, ${p.cy})`; })
      .style("opacity", function(d) { return d.Ciudad === nombreCiudad ? 1.0 : 0.12; });
  }

  function mostrarTodosPuntos() {
    mostrarEjeXCiudades(false); mostrarEjeXIndustrial(true);
    barras.style("opacity", 0);
    moverPuntos(posScatter, 1.0);
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

        // B) Leemos en qué fase de la narrativa estamos y, si aplica, qué
        // ciudad tiene asignada esta tarjeta.
        const fase = step.getAttribute('data-fase');
        const ciudadActiva = step.getAttribute('data-ciudad');

        // C) Ejecutamos la animación correspondiente en el gráfico
        switch (fase) {
          case "poblacion":
            estadoPoblacionInicial();
            break;
          case "poblacion-ciudad":
            resaltarBarra(ciudadActiva);
            break;
          case "nace-punto":
            nacePuntos(parseFloat(step.getAttribute('data-opacidad-puntos')) || 1);
            break;
          case "dot-plot":
            estadoDotPlot();
            break;
          case "eje-x-oculta":
            ocultarEjeCiudades();
            break;
          case "eje-x-industrial":
            mostrarEjeIndustrial();
            break;
          case "transformacion":
            transformarEnScatter();
            break;
          case "scatter":
          case "scatter-todas":
            mostrarTodosPuntos();
            break;
          case "scatter-ciudad":
            resaltarPunto(ciudadActiva);
            break;
        }
      }
    });
  });

}).catch(function(error) {
  console.error("Error al cargar el archivo:", error);
});