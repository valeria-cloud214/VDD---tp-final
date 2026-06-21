
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