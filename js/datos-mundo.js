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
    { nombre: "Buenos Aires",     pais: "Brasil",        src: "visualisation/29654754", overlay: "Caída pronunciada",                 destacado: true },
    { nombre: "Nueva York",       pais: "EE. UU.",       src: "visualisation/29654815", overlay: "Caída pronunciada",               destacado: true },
    { nombre: "El Cairo",         pais: "India",         src: "visualisation/29656503", overlay: "Caída moderada",          destacado: true },
    { nombre: "Sídney",           pais: "Sudáfrica",     src: "visualisation/29654807", overlay: "Caída pronunciada", destacado: true },
    { nombre: "Mumbai",           pais: "China",         src: "visualisation/29654772", overlay: "Mayor pérdida de estrellas",          destacado: true },
    { nombre: "Tokio",            pais: "Portugal",         src: "visualisation/29657433", overlay: "▲ Tendencia creciente",               destacado: true },
    { nombre: "Londres",          pais: "Puerto Rico",   src: "visualisation/29657515", overlay: "Cambio acelerado",                    destacado: true },
    { nombre: "Ciudad de México", pais: "Indonesia",     src: "visualisation/29480606", overlay: "Caída pronunciada",               destacado: true },

    // FILA 2
    { nombre: "Londres",          pais: "Italia",        src: "visualisation/29654800", overlay: "Caída moderada",                    destacado: true },

    { nombre: "Tokio",            pais: "Grecia",        src: "visualisation/29654782", overlay: "Caída moderada",               destacado: true },

    { nombre: "Santiago",         pais: "Japón",         src: "visualisation/29656486", overlay: "Caída leve",                 destacado: true },
    // FILA 3
    { nombre: "Shanghái",         pais: "Filipinas",         src: "visualisation/29657393", overlay: "Cambio acelerado",                    destacado: true },
    { nombre: "Berlín",           pais: "Canada",      src: "visualisation/29657456", overlay: "≈ Se mantiene relativamente estable", destacado: true },
    { nombre: "Moscú",            pais: "Chile",         src: "visualisation/29656496", overlay: "▲ Tendencia creciente",               destacado: true },
    // FILA 4 (repite los data-src de la fila 1 — mismos gráficos, no nuevos)
    { nombre: "Buenos Aires",     pais: "Croacia",     src: "visualisation/29657461", overlay: "El punto de partida",                 destacado: true },
    { nombre: "Nueva York",       pais: "Macedonia",       src: "visualisation/29657496", overlay: "▲ Tendencia creciente",               destacado: true }
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
        [""],
        [""],
        [""],
        [""]
    ],

    // Cierre de la escena: conecta directamente con la escena final
    // existente ("No importa el continente. No importa el idioma...").
    cierre: [
        ["No eran casos aislados."],
        ["Era el mismo patrón…", "repitiéndose en cada rincón del planeta."],
        ["Sin importar el país.", "Sin importar el idioma.", "Sin importar el continente."]
    ]
};

// Pequeña guía que acompaña la primera aparición de la grilla — no es una
// leyenda técnica, un solo bloque chico que se desvanece solo cuando ya
// están las 4 filas completas.
const GUIA_GRILLA_MUNDO = {
    titulo: "¿Qué estás viendo?",
    texto: " En cada gráfico el eje vertical muestra la magnitud límite: cuanto más bajo el número, menos estrellas podés ver desde ese lugar."
};

// Título breve que ya traía el proyecto, ahora como dato en vez de texto
// fijo en el HTML.
const INTRO_GRILLA_MUNDO = "";
