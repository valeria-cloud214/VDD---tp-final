/* ==========================================================================
   DATOS — Escena mundial (ver js/escena-mundo.js)
   ==========================================================================
   Toda la información editable de la escena vive acá, desacoplada del
   layout: qué ciudades se muestran, en qué gráfico (Flourish), con qué
   observación y cuáles se destacan; y todos los textos narrativos, por
   acto. Cambiar una ciudad, un overlay o una frase es tocar sólo este
   archivo — nunca escena-mundo.js ni index.html.
   ========================================================================== */

// Una fila = 4 ciudades. Los "data-src" son los mismos 16 embeds de Flourish
// que ya traía el proyecto (12 gráficos únicos; la fila 4 repite los
// data-src de la fila 1 — ya venía así, no son visualizaciones nuevas).
// "destacado: true" marca las ciudades que se resaltan en el momento en que
// el texto dice "la tendencia era sorprendentemente parecida" (ver ACTO 3
// en escena-mundo.js).
const CIUDADES_MUNDO = [
    // FILA 1
    { nombre: "Buenos Aires",     pais: "Argentina",     src: "visualisation/29324397", overlay: "El punto de partida",                 destacado: true },
    { nombre: "Tokio",            pais: "Japón",         src: "visualisation/29324604", overlay: "▲ Tendencia creciente",               destacado: true },
    { nombre: "Nueva York",       pais: "EE. UU.",       src: "visualisation/29324591", overlay: "▲ Tendencia creciente",               destacado: true },
    { nombre: "Londres",          pais: "Reino Unido",   src: "visualisation/29324582", overlay: "Cambio acelerado",                    destacado: true },
    // FILA 2
    { nombre: "El Cairo",         pais: "Egipto",        src: "visualisation/29324438", overlay: "Mayor pérdida de estrellas",          destacado: false },
    { nombre: "Sídney",           pais: "Australia",     src: "visualisation/29324485", overlay: "≈ Se mantiene relativamente estable", destacado: false },
    { nombre: "Ciudad de México", pais: "México",        src: "visualisation/29480361", overlay: "▲ Tendencia creciente",               destacado: false },
    { nombre: "Santiago",         pais: "Chile",         src: "visualisation/29480465", overlay: "⬇ Recuperación leve",                 destacado: false },
    // FILA 3
    { nombre: "Mumbai",           pais: "India",         src: "visualisation/29480504", overlay: "Mayor pérdida de estrellas",          destacado: false },
    { nombre: "Shanghái",         pais: "China",         src: "visualisation/29480539", overlay: "Cambio acelerado",                    destacado: false },
    { nombre: "Berlín",           pais: "Alemania",      src: "visualisation/29480564", overlay: "≈ Se mantiene relativamente estable", destacado: false },
    { nombre: "Moscú",            pais: "Rusia",         src: "visualisation/29480590", overlay: "▲ Tendencia creciente",               destacado: false },
    // FILA 4 (repite los data-src de la fila 1 — mismos gráficos, no nuevos)
    { nombre: "Buenos Aires",     pais: "Argentina",     src: "visualisation/29324397", overlay: "El punto de partida",                 destacado: false },
    { nombre: "Tokio",            pais: "Japón",         src: "visualisation/29324604", overlay: "▲ Tendencia creciente",               destacado: false },
    { nombre: "Nueva York",       pais: "EE. UU.",       src: "visualisation/29324591", overlay: "▲ Tendencia creciente",               destacado: false },
    { nombre: "Londres",          pais: "Reino Unido",   src: "visualisation/29324582", overlay: "Cambio acelerado",                    destacado: false }
];

// Nombres que flotan en el ACTO 2, antes de que aparezca ningún gráfico.
// No tienen por qué coincidir uno a uno con CIUDADES_MUNDO: sólo tienen que
// transmitir que la búsqueda se expandió a todo el mundo.
const NOMBRES_MUNDO_ACTO2 = [
    "Buenos Aires", "Tokio", "Nueva York", "Londres", "El Cairo", "Sídney",
    "Ciudad de México", "Santiago", "Mumbai", "Shanghái", "Berlín", "Moscú"
];

// Textos por acto. Cada línea interna de un array es un renglón de texto
// dentro del mismo beat (aparecen juntas); cada elemento del array externo
// es un beat nuevo (un paso de scroll).
const NARRATIVA_MUNDO = {

    // ACTO 1 — cambio de escala: pantalla limpia, sólo texto.
    acto1: [
        ["Lo que descubrí en Argentina…", "no era una excepción."],
        ["Pensé que quizás sólo ocurría acá."],
        ["Pero necesitaba comprobarlo."],
        ["Así que amplié la búsqueda."]
    ],

    // ACTO 2 — el mundo empieza a aparecer (nombres flotando + estas frases)
    acto2: [
        ["No importaba el continente."],
        ["Las mismas preguntas podían hacerse en cualquier lugar."]
    ],

    // ACTO 3 — frases que acompañan, fila por fila, la construcción de la grilla
    grilla: [
        ["Pensé que encontraría historias completamente distintas."],
        ["Pero empezó a aparecer un patrón."],
        ["Ciudades diferentes.", "Idiomas distintos.", "Continentes distintos."],
        ["Y, sin embargo…", "la tendencia era sorprendentemente parecida."]
    ],

    // Cierre de la escena: conecta directamente con la escena final
    // existente ("No importa el continente. No importa el idioma...").
    cierre: [
        ["No eran ciudades aisladas."],
        ["Era el mismo patrón…", "repitiéndose una y otra vez."],
        ["Sin importar el país.", "Sin importar el idioma.", "Sin importar el continente."]
    ]
};

// Pequeña guía que acompaña la primera aparición de la grilla — no es una
// leyenda técnica, un solo bloque chico que se desvanece solo cuando ya
// están las 4 filas completas.
const GUIA_GRILLA_MUNDO = {
    titulo: "¿Qué estás viendo?",
    texto: "Cada gráfico representa una ciudad distinta. El eje horizontal muestra los años; el vertical, la magnitud límite observada. Cuanto menor es ese valor, menos estrellas pueden verse desde ese lugar."
};

// Título breve que ya traía el proyecto, ahora como dato en vez de texto
// fijo en el HTML.
const INTRO_GRILLA_MUNDO = "La evolución de la contaminación lumínica en ciudades del mundo entre 2006 y 2024.";
