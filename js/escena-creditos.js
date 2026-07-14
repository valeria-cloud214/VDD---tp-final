/* ==========================================================================
   CRÉDITOS — revelado simple al hacer scroll
   ==========================================================================
   Nada de pin, nada de GSAP: cada bloque (título, autoras, fuentes, cierre)
   nace apagado y se enciende con un fade + translateY suave apenas entra en
   pantalla. Mismo patrón liviano que ya usa la grilla mundial
   (.mundo-narrativa-fila) para revelados que no necesitan estar atados al
   scroll frame a frame.
   ========================================================================== */

   document.addEventListener("DOMContentLoaded", () => {

    const bloques = document.querySelectorAll("[data-creditos-bloque]");
    if (!bloques.length) return; // La escena no está en esta página.

    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add("creditos-visible");
                observador.unobserve(entrada.target); // una vez visible, se queda así
            }
        });
    }, { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.15 });

    bloques.forEach(b => observador.observe(b));

    // ======================================================================
    // SOLAPE Y VELO — mismo mecanismo que .ruta-en-escena/.ruta-revelada en
    // escena-ruta.js: dos umbrales, dos propósitos.
    //   - creditos-en-escena (rect.top<=30, más laxo): hace visible la
    //     sección recién cuando ya está a punto de acoplarse arriba de
    //     todo, para que no se le vea asomar por abajo mientras el usuario
    //     todavía está leyendo el mensaje final de la escena de cierre.
    //   - creditos-revelado (rect.top<=4, más ajustado): recién ahí se
    //     disuelve el velo negro, así el corte nunca se ve crudo.
    // ======================================================================
    (function velarEntrada() {
        const seccion = document.getElementById("escena-creditos");
        if (!seccion) return;

        function actualizar() {
            const rect = seccion.getBoundingClientRect();
            seccion.classList.toggle("creditos-en-escena", rect.top <= 30);
            seccion.classList.toggle("creditos-revelado", rect.top <= 4);
        }

        window.addEventListener("scroll", actualizar, { passive: true });
        window.addEventListener("resize", actualizar);
        actualizar();
    })();

});