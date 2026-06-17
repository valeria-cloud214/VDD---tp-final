// JavaScript Nativo para Control de Eventos de Scroll e Interacción
document.addEventListener("DOMContentLoaded", () => {
    
    // Generación dinámica de estrellas de fondo para Escena 1
    generateStars("sky-escena1", 120);
    generateStars("sky-cientifico", 60);

    // Inicialización del Observer para detectar los bloques de texto activos
    setupScrollObserver();

    // Evento scroll directo para transiciones continuas milimétricas (Escenas 2 y 3)
    window.addEventListener("scroll", handleSmoothScrollTransformations);
});

function generateStars(containerId, count) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    for (let i = 0; i < count; i++) {
        const star = document.createElement("div");
        star.classList.add("css-star");
        
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 4}s`;
        
        container.appendChild(star);
    }
}

function setupScrollObserver() {
    const steps = document.querySelectorAll(".step");
    
    const observerOptions = {
        root: null,
        rootMargin: "-40% 0px -40% 0px", // Trigger óptimo en el centro de la pantalla
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const stepType = target.getAttribute("data-step");
                const cityType = target.getAttribute("data-city");

                // Control de Escena 4: Zoom en Mapa de Argentina
                if (stepType === "mapa-2") {
                    document.getElementById("mapa-argentina-vector").style.transform = "scale(1.4) translate(-5%, 10%)";
                } else if (stepType === "mapa-1") {
                    document.getElementById("mapa-argentina-vector").style.transform = "scale(1) translate(0, 0)";
                }

                // Control de Escena 5: Cambios por ciudad (Tabs simulados por Scroll)
                if (cityType) {
                    updateCityScene(cityType);
                }

                // Control de Escena 7: Despliegue de cuadrícula global
                if (stepType === "global-2" || stepType === "global-3") {
                    document.getElementById("grid-global").classList.add("active");
                    document.getElementById("wrapper-slope").style.transform = "translateY(-20px) scale(0.95)";
                } else if (stepType === "global-1") {
                    document.getElementById("grid-global").classList.remove("active");
                    document.getElementById("wrapper-slope").style.transform = "translateY(0) scale(1)";
                }

                // Lazy loading básico de Iframes de Flourish cuando entran a escena
                const parentSection = target.closest("section");
                const iframe = parentSection.querySelector(".flourish-iframe-lazy");
                if (iframe && !iframe.src.includes("flo.uri.sh")) {
                    // Carga el link real guardado previamente en un data-attribute si existiese
                }
            }
        });
    }, observerOptions);

    steps.forEach(step => observer.observe(step));
}

function handleSmoothScrollTransformations() {
    // ---- ESCENA 2: Efecto de viaje y degradación de Orión ----
    const escena2 = document.getElementById("escena2");
    const skyViaje = document.getElementById("sky-viaje");
    const orionViaje = document.getElementById("orion-viaje");
    
    if (escena2) {
        const bounding = escena2.getBoundingClientRect();
        const sectionHeight = escena2.offsetHeight;
        
        // Calcular el progreso (0 a 1) de la sección con respecto a la visualización
        if (bounding.top <= 0 && bounding.top >= -sectionHeight) {
            const progress = Math.abs(bounding.top) / (sectionHeight - window.innerHeight);
            const clampedProgress = Math.min(Math.max(progress, 0), 1);
            
            // 1. Aclarar el cielo de negro puro a anaranjado contaminación
            skyViaje.style.backgroundColor = `rgb(${clampedProgress * 30}, ${clampedProgress * 22}, ${clampedProgress * 28})`;
            
            // 2. Aplicar blur y opacidad decreciente a Orión
            const blurVal = clampedProgress * 6; 
            const opacityVal = 1 - (clampedProgress * 0.6);
            orionViaje.style.filter = `blur(${blurVal}px)`;
            orionViaje.style.opacity = opacityVal;

            // 3. Simular movimiento de estrellas de fondo lateralmente
            skyViaje.style.backgroundPositionX = `${-clampedProgress * 80}px`;
        }
    }

    // ---- ESCENA 3: Simulación de Neblina Brillante (Bortle) ----
    const escena3 = document.getElementById("escena3");
    const glowCientifico = document.getElementById("glow-cientifico");
    const bortleLabel = document.getElementById("bortle-label");

    if (escena3) {
        const bounding3 = escena3.getBoundingClientRect();
        const sectionHeight3 = escena3.offsetHeight;

        if (bounding3.top <= 0 && bounding3.top >= -sectionHeight3) {
            const progress3 = Math.abs(bounding3.top) / (sectionHeight3 - window.innerHeight);
            const clampedProgress3 = Math.min(Math.max(progress3, 0), 1);

            // Intensificar gradiente radial de contaminación
            glowCientifico.style.background = `radial-gradient(circle at bottom center, rgba(230, 125, 45, ${clampedProgress3 * 0.45}) 0%, rgba(2,2,5,0) 70%)`;
            
            // Actualizar número de escala Bortle dinámicamente
            const currentBortle = Math.min(Math.floor(clampedProgress3 * 8) + 1, 9);
            bortleLabel.innerText = `Escala Bortle: ${currentBortle}`;
            
            if(currentBortle > 6) {
                bortleLabel.style.color = "#ff4545";
            } else {
                bortleLabel.style.color = "#fff";
            }
        }
    }
}

function updateCityScene(city) {
    const titleOverlay = document.getElementById("city-active-name");
    const container = document.getElementById("sky-comparativa");
    titleOverlay.innerText = city;

    // Modificar variables y cielos según la pestaña activa por scroll
    if (city === "caba") {
        container.style.backgroundColor = "#18141a";
        container.style.filter = "blur(2px)";
    } else if (city === "junin") {
        container.style.backgroundColor = "#06060c";
        container.style.filter = "blur(0.5px)";
    } else if (city === "ushuaia") {
        container.style.backgroundColor = "#0b0f19";
        container.style.filter = "blur(1.2px)"; // Efecto albedo simulado
    }
}
