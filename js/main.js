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
});
// ==========================================
    // LÓGICA ESCENA 4 (Reparada)
    // ==========================================
    const disparadoresE4 = document.querySelectorAll(".disparador-corte");
    const pasosCorte = document.querySelectorAll(".paso-corte");

    const opcionesE4 = {
        root: null,
        rootMargin: "-40% 0px -40% 0px", // Margen equilibrado para evitar saltos bruscos
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
    const grillaFinal = document.getElementById("grilla-final");
    const graficoFlourish = document.getElementById("grafico-flourish");
    const disparadoresE6 = document.querySelectorAll(".disparador-viaje");

    // Estado inicial: foto "inicio" de fondo y texto visible
    if (fondoViajeFinal) fondoViajeFinal.className = "fondo-pantalla-completa-viaje viaje-inicio";
    if (textoViaje) textoViaje.classList.add("activo-viaje");

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

                // La grilla se muestra en "grilla" y se desliza afuera en "grafico"
                if (grillaFinal) {
                    grillaFinal.classList.toggle("activo-grilla", paso === "grilla");
                    grillaFinal.classList.toggle("salida-grilla", paso === "grafico");
                }

                // El gráfico de Flourish solo se muestra en el paso "grafico"
                if (graficoFlourish) {
                    graficoFlourish.classList.toggle("activo-grafico", paso === "grafico");
                }

                // El fondo dinámico cambia de foto en los pasos "inicio" y "foto1"-"foto4"
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