document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // LÓGICA ESCENA 2
    // ==========================================
    const fondoJorge = document.getElementById("fondo-jorge");
    const disparadoresE2 = document.querySelectorAll(".disparador");
    const parrafos = document.querySelectorAll(".parrafo-historia");

    if (fondoJorge) fondoJorge.className = "fondo-dinamico foto1";

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
    }, { root: null, rootMargin: "-20% 0px -60% 0px", threshold: 0.1 });

    disparadoresE2.forEach(d => observadorE2.observe(d));


    // ==========================================
    // LÓGICA ESCENA 3
    // ==========================================
    const fondoViaje = document.getElementById("fondo-viaje");
    const disparadoresE3 = document.querySelectorAll(".disparador-rafaga");

    if (fondoViaje) fondoViaje.className = "fondo-dinamico e2-foto1";

    const observadorE3 = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                const paso = entrada.target.getAttribute("data-foto");
                fondoViaje.className = "fondo-dinamico";
                fondoViaje.classList.add(`e2-foto${paso}`);
            }
        });
    }, { root: null, rootMargin: "-5% 0px -45% 0px", threshold: 0 });

    disparadoresE3.forEach(d => observadorE3.observe(d));


    // ==========================================
    // LÓGICA ESCENA 4
    // ==========================================
    const disparadoresE4 = document.querySelectorAll(".disparador-corte");
    const pasosCorte = document.querySelectorAll(".paso-corte");

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
    }, { root: null, rootMargin: "-40% 0px -40% 0px", threshold: 0 });

    disparadoresE4.forEach(d => observadorE4.observe(d));


    // ==========================================
    // LÓGICA ESCENA 5
    // ==========================================
    const disparadoresE5 = document.querySelectorAll(".disparador-unificado");
    const parrafosUnificados = document.querySelectorAll(".parrafo-unificado");

    const observadorE5 = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                const pasoU = entrada.target.getAttribute("data-paso-u");
                parrafosUnificados.forEach(parrafo => {
                    if (parrafo.getAttribute("data-unificado") === pasoU) {
                        parrafo.classList.add("activo-unificado");
                    } else {
                        parrafo.classList.remove("activo-unificado");
                    }
                });
            }
        });
    }, { root: null, rootMargin: "-30% 0px -50% 0px", threshold: 0 });

    disparadoresE5.forEach(d => observadorE5.observe(d));


    // ==========================================
    // LÓGICA ESCENA 6 — Viaje por ciudades argentinas
    // ==========================================
    const fondoViajeFinal = document.getElementById("fondo-viaje-final");
    const textoViaje = document.querySelector(".texto-centrado-viaje");
    const grillaFinal = document.getElementById("grilla-final");
    const graficoFlourish = document.getElementById("grafico-flourish");
    const disparadoresE6 = document.querySelectorAll(".disparador-viaje");

    if (fondoViajeFinal) fondoViajeFinal.className = "fondo-pantalla-completa-viaje viaje-inicio";
    if (textoViaje) textoViaje.classList.add("activo-viaje");

    const observadorE6 = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                const paso = entrada.target.getAttribute("data-viaje");

                // — texto intro —
                if (textoViaje) {
                    textoViaje.classList.toggle("activo-viaje", paso === "inicio");
                }

                // — grilla y gráfico (por si los usás más adelante) —
                if (grillaFinal) {
                    grillaFinal.classList.toggle("activo-grilla", paso === "grilla");
                    grillaFinal.classList.toggle("salida-grilla", paso === "grafico");
                }
                if (graficoFlourish) {
                    graficoFlourish.classList.toggle("activo-grafico", paso === "grafico");
                }

                // — limpiar todos los textos de ciudad primero —
                const todosLosTextos = document.querySelectorAll(".info-ciudad");
                todosLosTextos.forEach(t => t.classList.remove("activa"));

                // — ciudades del viaje —
                const cieloEstrellas = document.getElementById("cielo-estrellas");

                if (paso === "bsas" && cieloEstrellas) {
                    cieloEstrellas.className = "cielo-bsas";
                    document.querySelector(".bsas-info").classList.add("activa");
                }
                if (paso === "firmat" && cieloEstrellas) {
                    cieloEstrellas.className = "cielo-firmat";
                    document.querySelector(".firmat-info").classList.add("activa");
                }
                if (paso === "junin" && cieloEstrellas) {
                    cieloEstrellas.className = "cielo-junin";
                    document.querySelector(".junin-info").classList.add("activa");
                }

                // — scatter plot —
                if (paso === "scatter-1") {
                    document.querySelector(".scatter-1-info").classList.add("activa");
                }
                if (paso === "scatter-2") {
                    document.querySelector(".scatter-2-info").classList.add("activa");
                }
                if (paso === "scatter-3") {
                    document.querySelector(".scatter-3-info").classList.add("activa");
                }
                if (paso === "scatter-4") {
                    document.querySelector(".scatter-4-info").classList.add("activa");
                }
            }
        });
    }, { root: null, rootMargin: "-30% 0px -50% 0px", threshold: 0 });

    disparadoresE6.forEach(d => observadorE6.observe(d));


    // ==========================================
    // LÓGICA ESCENA 6A — Slide de transición
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
    // LÓGICA ESCENA 7 (Pizarrón)
    // ==========================================
    const disparadoresPizarron = document.querySelectorAll(".disparador-pizarron");
    const textosPizarron = document.querySelectorAll(".texto-pizarron");

    const observadorPizarron = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                const paso = entrada.target.getAttribute("data-paso-p");
                textosPizarron.forEach(t => {
                    if (t.getAttribute("data-pizarron") === paso) {
                        t.classList.add("activo-pizarron");
                    } else {
                        t.classList.remove("activo-pizarron");
                    }
                });
            }
        });
    }, { root: null, rootMargin: "-30% 0px -50% 0px", threshold: 0 });

    disparadoresPizarron.forEach(d => observadorPizarron.observe(d));


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