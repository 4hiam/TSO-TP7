document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initReplacementSimulator();
    initBeladySimulator();
    initTlbSimulator();
    initWorkingSetSimulator();
    initPageFaultSimulator();
    renderExercises();
    loadProgress();
    setupListeners();
});

// --- ESTADO GLOBAL ---
const state = {
    answers: {},
    studentInfo: {
        name: '',
        lu: ''
    }
};

// --- BANCO DE EJERCICIOS EVALUATIVOS (15 EJERCICIOS) ---
const exercisesData = [
    {
        id: 'ej1_fifo_fallos',
        type: 'select',
        title: 'Ejercicio 1: Reemplazo FIFO con 4 Marcos Vacíos',
        labRef: { id: 'rep-simulator', name: 'Laboratorio 1: Algoritmos de Reemplazo', badge: '🔄 Lab 1: Reemplazo FIFO' },
        labHint: 'En el Laboratorio 1, selecciona "1. Traza Canónica", elige el algoritmo "FIFO", configura 4 marcos y avanza paso a paso para contabilizar los fallos de página.',
        question: 'Dada la cadena canónica de referencias de páginas: 0, 1, 7, 2, 3, 2, 7, 1, 3 con 4 marcos de página inicialmente vacíos. ¿Cuántos fallos de página se presentan bajo el algoritmo FIFO?',
        biblio: 'Diapositivas U9 pág. 25-27 | Silberschatz, Galvin & Gagne, Fundamentos de SO (7ma Ed., 2006) Cap. 9.4',
        options: [
            { value: '5_fallos', label: '5 fallos de página' },
            { value: '7_fallos', label: '7 fallos de página' },
            { value: '9_fallos', label: '9 fallos de página' },
            { value: '4_fallos', label: '4 fallos de página' }
        ]
    },
    {
        id: 'ej2_nfu_envejecimiento',
        type: 'radio',
        title: 'Ejercicio 2: NFU con registros de envejecimiento',
        labRef: { id: 'rep-simulator', name: 'Laboratorio 1: Algoritmos de Reemplazo', badge: '🔄 Lab 1: Envejecimiento (Aging)' },
        labHint: 'En el Laboratorio 1, selecciona "2. Diapositivas U9" (secuencia A B C D A B E...) con 4 marcos y el algoritmo "Envejecimiento (Aging, variante de NFU)" para observar la evolución de los registros de 8 bits y comprobar la víctima en la referencia E.',
        question: 'Considere 4 marcos de página (Marco 0 a Marco 3) cuyos registros de envejecimiento de 8 bits se inicializan en 00000000. Al finalizar cada referencia, se desplazan una posición hacia la derecha los cuatro registros y se incorpora por la izquierda el valor del bit R de cada marco. En cada instancia, la página referenciada tiene R=1 y las restantes R=0. Después de actualizar los registros, los bits R se reinician a 0. Siguiendo la secuencia de las diapositivas oficiales (A, B, C, D, A, B, E) y utilizando como criterio de desempate seleccionar el marco de menor índice: ¿qué página se reemplaza al producirse el primer fallo con la memoria completa (referencia a la página E)? En este práctico se denominará algoritmo de envejecimiento a la variante de NFU basada en registros desplazables de 8 bits.',
        biblio: 'Diapositivas U9 pág. 38-43 | Tanenbaum & Bos, Sistemas Operativos Modernos (4ta Ed., 2015) Cap. 3.4',
        options: [
            { value: 'pagina_c_marco_2', label: 'Página C (Marco 2)' },
            { value: 'pagina_d_marco_3', label: 'Página D (Marco 3)' },
            { value: 'pagina_a_marco_0', label: 'Página A (Marco 0)' },
            { value: 'pagina_b_marco_1', label: 'Página B (Marco 1)' }
        ]
    },
    {
        id: 'ej3_nru_reemplazo',
        type: 'radio',
        title: 'Ejercicio 3: Algoritmo NRU y Bits R/M',
        labRef: { id: 'rep-simulator', name: 'Laboratorio 1: Algoritmos de Reemplazo', badge: '🔄 Lab 1: NRU (Clases R/M)' },
        labHint: 'En el Laboratorio 1 con el algoritmo "NRU (Clases R/M)", observa cómo se categorizan las páginas en Clases 0 a 3 según sus bits (R, M) y cómo se prioriza la clase no vacía de menor número.',
        question: 'Dado el estado actual de 4 páginas en memoria: P0 (R=1, M=0), P1 (R=0, M=0), P2 (R=0, M=0) y P3 (R=1, M=1). ¿Cuál es la clase no vacía de menor prioridad numérica y qué páginas pertenecen a ella?',
        biblio: 'Diapositivas U9 pág. 34-37 | Tanenbaum & Bos, Sistemas Operativos Modernos (4ta Ed., 2015) Cap. 3.4',
        options: [
            { value: 'clase_0_p1_p2', label: 'Clase 0: P1 y P2. Cualquiera de ellas puede ser seleccionada, según el criterio de desempate implementado.' },
            { value: 'clase_1_p0_p3', label: 'Clase 1: P0 y P3.' },
            { value: 'clase_2_p0', label: 'Clase 2: P0 exclusivamente.' },
            { value: 'clase_3_p3', label: 'Clase 3: P3 exclusivamente.' }
        ]
    },
    {
        id: 'ej4_optimo_reemplazo',
        type: 'select',
        title: 'Ejercicio 4: Algoritmo Óptimo de Reemplazo (OPT)',
        labRef: { id: 'rep-simulator', name: 'Laboratorio 1: Algoritmos de Reemplazo', badge: '🔄 Lab 1: Algoritmo Óptimo' },
        labHint: 'En el Laboratorio 1, selecciona "1. Traza Canónica", algoritmo "Óptimo" con 4 marcos y avanza hasta el paso 5 (referencia 3 con memoria llena): inspecciona qué página no se volverá a usar en el futuro más lejano.',
        question: 'Dada la secuencia canónica de referencias [0, 1, 7, 2, 3, 2, 7, 1, 3] sobre 4 marcos físicos inicialmente vacíos. Tras cargar las 4 primeras páginas en memoria ({0, 1, 7, 2}), al producirse la referencia a la página 3 (fallo con memoria completa), luego de la referencia actual a 3, la secuencia futura es 2, 7, 1, 3. ¿Qué página selecciona el algoritmo Óptimo (OPT) para ser desalojada?',
        biblio: 'Diapositivas U9 pág. 30-31 | Silberschatz, Galvin & Gagne, Fundamentos de SO (7ma Ed., 2006) Cap. 9.4',
        options: [
            { value: 'pagina_0', label: 'Página 0' },
            { value: 'pagina_2', label: 'Página 2' },
            { value: 'pagina_7', label: 'Página 7' },
            { value: 'pagina_1', label: 'Página 1' }
        ]
    },
    {
        id: 'ej5_lru_reemplazo',
        type: 'select',
        title: 'Ejercicio 5: Reemplazo LRU según Última Referencia',
        labRef: { id: 'rep-simulator', name: 'Laboratorio 1: Algoritmos de Reemplazo', badge: '🔄 Lab 1: Reemplazo LRU' },
        labHint: 'En el Laboratorio 1, prueba el algoritmo "LRU" para constatar cómo la política desaloja la página cuyo tiempo de último acceso sea el más antiguo (menor marca temporal).',
        question: 'Dado el estado de 4 páginas en memoria con tiempos de último acceso: P0 (último_acceso=280), P1 (último_acceso=265), P2 (último_acceso=270) y P3 (último_acceso=285). Suponga que los tiempos aumentan a medida que avanza la ejecución, por lo que el menor valor corresponde al instante más antiguo. ¿Qué página reemplazará el algoritmo LRU?',
        biblio: 'Diapositivas U9 pág. 32-33 | Silberschatz, Galvin & Gagne, Fundamentos de SO (7ma Ed., 2006) Cap. 9.4',
        options: [
            { value: 'pagina_1', label: 'Página 1' },
            { value: 'pagina_2', label: 'Página 2' },
            { value: 'pagina_0', label: 'Página 0' },
            { value: 'pagina_3', label: 'Página 3' }
        ]
    },
    {
        id: 'ej6_reloj_reemplazo',
        type: 'radio',
        title: 'Ejercicio 6: Algoritmo del Reloj (Segunda Oportunidad)',
        labRef: { id: 'rep-simulator', name: 'Laboratorio 1: Algoritmos de Reemplazo', badge: '🔄 Lab 1: Algoritmo del Reloj' },
        labHint: 'En el Laboratorio 1, ejecuta el algoritmo "Reloj" y observa en la matriz cómo la aguja circular avanza concediendo segundas oportunidades (R=0) hasta encontrar el primer marco con R=0.',
        question: 'Ordenando 4 páginas cargadas según su llegada en el anillo circular: P3 (R=1), P0 (R=1), P2 (R=0), P1 (R=0). El anillo se recorre en el orden P3 → P0 → P2 → P1 → P3. Si el puntero del reloj inicia apuntando a P3 y se produce un fallo de página, ¿qué página es seleccionada para desalojo?',
        biblio: 'Diapositivas U9 pág. 28-29 | Tanenbaum & Bos, Sistemas Operativos Modernos (4ta Ed., 2015) Cap. 3.4',
        options: [
            { value: 'pagina_2', label: 'Página 2' },
            { value: 'pagina_3', label: 'Página 3' },
            { value: 'pagina_0', label: 'Página 0' },
            { value: 'pagina_1', label: 'Página 1' }
        ]
    },
    {
        id: 'ej7_reemplazo_local_global',
        type: 'switch',
        title: 'Ejercicio 7: Reemplazo Local vs Global',
        labRef: { id: 'rep-simulator', name: 'Laboratorio 1: Algoritmos de Reemplazo', badge: '🔄 Lab 1: Reemplazo de Páginas' },
        labHint: 'Relaciona las políticas de reemplazo con el alcance multiprogramado: la asignación local aísla los marcos del proceso, mientras que la global permite desalojar marcos de cualquier proceso del sistema.',
        question: 'En un sistema multiprogramado con múltiples procesos concurrentes que compiten por marcos de memoria física, ¿cuál es la diferencia fundamental entre reemplazo local y reemplazo global?',
        biblio: 'Diapositivas U9 pág. 56 | Silberschatz, Galvin & Gagne, Fundamentos de SO (7ma Ed., 2006) Cap. 9.5',
        options: [
            { value: 'local_mismo_proceso_global_todos', label: 'Local: las víctimas se eligen únicamente entre marcos del mismo proceso; Global: entre marcos de cualquier proceso' },
            { value: 'local_usa_disco_global_usa_ram', label: 'Local: utiliza almacenamiento secundario swap; Global: utiliza exclusivamente RAM' },
            { value: 'local_no_permite_fallos_global_si', label: 'Local: no tolera fallos de página; Global: tolera múltiples fallos concurrentes' },
            { value: 'local_es_estatico_global_dinamico', label: 'Local: asignación estática invariable; Global: asignación exclusivamente fija' }
        ]
    },
    {
        id: 'ej8_paginacion_hex',
        type: 'select',
        title: 'Ejercicio 8: Paginación y Traducción Completa a Dirección Física (0x065C)',
        labRef: { id: 'mmu-panel', name: 'Laboratorio 3: Panel de Traducción MMU', badge: '🗺️ Lab 3: Traducción MMU' },
        labHint: 'En el Laboratorio 3, consulta el panel de traducción MMU: con páginas de 512 bytes, la dirección lógica 0x065C (1628) se descompone en página 3 y desplazamiento 92. Al ubicarse la página 3 en el marco 10, la dirección física es 10 × 512 + 92 = 5212 (0x145C).',
        question: 'En una arquitectura con páginas de 512 bytes (donde p = ⌊dir / tam⌋ y d = dir mod tam), dada la dirección lógica 0x065C (1628 en decimal) y considerando que la página 3 se encuentra cargada en el marco físico 10 de la memoria RAM. Determine el número de página (p), el desplazamiento (d) y la dirección física resultante.',
        biblio: 'Silberschatz, Galvin & Gagne, Fundamentos de SO (7ma Ed., 2006) Cap. 8.4',
        options: [
            { value: 'p3_d92_dir5212', label: 'Página 3, desplazamiento 92, dirección física 5212 (0x145C)' },
            { value: 'p6_d92_dir3164', label: 'Página 6, desplazamiento 92, dirección física 3164 (0x0C5C)' },
            { value: 'p3_d156_dir5276', label: 'Página 3, desplazamiento 156, dirección física 5276 (0x149C)' },
            { value: 'p10_d92_dir5120', label: 'Página 10, desplazamiento 92, dirección física 5120 (0x1400)' }
        ]
    },
    {
        id: 'ej9_anomalia_belady',
        type: 'select',
        title: 'Ejercicio 9: Demostración de la Anomalía de Belady',
        labRef: { id: 'belady-simulator', name: 'Laboratorio 2: Anomalía de Belady', badge: '💥 Lab 2: Anomalía de Belady' },
        labHint: 'En el Laboratorio 2, observa la comparación simultánea en pantalla dividida de la traza de Belady: con 3 marcos se obtienen 9 fallos, mientras que con 4 marcos de RAM se obtienen 10 fallos de página.',
        question: 'Para la cadena de Belady (0 1 2 3 0 1 4 0 1 2 3 4) bajo FIFO, con 3 marcos se obtienen 9 fallos de página. ¿Cuántos fallos se obtienen al aumentar a 4 marcos?',
        biblio: 'Diapositivas U9 pág. 45 | Silberschatz, Galvin & Gagne, Fundamentos de SO (7ma Ed., 2006) Cap. 9.4 / Tanenbaum & Bos (4ta Ed.) Cap. 3.4',
        options: [
            { value: '10_fallos', label: '10 fallos de página' },
            { value: '8_fallos', label: '8 fallos de página' },
            { value: '9_fallos', label: '9 fallos de página' },
            { value: '6_fallos', label: '6 fallos de página' }
        ]
    },
    {
        id: 'ej10_tlb_eat',
        type: 'select',
        title: 'Ejercicio 10: Tiempo de Acceso Efectivo (EAT)',
        labRef: { id: 'tlb-simulator', name: 'Laboratorio 3: Calculadora de EAT con TLB', badge: '⚡ Lab 3: Calculadora de EAT' },
        labHint: 'En el Laboratorio 3, ajusta los deslizadores a α = 90%, t_tlb = 20 ns y t_ram = 100 ns para verificar el paso a paso del cálculo y constatar el EAT resultante de 130.00 ns.',
        question: 'Si la tasa de aciertos del TLB es del 90% (α = 0.9), el tiempo de acceso al TLB es de 20 ns y el acceso a la RAM es de 100 ns bajo los supuestos del modelo de 1 nivel sin fallos. ¿Cuál es el EAT?',
        biblio: 'Diapositivas U9 pág. 17-21 | Silberschatz, Galvin & Gagne, Fundamentos de SO (7ma Ed., 2006) Cap. 8.4',
        options: [
            { value: '130_ns', label: '130.00 ns' },
            { value: '120_ns', label: '120.00 ns' },
            { value: '150_ns', label: '150.00 ns' },
            { value: '220_ns', label: '220.00 ns' }
        ]
    },
    {
        id: 'ej11_working_set',
        type: 'radio',
        title: 'Ejercicio 11: Modelo de Conjunto de Trabajo (Working-Set)',
        labRef: { id: 'ws-simulator', name: 'Laboratorio 4: Conjunto de Trabajo', badge: '🌊 Lab 4: Modelo Working Set' },
        labHint: 'En el Laboratorio 4, fija la ventana Δ = 10 y presiona "Evaluar Estado del Sistema": observa el conjunto de trabajo obtenido para el proceso P1 a partir de sus 10 referencias más recientes.',
        question: 'Dada la traza de accesos recientes [2, 6, 1, 5, 7, 7, 7, 1, 6, 2] con ventana Δ = 10 (Diapositivas U9 pág. 54). ¿Cuál es el conjunto de páginas distintas que forma W(t, Δ)?',
        biblio: 'Diapositivas U9 pág. 50-54 | Silberschatz, Galvin & Gagne, Fundamentos de SO (7ma Ed., 2006) Cap. 9.6',
        options: [
            { value: 'ws_1_2_5_6_7', label: '{1, 2, 5, 6, 7}' },
            { value: 'ws_1_2_7', label: '{1, 2, 7}' },
            { value: 'ws_todas_las_paginas', label: '{2, 6, 1, 5, 7, 7, 7, 1, 6, 2}' },
            { value: 'ws_vacio', label: 'Conjunto vacío ∅' }
        ]
    },
    {
        id: 'ej12_hiperpaginacion_causa',
        type: 'switch',
        title: 'Ejercicio 12: Causa Primaria de la Hiperpaginación (Thrashing)',
        labRef: { id: 'ws-simulator', name: 'Laboratorio 4: Conjunto de Trabajo', badge: '🌊 Lab 4: Hiperpaginación' },
        labHint: 'En el Laboratorio 4, reduce los marcos de RAM disponibles (ej. a 8 o 6 marcos) y observa la alerta de hiperpaginación disparada cuando la demanda total agregada D excede los marcos físicos disponibles m.',
        question: '¿En qué condición el sistema entra en un estado de hiperpaginación, caracterizado por una degradación severa del rendimiento?',
        biblio: 'Diapositivas U9 pág. 50 | Silberschatz, Galvin & Gagne, Fundamentos de SO (7ma Ed., 2006) Cap. 9.6 / Tanenbaum & Bos (4ta Ed.) Cap. 3.4',
        options: [
            { value: 'suma_working_sets_mayor_ram', label: 'D = Σ WSSᵢ > m (la demanda agregada de los conjuntos de trabajo excede la cantidad total m de marcos físicos disponibles)' },
            { value: 'cola_procesos_cpu_vacia', label: 'La cola de procesos listos de la CPU queda completamente vacía' },
            { value: 'disco_swap_lleno_al_cien', label: 'El espacio de intercambio (swap) en disco secundario se satura al 100%' },
            { value: 'demasiados_hilos_en_mutex', label: 'Se produce una espera activa prolongada en candados mutex concurrentes' }
        ]
    },
    {
        id: 'ej13_fallo_pagina_dirty_bit',
        type: 'select',
        title: 'Ejercicio 13: Tratamiento de Fallo de Página con Víctima Modificada (M=1)',
        labRef: { id: 'pagefault-simulator', name: 'Laboratorio 5: Tratamiento de Fallo de Página', badge: '🛠️ Lab 5: Fallo de Página' },
        labHint: 'En el Laboratorio 5, ejecuta el escenario 3 (Víctima Modificada M=1) y observa el paso a paso de escritura obligatoria en swap antes de cargar la nueva página requerida.',
        question: 'Un proceso referencia una página cuya entrada en la tabla posee bit de presencia P=0. Si no hay marcos físicos libres y la página seleccionada como víctima tiene su bit de modificación activo (M=1 o dirty bit), ¿qué secuencia de operaciones debe ejecutar obligatoriamente el sistema operativo antes de reanudar el proceso?',
        biblio: 'Silberschatz, Galvin & Gagne, Fundamentos de SO (7ma Ed., 2006) Cap. 9.2 y 9.4 / Tanenbaum & Bos (4ta Ed.) Cap. 3.4',
        options: [
            { value: 'escribir_swap_cargar_nueva_actualizar_reiniciar', label: 'Escribir la víctima en disco swap, cargar la nueva página en el marco liberado, actualizar la tabla (P=1, M=0) y reiniciar la instrucción.' },
            { value: 'descartar_victima_sin_escribir_y_cargar', label: 'Descartar la víctima en RAM sin escribir en disco, cargar la nueva página y continuar en la siguiente instrucción.' },
            { value: 'abortar_proceso_por_violacion_de_acceso', label: 'Finalizar el proceso inmediatamente emitiendo un segmentation fault por hallarse el bit P en 0.' },
            { value: 'esperar_activamente_a_que_el_tlb_se_blanquee', label: 'Detener la CPU en espera activa hasta que el TLB reinicie automáticamente todos los bits M.' }
        ]
    },
    {
        id: 'ej14_pff_frecuencia_fallos',
        type: 'radio',
        title: 'Ejercicio 14: Control de Asignación por Frecuencia de Fallos de Página (PFF)',
        labRef: { id: 'ws-simulator', name: 'Laboratorio 4: Working Set y PFF', badge: '🌊 Lab 4: Frecuencia PFF' },
        labHint: 'Revisa en el Laboratorio 4 la estrategia adaptativa de PFF: si la tasa de fallos supera el límite superior, el proceso necesita más memoria física para contener su localidad activa.',
        question: 'Bajo la estrategia de control por Frecuencia de Fallos de Página (Page-Fault Frequency, PFF), si la tasa de fallos de un proceso supera el límite superior (upper threshold) establecido por el sistema operativo, ¿qué acción correctiva debe adoptar el sistema?',
        biblio: 'Silberschatz, Galvin & Gagne, Fundamentos de SO (7ma Ed., 2006) Cap. 9.6 / Diapositivas U9 pág. 55',
        options: [
            { value: 'asignar_mas_marcos_o_suspender', label: 'Asignarle marcos adicionales de memoria física si existen marcos libres; de lo contrario, suspender un proceso para reducir el grado de multiprogramación.' },
            { value: 'quitar_marcos_inmediatamente', label: 'Retirarle marcos físicos de inmediato por considerar que el proceso presenta anomalía de Belady.' },
            { value: 'forzar_reemplazo_fifo_estricto', label: 'Modificar la política de reemplazo del proceso exclusivamente a FIFO sin variar sus marcos.' },
            { value: 'reiniciar_la_cpu_por_kernel_panic', label: 'Disparar un kernel panic y reiniciar el equipo para limpiar la memoria física.' }
        ]
    },
    {
        id: 'ej15_tamano_pagina_fragmentacion',
        type: 'select',
        title: 'Ejercicio 15: Tamaño de Página y Fragmentación Interna',
        labRef: { id: 'mmu-panel', name: 'Laboratorio 3: Paginación y MMU', badge: '🗺️ Lab 3: MMU y Paginación' },
        labHint: 'Calcule primero la cantidad de páginas aplicando redondeo hacia arriba. Luego reste el tamaño del proceso a la capacidad total asignada.',
        question: 'Un proceso requiere un espacio de memoria de 10.500 bytes y el sistema operativo utiliza una arquitectura de paginación con páginas de 4.096 bytes (4 KiB). ¿Cuántas páginas deben asignarse al proceso y cuántos bytes se desperdician por fragmentación interna en la última página?',
        biblio: 'Silberschatz, Galvin & Gagne, Fundamentos de SO (7ma Ed., 2006) Cap. 8.4 y 9.8',
        options: [
            { value: 'tres_paginas_1788_bytes', label: '3 páginas asignadas (12.288 bytes totales) y 1.788 bytes de fragmentación interna.' },
            { value: 'dos_paginas_2308_bytes', label: '2 páginas asignadas (8.192 bytes totales) y 2.308 bytes de fragmentación interna.' },
            { value: 'tres_paginas_500_bytes', label: '3 páginas asignadas (12.288 bytes totales) y 500 bytes de fragmentación interna.' },
            { value: 'cuatro_paginas_5884_bytes', label: '4 páginas asignadas (16.384 bytes totales) y 5.884 bytes de fragmentación interna.' }
        ]
    }
];

// --- 1. TEMA CLARO / OSCURO ---
function initTheme() {
    const savedTheme = localStorage.getItem('tso_theme_tp7') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        toggleBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('tso_theme_tp7', next);
            toggleBtn.textContent = next === 'dark' ? '☀️' : '🌙';
        });
    }
}

// --- 2. SIMULADOR 1: ALGORITMOS DE REEMPLAZO DE PÁGINAS ---
let repTrace = [0, 1, 7, 2, 3, 2, 7, 1, 3];
let repFramesCount = 4;
let repCurrentStep = 0;
let repHistory = []; // { ref, frames: [], isFault: bool, victim: int|null, clockHand: int, bitsR: [], bitsM: [] }
let repHits = 0;
let repFaults = 0;

// Estado persistente del Reloj, NRU, marcas de llegada de FIFO y registros de Envejecimiento (Aging)
let repClockHand = 0;
let repBitsR = [];
let repBitsM = [];
let repArrivalTime = [];
let repAgingRegisters = [];

function initReplacementSimulator() {
    loadTraceTP();

    document.getElementById('btn-trace-tp').addEventListener('click', () => {
        setActiveTraceBtn('btn-trace-tp');
        loadTraceTP();
    });
    document.getElementById('btn-trace-diapo').addEventListener('click', () => {
        setActiveTraceBtn('btn-trace-diapo');
        loadTraceDiapo();
    });
    document.getElementById('btn-trace-belady').addEventListener('click', () => {
        setActiveTraceBtn('btn-trace-belady');
        loadTraceBelady();
    });

    document.getElementById('select-rep-algo').addEventListener('change', () => resetRepSimulation());
    document.getElementById('input-num-frames').addEventListener('change', (e) => {
        repFramesCount = parseInt(e.target.value) || 4;
        resetRepSimulation();
    });

    document.getElementById('btn-rep-step').addEventListener('click', stepRepSimulation);
    document.getElementById('btn-rep-all').addEventListener('click', runAllRepSimulation);
    document.getElementById('btn-rep-reset').addEventListener('click', resetRepSimulation);
}

function setActiveTraceBtn(id) {
    ['btn-trace-tp', 'btn-trace-diapo', 'btn-trace-belady'].forEach(btnId => {
        const el = document.getElementById(btnId);
        if (el) {
            el.className = (btnId === id) ? 'btn-primary text-xs active' : 'btn-secondary text-xs';
        }
    });
}

function loadTraceTP() {
    repTrace = [0, 1, 7, 2, 3, 2, 7, 1, 3];
    document.getElementById('input-num-frames').value = 4;
    repFramesCount = 4;
    resetRepSimulation();
    logRep("📋 Traza canónica cargada: [0, 1, 7, 2, 3, 2, 7, 1, 3] con 4 marcos.");
}

function loadTraceDiapo() {
    repTrace = ['A', 'B', 'C', 'D', 'A', 'B', 'E', 'A', 'B', 'C', 'D', 'E'];
    document.getElementById('input-num-frames').value = 4;
    repFramesCount = 4;
    resetRepSimulation();
    logRep("🎓 Secuencia de Diapositivas U9 cargada: [A, B, C, D, A, B, E, A, B, C, D, E] con 4 marcos.");
}

function loadTraceBelady() {
    repTrace = [0, 1, 2, 3, 0, 1, 4, 0, 1, 2, 3, 4];
    document.getElementById('input-num-frames').value = 3;
    repFramesCount = 3;
    resetRepSimulation();
    logRep("💥 Secuencia de Belady cargada: [0, 1, 2, 3, 0, 1, 4, 0, 1, 2, 3, 4].");
}

function resetRepSimulation() {
    repCurrentStep = 0;
    repHits = 0;
    repFaults = 0;
    repHistory = [];
    repClockHand = 0;
    repBitsR = Array(repFramesCount).fill(0);
    repBitsM = Array(repFramesCount).fill(0);
    repArrivalTime = Array(repFramesCount).fill(-1);
    repAgingRegisters = Array(repFramesCount).fill(0);

    renderMatrixDisplay();
    updateRepBadges();
    const stBadge = document.getElementById('badge-rep-status');
    if (stBadge) {
        stBadge.textContent = 'Estado: Reiniciado';
        stBadge.className = 'badge info';
    }
    logRep("🔄 Simulación reiniciada. Marcos físicos vacíos, bits R/M en 0, puntero del reloj en marco 0.");
}

// Determina pedagógicamente si una referencia simula una operación de escritura (M=1)
function isWriteOperation(ref, stepIdx) {
    if (typeof ref === 'number') {
        // En trazas numéricas: referencias a páginas impares o múltiplos simulan escrituras
        return ref % 2 !== 0;
    } else if (typeof ref === 'string') {
        // En trazas alfabéticas: páginas 'B' y 'D' simulan escrituras
        return ref === 'B' || ref === 'D';
    }
    return false;
}

function stepRepSimulation() {
    if (repCurrentStep >= repTrace.length) {
        logRep("ℹ️ Fin de la cadena de referencias. Pulsa 'Reiniciar' para otra prueba.");
        return;
    }

    const algo = document.getElementById('select-rep-algo').value;
    const ref = repTrace[repCurrentStep];

    // Interrupción periódica del reloj de hardware del SO para NRU:
    // Cada 4 pasos se limpian los bits R para modelar la pérdida de vigencia reciente
    if (algo === 'nru' && repCurrentStep > 0 && repCurrentStep % 4 === 0) {
        for (let i = 0; i < repFramesCount; i++) {
            repBitsR[i] = 0;
        }
        logRep(`⏰ [Paso ${repCurrentStep + 1} - NRU] Interrupción de reloj del SO: se blanquean a 0 todos los bits R en memoria.`);
    }

    // Obtener estado anterior de marcos
    const prevFrames = repCurrentStep > 0 ? [...repHistory[repCurrentStep - 1].frames] : Array(repFramesCount).fill(null);

    let isFault = false;
    let newFrames = [...prevFrames];
    let victim = null;
    const writeOp = isWriteOperation(ref, repCurrentStep);

    if (newFrames.includes(ref)) {
        // HIT (Acierto en RAM)
        repHits++;
        const hitIdx = newFrames.indexOf(ref);
        repBitsR[hitIdx] = 1;
        if (writeOp) {
            repBitsM[hitIdx] = 1;
        }
        logRep(`🟢 [Paso ${repCurrentStep + 1}] Ref ${ref} -> HIT (Acierto en Marco ${hitIdx}). Bit R=1${writeOp ? ', Bit M=1 (escritura)' : ''}.`);
    } else {
        // PAGE FAULT (Fallo de página)
        isFault = true;
        repFaults++;

        // ¿Hay marcos vacíos disponibles?
        const emptyIdx = newFrames.indexOf(null);
        if (emptyIdx !== -1) {
            newFrames[emptyIdx] = ref;
            repBitsR[emptyIdx] = 1;
            repBitsM[emptyIdx] = writeOp ? 1 : 0;
            repArrivalTime[emptyIdx] = repCurrentStep;
            repAgingRegisters[emptyIdx] = 0;
            logRep(`🔴 [Paso ${repCurrentStep + 1}] Ref ${ref} -> FALLO DE PÁGINA (Carga en Marco vacío ${emptyIdx}). R=1, M=${repBitsM[emptyIdx]}.`);
        } else {
            // Memoria completa: invocar política de desalojo
            const vicIdx = chooseVictim(algo, repCurrentStep, prevFrames);
            victim = prevFrames[vicIdx];
            newFrames[vicIdx] = ref;
            repBitsR[vicIdx] = 1;
            repBitsM[vicIdx] = writeOp ? 1 : 0;
            repArrivalTime[vicIdx] = repCurrentStep;
            repAgingRegisters[vicIdx] = 0;
            logRep(`🔴 [Paso ${repCurrentStep + 1}] [${algo.toUpperCase()}] Ref ${ref} -> FALLO DE PÁGINA. Expulsa ${victim} del Marco ${vicIdx}. R=1, M=${repBitsM[vicIdx]}.`);
        }
    }

    // Actualización de registros de envejecimiento (Aging) al finalizar la referencia
    if (algo === 'aging') {
        for (let i = 0; i < repFramesCount; i++) {
            repAgingRegisters[i] = (repAgingRegisters[i] >> 1) & 0x7F;
            if (repBitsR[i] === 1) {
                repAgingRegisters[i] |= 0x80;
            }
            repBitsR[i] = 0; // Se limpia el bit R tras transferirse al registro de 8 bits
        }
    }

    repHistory.push({
        ref: ref,
        frames: [...newFrames],
        isFault: isFault,
        victim: victim,
        clockHand: repClockHand,
        bitsR: [...repBitsR],
        bitsM: [...repBitsM],
        agingRegisters: [...repAgingRegisters],
        arrivalTimes: [...repArrivalTime]
    });

    repCurrentStep++;
    renderMatrixDisplay();
    updateRepBadges();
}

function chooseVictim(algo, currentStepIdx, frames) {
    if (algo === 'fifo') {
        // Encontrar cuál de los marcos tiene el menor tiempo de llegada (First-In)
        let oldestTime = Infinity;
        let oldestIdx = 0;
        for (let i = 0; i < repFramesCount; i++) {
            if (repArrivalTime[i] < oldestTime) {
                oldestTime = repArrivalTime[i];
                oldestIdx = i;
            }
        }
        return oldestIdx;
    } else if (algo === 'lru') {
        // Encontrar cuál de las páginas en marcos no se referencia desde hace más tiempo
        let leastRecentTime = Infinity;
        let lruIdx = 0;
        frames.forEach((page, fIdx) => {
            for (let s = currentStepIdx - 1; s >= 0; s--) {
                if (repTrace[s] === page) {
                    if (s < leastRecentTime) {
                        leastRecentTime = s;
                        lruIdx = fIdx;
                    }
                    break;
                }
            }
        });
        return lruIdx;
    } else if (algo === 'opt') {
        // Mirar hacia el futuro cuál se usará más tarde (o nunca)
        let farthestUse = -1;
        let optIdx = 0;
        frames.forEach((page, fIdx) => {
            let nextUse = Infinity;
            for (let s = currentStepIdx + 1; s < repTrace.length; s++) {
                if (repTrace[s] === page) {
                    nextUse = s;
                    break;
                }
            }
            if (nextUse > farthestUse) {
                farthestUse = nextUse;
                optIdx = fIdx;
            }
        });
        return optIdx;
    } else if (algo === 'clock') {
        // Algoritmo del Reloj (Segunda Oportunidad):
        // Puntero circular persistente repClockHand.
        // Si R == 1: se concede 2da oportunidad, R se pone en 0, puntero avanza.
        // Si R == 0: se desaloja ese marco, puntero avanza al siguiente.
        while (true) {
            const ptr = repClockHand;
            if (repBitsR[ptr] === 1) {
                repBitsR[ptr] = 0;
                logRep(`   🕒 [Reloj] Marco ${ptr} (Pág ${frames[ptr]}) tenía R=1 -> Segunda oportunidad concedida (R=0). Aguja avanza.`);
                repClockHand = (repClockHand + 1) % repFramesCount;
            } else {
                // R == 0 -> Víctima encontrada
                const victimIdx = ptr;
                repClockHand = (repClockHand + 1) % repFramesCount;
                logRep(`   🕒 [Reloj] Marco ${victimIdx} (Pág ${frames[victimIdx]}) tiene R=0 -> Víctima seleccionada. Aguja queda en marco ${repClockHand}.`);
                return victimIdx;
            }
        }
    } else if (algo === 'nru') {
        // Algoritmo NRU (Not Recently Used) por Clases:
        // Clase 0: R=0, M=0
        // Clase 1: R=0, M=1
        // Clase 2: R=1, M=0
        // Clase 3: R=1, M=1
        // Selecciona una víctima de la clase no vacía de menor número (desempate por menor índice de marco).
        const classes = { 0: [], 1: [], 2: [], 3: [] };
        for (let i = 0; i < repFramesCount; i++) {
            const r = repBitsR[i];
            const m = repBitsM[i];
            const c = (r * 2) + m;
            classes[c].push(i);
        }

        for (let c = 0; c <= 3; c++) {
            if (classes[c].length > 0) {
                const vicIdx = classes[c][0]; // Menor índice de marco
                logRep(`   📊 [NRU] Clasificación actual: Clase 0: [${classes[0]}], Clase 1: [${classes[1]}], Clase 2: [${classes[2]}], Clase 3: [${classes[3]}]. Víctima elegida en Clase ${c}: Marco ${vicIdx} (Pág ${frames[vicIdx]}).`);
                return vicIdx;
            }
        }
        return 0;
    } else if (algo === 'aging') {
        // Algoritmo de Envejecimiento (Aging, variante de NFU):
        // Selecciona el marco cuyo registro de 8 bits tiene el menor valor numérico.
        // En caso de empate, se desempata por el menor índice de marco.
        let minVal = Infinity;
        let minIdx = 0;
        for (let i = 0; i < repFramesCount; i++) {
            if (repAgingRegisters[i] < minVal) {
                minVal = repAgingRegisters[i];
                minIdx = i;
            }
        }
        logRep(`   ⏳ [Aging] Registros de 8 bits actuales: ${repAgingRegisters.map((reg, idx) => `M${idx}: ${reg.toString(2).padStart(8, '0')} (${reg})`).join(', ')}. Víctima seleccionada: Marco ${minIdx} (Pág ${frames[minIdx]}).`);
        return minIdx;
    } else {
        return 0;
    }
}

function runAllRepSimulation() {
    while (repCurrentStep < repTrace.length) {
        stepRepSimulation();
    }
}

function renderMatrixDisplay() {
    const container = document.getElementById('matrix-container-display');
    if (!container) return;

    if (repHistory.length === 0) {
        container.innerHTML = '<div class="text-xs text-gray-400 py-4 text-center">Pulsa "Siguiente Referencia" o "Ejecutar Completo" para ver la matriz de marcos.</div>';
        return;
    }

    const algo = document.getElementById('select-rep-algo').value;

    let tableHtml = '<table class="matrix-table">';
    // Fila 1: Cadena de Referencias
    tableHtml += '<thead><tr><th>Referencia</th>';
    repHistory.forEach((h) => {
        tableHtml += `<th class="matrix-cell-ref">${h.ref}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';

    // Filas para cada Marco
    for (let f = 0; f < repFramesCount; f++) {
        tableHtml += `<tr><th>Marco ${f}</th>`;
        repHistory.forEach((h) => {
            const page = h.frames[f];
            let extra = '';
            if (algo === 'clock') {
                const r = h.bitsR[f] !== undefined ? h.bitsR[f] : 0;
                const isHand = h.clockHand === f ? ' 🕒' : '';
                extra = `<div class="text-[10px] text-gray-400">R=${r}${isHand}</div>`;
            } else if (algo === 'nru') {
                const r = h.bitsR[f] !== undefined ? h.bitsR[f] : 0;
                const m = h.bitsM[f] !== undefined ? h.bitsM[f] : 0;
                const cl = (r * 2) + m;
                extra = `<div class="text-[10px] text-gray-400">R=${r},M=${m} (C${cl})</div>`;
            } else if (algo === 'aging') {
                const reg = h.agingRegisters && h.agingRegisters[f] !== undefined ? h.agingRegisters[f] : 0;
                const binStr = reg.toString(2).padStart(8, '0');
                extra = `<div class="text-[9px] text-gray-400 font-mono tracking-tighter">${binStr} (${reg})</div>`;
            }
            tableHtml += `<td class="matrix-cell-page">${page !== null ? page : '-'}${extra}</td>`;
        });
        tableHtml += '</tr>';
    }

    // Fila de Acierto / Fallo
    tableHtml += '<tr><th>Resultado</th>';
    repHistory.forEach((h) => {
        if (h.isFault) {
            tableHtml += '<td class="matrix-cell-fault">FALLO</td>';
        } else {
            tableHtml += '<td class="matrix-cell-hit">HIT</td>';
        }
    });
    tableHtml += '</tr></tbody></table>';

    container.innerHTML = tableHtml;
    document.getElementById('rep-step-disp').textContent = `${Math.min(repCurrentStep + 1, repTrace.length)}/${repTrace.length}`;
}

function updateRepBadges() {
    const total = repHits + repFaults;
    const rate = total > 0 ? Math.round((repFaults / total) * 100) : 0;
    document.getElementById('badge-rep-hits').textContent = `Aciertos (Hits): ${repHits}`;
    document.getElementById('badge-rep-faults').textContent = `Fallos de Página: ${repFaults}`;
    document.getElementById('badge-rep-rate').textContent = `Tasa de Fallo: ${rate}%`;

    const stBadge = document.getElementById('badge-rep-status');
    if (stBadge) {
        if (repCurrentStep === 0) {
            stBadge.textContent = 'Estado: Listo';
            stBadge.className = 'badge info';
        } else if (repCurrentStep < repTrace.length) {
            stBadge.textContent = `Estado: En ejecución (${repCurrentStep}/${repTrace.length})`;
            stBadge.className = 'badge warning';
        } else {
            stBadge.textContent = 'Estado: Secuencia completada';
            stBadge.className = 'badge success';
        }
    }
}

function logRep(msg) {
    const box = document.getElementById('rep-log');
    if (box) {
        const time = new Date().toLocaleTimeString();
        box.innerHTML = `<div>[${time}] ${msg}</div>` + box.innerHTML;
    }
}

// --- 3. SIMULADOR 2: ANOMALÍA DE BELADY ---
function initBeladySimulator() {
    const beladyTrace = [0, 1, 2, 3, 0, 1, 4, 0, 1, 2, 3, 4];
    renderBeladyMatrix('belady-matrix-3m', beladyTrace, 3);
    renderBeladyMatrix('belady-matrix-4m', beladyTrace, 4);
}

function renderBeladyMatrix(containerId, trace, numFrames) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let frames = [];
    let faults = 0;
    let history = [];

    trace.forEach(ref => {
        let isFault = false;
        if (!frames.includes(ref)) {
            isFault = true;
            faults++;
            if (frames.length < numFrames) {
                frames.push(ref);
            } else {
                frames.shift(); // FIFO: desaloja el más antiguo
                frames.push(ref);
            }
        }
        history.push({ ref, frames: [...frames], isFault });
    });

    let html = '<table class="matrix-table text-[11px]">';
    html += '<thead><tr><th>Ref</th>';
    history.forEach(h => html += `<th class="matrix-cell-ref">${h.ref}</th>`);
    html += '</tr></thead><tbody>';

    for (let f = 0; f < numFrames; f++) {
        html += `<tr><th>M${f}</th>`;
        history.forEach(h => {
            const p = h.frames[f] !== undefined ? h.frames[f] : '-';
            html += `<td class="matrix-cell-page">${p}</td>`;
        });
        html += '</tr>';
    }

    html += '<tr><th>Res</th>';
    history.forEach(h => {
        html += h.isFault ? '<td class="matrix-cell-fault">F</td>' : '<td class="matrix-cell-hit">H</td>';
    });
    html += '</tr></tbody></table>';

    container.innerHTML = html;

    if (containerId === 'belady-matrix-3m') {
        const badge3 = document.getElementById('badge-belady-3m');
        if (badge3) badge3.textContent = `${faults} Fallos`;
    } else if (containerId === 'belady-matrix-4m') {
        const badge4 = document.getElementById('badge-belady-4m');
        if (badge4) badge4.textContent = `${faults} Fallos (¡ANOMALÍA!)`;
    }
}

// --- 4. CALCULADORA DE TIEMPO DE ACCESO EFECTIVO CON TLB Y TRADUCCIÓN MMU ---
function initTlbSimulator() {
    const sAlpha = document.getElementById('slider-alpha');
    const sTtlb = document.getElementById('slider-t-tlb');
    const sTram = document.getElementById('slider-t-ram');

    const updateEAT = () => {
        const alpha = parseInt(sAlpha.value) / 100;
        const t_tlb = parseFloat(sTtlb.value);
        const t_ram = parseFloat(sTram.value);

        document.getElementById('lbl-alpha').textContent = `${Math.round(alpha * 100)}%`;
        document.getElementById('lbl-t-tlb').textContent = `${t_tlb} ns`;
        document.getElementById('lbl-t-ram').textContent = `${t_ram} ns`;

        const hitTime = t_tlb + t_ram;
        const missTime = t_tlb + (2 * t_ram);
        const eat = (alpha * hitTime) + ((1 - alpha) * missTime);

        document.getElementById('eat-calc-step').textContent = 
            `EAT = ${alpha.toFixed(2)} × (${hitTime.toFixed(0)} ns) + ${(1 - alpha).toFixed(2)} × (${missTime.toFixed(0)} ns)`;
        document.getElementById('eat-final-val').textContent = `${eat.toFixed(2)} ns`;

        const sinTlb = 2 * t_ram;
        const speedup = ((sinTlb - eat) / sinTlb) * 100;
        const speedupEl = document.getElementById('eat-speedup');
        if (speedupEl) {
            speedupEl.textContent = `Reducción del tiempo de acceso: ${speedup.toFixed(1)}% respecto del acceso sin TLB`;
        }
        const sinTlbDescEl = document.getElementById('eat-sin-tlb-desc');
        if (sinTlbDescEl) {
            sinTlbDescEl.textContent = `Traducción mediante tabla de páginas en RAM, sin TLB: dos accesos a memoria (${sinTlb.toFixed(0)} ns).`;
        }
    };

    sAlpha.addEventListener('input', updateEAT);
    sTtlb.addEventListener('input', updateEAT);
    sTram.addEventListener('input', updateEAT);
    updateEAT();

    // Calculadora MMU de Traducción de Dirección Lógica a Física
    const inMmuLog = document.getElementById('input-mmu-log-addr');
    const selMmuSize = document.getElementById('select-mmu-page-size');
    const inMmuFrame = document.getElementById('input-mmu-frame-num');
    const outMmuSteps = document.getElementById('mmu-trans-calc-steps');

    const updateMmuTranslation = () => {
        if (!inMmuLog || !selMmuSize || !inMmuFrame || !outMmuSteps) return;

        const raw = inMmuLog.value.trim();
        let logAddr = 0;
        if (raw.toLowerCase().startsWith('0x')) {
            logAddr = parseInt(raw, 16);
        } else {
            logAddr = parseInt(raw, 10);
        }
        if (isNaN(logAddr) || logAddr < 0) logAddr = 0;

        const pageSize = parseInt(selMmuSize.value, 10) || 512;
        const frameNum = parseInt(inMmuFrame.value, 10) || 0;

        const pageNum = Math.floor(logAddr / pageSize);
        const offset = logAddr % pageSize;
        const physAddr = (frameNum * pageSize) + offset;
        const offsetBits = Math.round(Math.log2(pageSize));

        outMmuSteps.innerHTML = `
            <div><strong>1. Dirección Lógica:</strong> ${logAddr} (decimal) = <span class="text-purple-600 dark:text-purple-400 font-bold">0x${logAddr.toString(16).toUpperCase()}</span></div>
            <div><strong>2. Descomposición por MMU:</strong></div>
            <div class="pl-3 text-[11px] text-gray-600 dark:text-gray-400">
                • <em>Número de Página (p):</em> ⌊${logAddr} / ${pageSize}⌋ = <span class="font-bold text-blue-600 dark:text-blue-400">${pageNum}</span> (bits superiores de dirección virtual)<br>
                • <em>Desplazamiento (d):</em> ${logAddr} mod ${pageSize} = <span class="font-bold text-amber-600 dark:text-amber-400">${offset}</span> (decimal) = <span class="font-bold font-mono">0x${offset.toString(16).toUpperCase()}</span> (${offsetBits} bits de offset)
            </div>
            <div><strong>3. Búsqueda en Tabla de Páginas / TLB:</strong> Página <span class="font-bold text-blue-600 dark:text-blue-400">${pageNum}</span> ➔ Marco físico <span class="font-bold text-emerald-600 dark:text-emerald-400">${frameNum}</span> (con bit <em>P=1</em>)</div>
            <div><strong>4. Cálculo de Dirección Física:</strong></div>
            <div class="pl-3 text-[11px] text-gray-600 dark:text-gray-400">
                • <em>Fórmula:</em> (Marco × Tamaño_Página) + Desplazamiento<br>
                • <em>Sustitución:</em> (${frameNum} × ${pageSize}) + ${offset} = ${frameNum * pageSize} + ${offset} = <span class="font-bold text-emerald-600 dark:text-emerald-400 text-sm">${physAddr}</span> (decimal) = <span class="font-bold text-purple-600 dark:text-purple-400 font-mono text-sm">0x${physAddr.toString(16).toUpperCase()}</span>
            </div>
        `;
    };

    if (inMmuLog && selMmuSize && inMmuFrame) {
        inMmuLog.addEventListener('input', updateMmuTranslation);
        selMmuSize.addEventListener('change', updateMmuTranslation);
        inMmuFrame.addEventListener('input', updateMmuTranslation);
        updateMmuTranslation();
    }
}

// --- 5. SIMULADOR 4: WORKING SET E HIPERPAGINACIÓN MEDIANTE TRAZAS SIMULADAS ---
function initWorkingSetSimulator() {
    const sDelta = document.getElementById('slider-ws-delta');
    const inRam = document.getElementById('input-ws-ram');
    const btnEval = document.getElementById('btn-ws-eval');

    // Trazas completas de referencias de páginas para 3 procesos concurrentes (12 referencias c/u):
    const processTraces = {
        P1: [2, 6, 1, 5, 7, 7, 7, 1, 6, 2, 5, 1], // En Δ=10 produce {1, 2, 5, 6, 7} (5 páginas)
        P2: [3, 4, 3, 4, 8, 3, 4, 8, 4, 3, 8, 4], // En Δ=10 produce {3, 4, 8} (3 páginas)
        P3: [9, 10, 9, 11, 12, 10, 11, 9, 12, 10, 11, 12] // En Δ=10 produce {9, 10, 11, 12} (4 páginas)
    };

    const evalWorkingSet = () => {
        const delta = parseInt(sDelta.value);
        const ram = parseInt(inRam.value) || 10;
        document.getElementById('lbl-ws-delta').textContent = `${delta} referencias`;

        // Cálculo analítico riguroso del Conjunto de Trabajo: W(t, Δ) = páginas distintas en la ventana reciente
        const workingSet = (trace) => new Set(trace.slice(-delta));

        const wsP1 = workingSet(processTraces.P1);
        const wsP2 = workingSet(processTraces.P2);
        const wsP3 = workingSet(processTraces.P3);

        const setP1Arr = Array.from(wsP1).sort((a, b) => a - b).join(', ');
        const setP2Arr = Array.from(wsP2).sort((a, b) => a - b).join(', ');
        const setP3Arr = Array.from(wsP3).sort((a, b) => a - b).join(', ');

        const demand = wsP1.size + wsP2.size + wsP3.size;
        const thrash = demand > ram;

        const box = document.getElementById('ws-alert-box');
        const title = document.getElementById('ws-status-title');
        const badge = document.getElementById('badge-ws-demand');
        const desc = document.getElementById('ws-details-text');

        badge.textContent = `Demanda: ${demand} / ${ram} Marcos`;

        if (thrash) {
            box.className = 'p-4 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300';
            title.textContent = '💥 Predicción del Modelo: Riesgo Inminente de Hiperpaginación (Thrashing)';
            badge.className = 'badge danger';
            desc.textContent = `Demanda agregada (D = ${demand} marcos) EXCEDE la memoria RAM disponible (m = ${ram} marcos). El modelo de Denning predice que el sistema entrará en hiperpaginación, dedicando la mayor parte del tiempo a transferir páginas con el swap y degradando severamente el throughput de la CPU. Acción recomendada por el modelo: suspender temporalmente uno de los procesos o reducir el grado de multiprogramación hasta que D ≤ m. WSS: P1={${setP1Arr}} (${wsP1.size}), P2={${setP2Arr}} (${wsP2.size}), P3={${setP3Arr}} (${wsP3.size}).`;
        } else {
            box.className = 'p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300';
            title.textContent = '✅ Estado: Sistema Estable (Sin Hiperpaginación)';
            badge.className = 'badge success';
            desc.textContent = `Demanda agregada (D = ${demand} marcos) es menor o igual a los marcos disponibles (m = ${ram} marcos). El modelo predice un régimen de ejecución estable sin sobrecarga excesiva de paginación. WSS: P1={${setP1Arr}} (${wsP1.size}), P2={${setP2Arr}} (${wsP2.size}), P3={${setP3Arr}} (${wsP3.size}).`;
        }
    };

    sDelta.addEventListener('input', evalWorkingSet);
    inRam.addEventListener('input', evalWorkingSet);
    btnEval.addEventListener('click', evalWorkingSet);
    evalWorkingSet();

    initPffSimulator();
}

function initPffSimulator() {
    const sRate = document.getElementById('slider-pff-rate');
    const sLow = document.getElementById('slider-pff-low');
    const sHigh = document.getElementById('slider-pff-high');
    const inFrames = document.getElementById('input-pff-frames');
    const lblRate = document.getElementById('lbl-pff-rate');
    const lblLow = document.getElementById('lbl-pff-low');
    const lblHigh = document.getElementById('lbl-pff-high');
    const card = document.getElementById('pff-decision-card');
    const badge = document.getElementById('badge-pff-status');

    if (!sRate || !sLow || !sHigh || !inFrames || !card) return;

    const evalPff = () => {
        let f = parseInt(sRate.value);
        let uMin = parseInt(sLow.value);
        let uMax = parseInt(sHigh.value);
        let frames = parseInt(inFrames.value) || 1;

        if (uMin >= uMax) {
            uMin = uMax - 5;
            sLow.value = uMin;
        }

        lblRate.textContent = `${f}%`;
        lblLow.textContent = `${uMin}%`;
        lblHigh.textContent = `${uMax}%`;

        if (f > uMax) {
            card.className = 'p-3 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-xs space-y-1';
            card.innerHTML = `
                <div class="font-bold flex items-center gap-1">⚠️ <span>Acción del SO: Tasa Crítica (<em>F</em> = ${f}% > <em>U</em><sub>max</sub> = ${uMax}%) ➔ Asignar Marco Adicional</span></div>
                <div>El conjunto de trabajo del proceso no entra en los <strong>${frames} marcos</strong> asignados. El sistema operativo debe otorgarle un marco más (<em>m</em> ➔ ${frames + 1}). Si la RAM global no tiene marcos libres, debe suspender un proceso para reducir el grado de multiprogramación y evitar hiperpaginación (thrashing).</div>
            `;
            if (badge) {
                badge.className = 'badge danger';
                badge.textContent = 'PFF: Asignar Marcos (F > U_max)';
            }
        } else if (f < uMin) {
            const nextFrames = Math.max(1, frames - 1);
            card.className = 'p-3 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs space-y-1';
            card.innerHTML = `
                <div class="font-bold flex items-center gap-1">📉 <span>Acción del SO: Tasa Baja (<em>F</em> = ${f}% < <em>U</em><sub>min</sub> = ${uMin}%) ➔ Liberar Marco Ocioso</span></div>
                <div>El proceso tiene memoria física en exceso para su localidad actual. El sistema operativo recupera un marco ocioso (<em>m</em> ➔ ${nextFrames}) para reasignarlo a otros procesos o incrementar el grado de multiprogramación.</div>
            `;
            if (badge) {
                badge.className = 'badge success';
                badge.textContent = 'PFF: Liberar Marco (F < U_min)';
            }
        } else {
            card.className = 'p-3 rounded-lg border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 text-xs space-y-1';
            card.innerHTML = `
                <div class="font-bold flex items-center gap-1">✅ <span>Acción del SO: Régimen Óptimo (<em>U</em><sub>min</sub> = ${uMin}% ≤ <em>F</em> = ${f}% ≤ <em>U</em><sub>max</sub> = ${uMax}%) ➔ Mantener Asignación</span></div>
                <div>La tasa de fallos se encuentra balanceada dentro de la ventana de tolerancia. El proceso mantiene estables sus <strong>${frames} marcos</strong> de memoria física.</div>
            `;
            if (badge) {
                badge.className = 'badge info';
                badge.textContent = 'PFF: Régimen Estable';
            }
        }
    };

    sRate.addEventListener('input', evalPff);
    sLow.addEventListener('input', evalPff);
    sHigh.addEventListener('input', evalPff);
    inFrames.addEventListener('input', evalPff);
    evalPff();
}

// --- 6. SIMULADOR 5: TRATAMIENTO DE UN FALLO DE PÁGINA (PASO A PASO) ---
function initPageFaultSimulator() {
    let pfCurrentScenario = 'free';
    let pfCurrentStep = 1;

    const scenarios = {
        free: {
            name: "Marco Libre Disponible",
            steps: [
                {
                    step: 1,
                    title: "1. Referencia Lógica CPU",
                    mode: "Modo: Usuario (CPU)",
                    badgeClass: "badge",
                    desc: "La CPU ejecuta una instrucción que referencia la dirección virtual 0x065C (Página 3, desplazamiento 92).",
                    log: "CPU [Modo Usuario]: Instrucción solicita acceso a dirección virtual 0x065C (Página lógica 3, desplazamiento 92)."
                },
                {
                    step: 2,
                    title: "2. Verificación MMU (P=0)",
                    mode: "Modo: Hardware (MMU)",
                    badgeClass: "badge",
                    desc: "La MMU consulta la TLB y la Tabla de Páginas. La entrada de la Página 3 tiene el bit de presencia P=0 (la página no reside en memoria física).",
                    log: "MMU [Hardware]: TLB Miss. Entrada en Tabla de Páginas indica bit P=0 (Página no presente en RAM). Se suspende la instrucción."
                },
                {
                    step: 3,
                    title: "3. Trap de Hardware al Kernel",
                    mode: "Modo: Hardware ➔ Kernel",
                    badgeClass: "badge warning",
                    desc: "La MMU genera un trap (excepción de hardware por fallo de página). La CPU conmuta a Modo Núcleo (Kernel), guarda el estado del proceso (registros y PC) y delega el control al manejador del SO.",
                    log: "HARDWARE TRAP: Page Fault Exception. Conmutación a Modo Núcleo. Contexto y Program Counter (PC) salvados en la pila del kernel."
                },
                {
                    step: 4,
                    title: "4. Verificación de Legalidad (SO)",
                    mode: "Modo: Kernel (SO)",
                    badgeClass: "badge info",
                    desc: "El SO consulta los descriptores del PCB: confirma que la dirección 0x065C pertenece legalmente al espacio lógico del proceso (no es violación de protección). Localiza el bloque de la Página 3 en el área de intercambio (disco swap).",
                    log: "KERNEL [SO]: Dirección válida en espacio de direcciones del proceso. Localizada Página 3 en Swap: Bloque Disco #1042."
                },
                {
                    step: 5,
                    title: "5. Búsqueda de Marco Físico",
                    mode: "Modo: Kernel (SO)",
                    badgeClass: "badge info",
                    desc: "El SO consulta la lista de marcos libres y encuentra disponible el Marco Físico 10. No requiere invocar algoritmo de reemplazo ni desalojar páginas existentes.",
                    log: "KERNEL [SO]: Marco físico libre disponible: Marco #10. Asignación inmediata sin desalojo de memoria."
                },
                {
                    step: 6,
                    title: "6. Evaluación de Desalojo",
                    mode: "Modo: Kernel (SO)",
                    badgeClass: "badge info",
                    desc: "Dado que existía un marco libre disponible, no hay víctima que desalojar ni escribir a disco swap.",
                    log: "KERNEL [SO]: Desalojo omitido. No se requiere operación de I/O de salida hacia swap."
                },
                {
                    step: 7,
                    title: "7. Lectura Swap ➔ RAM y Tabla",
                    mode: "Modo: Kernel (E/S Disco)",
                    badgeClass: "badge warning",
                    desc: "El SO programa la lectura de la Página 3 desde el disco swap al Marco 10. El proceso espera en estado Bloqueado. Al completarse la I/O, el SO actualiza la Tabla de Páginas: Marco=10, P=1, M=0.",
                    log: "KERNEL E/S: Transferencia completada de Swap a Marco 10. Tabla actualizada: Pág 3 -> Marco 10 [P=1, M=0]. Proceso pasa a Listo."
                },
                {
                    step: 8,
                    title: "8. Reinicio de la Instrucción",
                    mode: "Modo: Kernel ➔ Usuario",
                    badgeClass: "badge success",
                    desc: "El SO restaura los registros y el PC original. Conmuta a Modo Usuario y reinicia la instrucción interrumpida. Esta vez la MMU encuentra P=1 en RAM y la lectura procede de forma transparente para el proceso.",
                    log: "KERNEL ➔ USUARIO: Registros y PC restaurados. Instrucción reanudada idénticamente. Traducción exitosa sin intervención del usuario."
                }
            ]
        },
        clean: {
            name: "Memoria Llena - Víctima Limpia (M=0)",
            steps: [
                {
                    step: 1,
                    title: "1. Referencia Lógica CPU",
                    mode: "Modo: Usuario (CPU)",
                    badgeClass: "badge",
                    desc: "La CPU ejecuta una instrucción que referencia la dirección virtual 0x065C (Página 3, desplazamiento 92).",
                    log: "CPU [Modo Usuario]: Instrucción solicita acceso a dirección virtual 0x065C (Página lógica 3, desplazamiento 92)."
                },
                {
                    step: 2,
                    title: "2. Verificación MMU (P=0)",
                    mode: "Modo: Hardware (MMU)",
                    badgeClass: "badge",
                    desc: "La MMU busca en la TLB y en la Tabla de Páginas: bit P=0 para la Página 3 (ausente de RAM).",
                    log: "MMU [Hardware]: TLB Miss. Entrada en Tabla de Páginas con P=0. Instrucción suspendida."
                },
                {
                    step: 3,
                    title: "3. Trap de Hardware al Kernel",
                    mode: "Modo: Hardware ➔ Kernel",
                    badgeClass: "badge warning",
                    desc: "La MMU eleva una excepción de fallo de página. Conmutación a Modo Núcleo y salvado del contexto del proceso.",
                    log: "HARDWARE TRAP: Page Fault Exception. Conmutación a Modo Núcleo. Guardado de registros en pila kernel."
                },
                {
                    step: 4,
                    title: "4. Verificación de Legalidad (SO)",
                    mode: "Modo: Kernel (SO)",
                    badgeClass: "badge info",
                    desc: "El SO verifica en el PCB que la dirección es legal y localiza la Página 3 en el área de swap.",
                    log: "KERNEL [SO]: Dirección válida y legal. Página 3 localizada en Swap (Bloque Disco #1042)."
                },
                {
                    step: 5,
                    title: "5. Memoria Llena: Selección Víctima",
                    mode: "Modo: Kernel (SO)",
                    badgeClass: "badge info",
                    desc: "Todos los marcos físicos de RAM están ocupados. El algoritmo de reemplazo (ej. Reloj/FIFO/LRU) selecciona a la Página 7 en el Marco Físico 2 como víctima a desalojar.",
                    log: "KERNEL [SO]: RAM saturada (sin marcos libres). Algoritmo de reemplazo selecciona víctima: Página 7 alojada en Marco 2."
                },
                {
                    step: 6,
                    title: "6. Inspección de Bit Sucio (M=0)",
                    mode: "Modo: Kernel (SO)",
                    badgeClass: "badge success",
                    desc: "El SO inspecciona el bit de modificación de la víctima: M=0 (página LIMPIA, no modificada). No requiere escribir a disco swap; se desaloja directamente de RAM ahorrando una operación de I/O de salida.",
                    log: "KERNEL [SO]: Víctima Página 7 tiene M=0 (LIMPIA). Desalojo directo de RAM sin escritura en disco swap (ahorro de I/O)."
                },
                {
                    step: 7,
                    title: "7. Lectura Swap ➔ RAM y Tabla",
                    mode: "Modo: Kernel (E/S Disco)",
                    badgeClass: "badge warning",
                    desc: "El SO carga la Página 3 desde el disco swap al Marco 2. Se actualizan las tablas de páginas: Página 7 queda con P=0; Página 3 queda con Marco=2, P=1, M=0.",
                    log: "KERNEL E/S: Página 3 cargada en Marco 2 desde swap. Tabla actualizada: Pág 7 -> P=0; Pág 3 -> Marco 2 [P=1, M=0]."
                },
                {
                    step: 8,
                    title: "8. Reinicio de la Instrucción",
                    mode: "Modo: Kernel ➔ Usuario",
                    badgeClass: "badge success",
                    desc: "El SO conmuta a Modo Usuario y reinicia la instrucción original. Ahora la Página 3 reside en RAM (Marco 2, P=1) y el acceso culmina con normalidad.",
                    log: "KERNEL ➔ USUARIO: Contexto restaurado. Instrucción reanudada con éxito. Costo total: 1 acceso a swap (lectura)."
                }
            ]
        },
        dirty: {
            name: "Memoria Llena - Víctima Modificada (M=1)",
            steps: [
                {
                    step: 1,
                    title: "1. Referencia Lógica CPU",
                    mode: "Modo: Usuario (CPU)",
                    badgeClass: "badge",
                    desc: "La CPU ejecuta una instrucción que referencia la dirección virtual 0x065C (Página 3, desplazamiento 92).",
                    log: "CPU [Modo Usuario]: Instrucción solicita acceso a dirección virtual 0x065C (Página lógica 3, desplazamiento 92)."
                },
                {
                    step: 2,
                    title: "2. Verificación MMU (P=0)",
                    mode: "Modo: Hardware (MMU)",
                    badgeClass: "badge",
                    desc: "La MMU comprueba la entrada de la Página 3 en la Tabla de Páginas: bit de presencia P=0.",
                    log: "MMU [Hardware]: TLB Miss. Entrada en Tabla de Páginas con P=0. Instrucción suspendida."
                },
                {
                    step: 3,
                    title: "3. Trap de Hardware al Kernel",
                    mode: "Modo: Hardware ➔ Kernel",
                    badgeClass: "badge warning",
                    desc: "La MMU dispara el trap de fallo de página. Se conmuta a Modo Núcleo y se guardan los registros en la pila del kernel.",
                    log: "HARDWARE TRAP: Page Fault Exception. Conmutación a Modo Núcleo. Salvado de registros y PC."
                },
                {
                    step: 4,
                    title: "4. Verificación de Legalidad (SO)",
                    mode: "Modo: Kernel (SO)",
                    badgeClass: "badge info",
                    desc: "El SO verifica que la dirección pertenece al proceso y localiza la Página 3 en el swap.",
                    log: "KERNEL [SO]: Dirección válida en mapa de memoria. Página 3 localizada en Swap (Bloque Disco #1042)."
                },
                {
                    step: 5,
                    title: "5. Memoria Llena: Selección Víctima",
                    mode: "Modo: Kernel (SO)",
                    badgeClass: "badge info",
                    desc: "No hay marcos libres. El algoritmo de reemplazo elige a la Página 5 en el Marco Físico 4 como víctima.",
                    log: "KERNEL [SO]: RAM saturada. Algoritmo de reemplazo selecciona como víctima a la Página 5 alojada en el Marco 4."
                },
                {
                    step: 6,
                    title: "6. Escritura OBLIGATORIA Swap (M=1)",
                    mode: "Modo: Kernel (E/S Disco Swap-Out)",
                    badgeClass: "badge danger",
                    desc: "El SO examina el bit de modificación de la víctima: M=1 (página MODIFICADA/SUCIA). Su contenido en RAM fue modificado y la copia existente en el almacenamiento de respaldo, si la hubiera, ya no representa su estado actual. Por ello, debe conservarse el contenido actualizado antes de reutilizar el marco.",
                    log: "KERNEL CRÍTICO [E/S Swap-Out]: Víctima Página 5 tiene M=1 (MODIFICADA). Escritura obligatoria en disco swap iniciada. Marco 4 no puede reutilizarse hasta culminar la transferencia."
                },
                {
                    step: 7,
                    title: "7. Lectura Swap ➔ RAM (Swap-In)",
                    mode: "Modo: Kernel (E/S Disco Swap-In)",
                    badgeClass: "badge warning",
                    desc: "Tras escribirse la víctima en disco, el SO emite la lectura (swap-in) de la Página 3 hacia el Marco 4. Al completar la E/S, actualiza las tablas: Página 5 queda con P=0; Página 3 queda con Marco=4, P=1, M=0.",
                    log: "KERNEL [E/S Swap-In]: Transferencia de swap-in completada. Página 3 cargada en Marco 4. Tablas actualizadas: Pág 5 -> P=0; Pág 3 -> Marco 4 [P=1, M=0]."
                },
                {
                    step: 8,
                    title: "8. Reinicio de la Instrucción",
                    mode: "Modo: Kernel ➔ Usuario",
                    badgeClass: "badge success",
                    desc: "El SO restaura el contexto y conmuta a Modo Usuario. Se reinicia exactamente la misma instrucción. Esta vez la MMU encuentra P=1 en Marco 4 y culmina con éxito. Costo total: 2 accesos a swap (1 escritura + 1 lectura).",
                    log: "KERNEL ➔ USUARIO: Contexto restaurado. Instrucción reanudada idénticamente. Acceso completado con éxito tras 2 operaciones de disco."
                }
            ]
        },
        invalid: {
            name: "Dirección Inválida (Violación de Acceso)",
            steps: [
                {
                    step: 1,
                    title: "1. Referencia Lógica CPU",
                    mode: "Modo: Usuario (CPU)",
                    badgeClass: "badge",
                    desc: "La CPU intenta acceder a la dirección virtual 0xDEADBEEF, definida en este escenario como una dirección que no pertenece al espacio virtual válido del proceso.",
                    log: "CPU [Modo Usuario]: Instrucción intenta acceder a dirección virtual 0xDEADBEEF (no asignada al proceso)."
                },
                {
                    step: 2,
                    title: "2. Comprobación MMU (Excepción)",
                    mode: "Modo: Hardware (MMU)",
                    badgeClass: "badge",
                    desc: "La MMU no puede completar la traducción y genera una excepción. El hardware todavía no determina por sí solo si se trata de una página válida no presente o de una referencia fuera del espacio autorizado; esa comprobación será realizada por el sistema operativo.",
                    log: "MMU [Hardware]: Traducción incompleta. Excepción de fallo de página generada hacia el manejador del SO."
                },
                {
                    step: 3,
                    title: "3. Trap de Hardware al Kernel",
                    mode: "Modo: Hardware ➔ Kernel",
                    badgeClass: "badge warning",
                    desc: "La MMU conmuta la CPU a Modo Núcleo transfiriendo el control al manejador del SO y guardando los registros del proceso.",
                    log: "HARDWARE TRAP: Page Fault Exception. Conmutación a Modo Núcleo. Contexto del proceso guardado."
                },
                {
                    step: 4,
                    title: "4. Verificación de Legalidad: ¡VIOLACIÓN!",
                    mode: "Modo: Kernel (Violación de Acceso)",
                    badgeClass: "badge danger",
                    desc: "El SO consulta los descriptores de límites y permisos en el PCB. Detecta que 0xDEADBEEF NO pertenece al espacio de direcciones del proceso (dirección ilegal). NO es un fallo cargable desde disco: el sistema operativo notifica una violación de acceso y finaliza el proceso; en sistemas tipo Unix puede utilizarse la señal SIGSEGV.",
                    log: "KERNEL ERROR CRÍTICO: Dirección 0xDEADBEEF fuera del espacio asignado al proceso. Notificación de violación de acceso (en sistemas tipo Unix: señal SIGSEGV). Proceso finalizado."
                },
                {
                    step: 5,
                    title: "5. Búsqueda de Marco (Cancelada)",
                    mode: "Modo: Abortado",
                    badgeClass: "badge danger",
                    desc: "Etapa cancelada: no se asignan marcos ni se invoca el algoritmo de reemplazo porque el proceso fue terminado.",
                    log: "ETAPA CANCELADA: Proceso terminado anormalmente por violación de acceso."
                },
                {
                    step: 6,
                    title: "6. Evaluación Desalojo (Cancelada)",
                    mode: "Modo: Abortado",
                    badgeClass: "badge danger",
                    desc: "Etapa cancelada: no hay operaciones de desalojo.",
                    log: "ETAPA CANCELADA."
                },
                {
                    step: 7,
                    title: "7. Lectura Swap (Cancelada)",
                    mode: "Modo: Abortado",
                    badgeClass: "badge danger",
                    desc: "Etapa cancelada: la dirección no corresponde a ninguna página en el almacenamiento secundario.",
                    log: "ETAPA CANCELADA."
                },
                {
                    step: 8,
                    title: "8. Reinicio Instrucción (Cancelado)",
                    mode: "Modo: Abortado",
                    badgeClass: "badge danger",
                    desc: "Etapa cancelada: la instrucción jamás se reanuda; el SO libera la memoria del proceso y puede generar un volcado de memoria, según la configuración del sistema.",
                    log: "PROCESO TERMINADO ANORMALMENTE: Memoria del proceso liberada. Puede generarse volcado de memoria (core dump), según la configuración del sistema."
                }
            ]
        }
    };

    const sceneButtons = {
        free: document.getElementById('btn-pf-scene-free'),
        clean: document.getElementById('btn-pf-scene-clean'),
        dirty: document.getElementById('btn-pf-scene-dirty'),
        invalid: document.getElementById('btn-pf-scene-invalid')
    };

    const btnStep = document.getElementById('btn-pf-step');
    const btnAll = document.getElementById('btn-pf-all');
    const btnReset = document.getElementById('btn-pf-reset');

    const stepsGrid = document.getElementById('pf-steps-grid');
    const stepDisp = document.getElementById('pf-step-disp');
    const detailTitle = document.getElementById('pf-detail-title');
    const badgeMode = document.getElementById('pf-badge-mode');
    const detailDesc = document.getElementById('pf-detail-desc');
    const logBox = document.getElementById('pf-log');

    const logPf = (msg) => {
        if (!logBox) return;
        const line = document.createElement('div');
        line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        logBox.appendChild(line);
        logBox.scrollTop = logBox.scrollHeight;
    };

    const renderStepper = () => {
        if (!stepsGrid) return;
        const currentData = scenarios[pfCurrentScenario];
        const steps = currentData.steps;

        stepsGrid.innerHTML = '';
        steps.forEach((st, idx) => {
            const stepNum = idx + 1;
            const card = document.createElement('div');
            
            let statusClass = '';
            let isCurrent = stepNum === pfCurrentStep;
            let isCompleted = stepNum < pfCurrentStep;
            let isCanceled = pfCurrentScenario === 'invalid' && stepNum > 4;

            if (isCurrent) {
                statusClass = 'active';
            } else if (isCompleted) {
                statusClass = 'completed';
            }

            if (isCanceled) {
                card.className = `pf-step-card opacity-40 border-rose-300 dark:border-rose-900 line-through ${statusClass}`;
            } else {
                card.className = `pf-step-card ${statusClass}`;
            }

            card.innerHTML = `
                <div class="flex items-center justify-between gap-1 mb-1">
                    <span class="font-bold text-xs ${isCurrent ? 'text-purple-600 dark:text-purple-400 font-extrabold' : ''}">Etapa ${stepNum}</span>
                    <span class="text-[10px] ${isCompleted ? 'text-emerald-500 font-bold' : isCurrent ? 'text-purple-500 font-bold' : 'text-gray-400'}">
                        ${isCanceled ? '❌' : isCompleted ? '✓' : isCurrent ? '▶ En curso' : '○'}
                    </span>
                </div>
                <div class="font-semibold text-xs leading-tight mb-1 text-gray-800 dark:text-gray-200">${st.title}</div>
                <div class="text-[10px] text-gray-500 dark:text-gray-400 italic">${st.mode}</div>
            `;
            stepsGrid.appendChild(card);
        });

        const activeStepData = steps[pfCurrentStep - 1] || steps[steps.length - 1];
        if (stepDisp) {
            stepDisp.textContent = `Etapa ${pfCurrentStep} / 8`;
        }
        if (detailTitle) {
            detailTitle.textContent = `Etapa ${pfCurrentStep}: ${activeStepData.title}`;
        }
        if (badgeMode) {
            badgeMode.textContent = activeStepData.mode;
            badgeMode.className = activeStepData.badgeClass || 'badge';
        }
        if (detailDesc) {
            detailDesc.textContent = activeStepData.desc;
        }
    };

    const setScenario = (scKey) => {
        pfCurrentScenario = scKey;
        pfCurrentStep = 1;
        Object.keys(sceneButtons).forEach(k => {
            const btn = sceneButtons[k];
            if (btn) {
                if (k === scKey) {
                    btn.className = 'btn-primary text-xs active';
                } else {
                    btn.className = 'btn-secondary text-xs';
                }
            }
        });
        if (logBox) logBox.innerHTML = '';
        logPf(`--- Iniciando Escenario: ${scenarios[scKey].name} ---`);
        logPf(scenarios[scKey].steps[0].log);
        renderStepper();
    };

    Object.keys(sceneButtons).forEach(k => {
        const btn = sceneButtons[k];
        if (btn) {
            btn.addEventListener('click', () => setScenario(k));
        }
    });

    if (btnStep) {
        btnStep.addEventListener('click', () => {
            const maxStep = pfCurrentScenario === 'invalid' ? 4 : 8;
            if (pfCurrentStep < maxStep) {
                pfCurrentStep++;
                const st = scenarios[pfCurrentScenario].steps[pfCurrentStep - 1];
                logPf(st.log);
                renderStepper();
            } else if (pfCurrentScenario === 'invalid' && pfCurrentStep === 4) {
                logPf("KERNEL: Proceso finalizado por violación de acceso. No hay etapas subsiguientes.");
                alert("🚫 Violación de Acceso: La dirección 0xDEADBEEF no pertenece al espacio válido del proceso. El sistema operativo finaliza el proceso (en sistemas tipo Unix puede utilizarse la señal SIGSEGV).");
            } else {
                alert("✅ Ciclo de tratamiento de fallo de página completado.");
            }
        });
    }

    if (btnAll) {
        btnAll.addEventListener('click', () => {
            const targetStep = pfCurrentScenario === 'invalid' ? 4 : 8;
            while (pfCurrentStep < targetStep) {
                pfCurrentStep++;
                const st = scenarios[pfCurrentScenario].steps[pfCurrentStep - 1];
                logPf(st.log);
            }
            if (pfCurrentScenario === 'invalid') {
                logPf("KERNEL: Proceso finalizado por violación de acceso (en sistemas tipo Unix: señal SIGSEGV).");
            }
            renderStepper();
        });
    }

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            pfCurrentStep = 1;
            if (logBox) logBox.innerHTML = '';
            logPf(`--- Simulador Reiniciado: ${scenarios[pfCurrentScenario].name} ---`);
            logPf(scenarios[pfCurrentScenario].steps[0].log);
            renderStepper();
        });
    }

    // Inicialización inicial
    setScenario('free');
}

// --- 7. RENDERIZADO DE LOS 15 EJERCICIOS EVALUATIVOS ---
function renderExercises() {
    const container = document.getElementById('exercises-container');
    if (!container) return;
    container.innerHTML = '';

    exercisesData.forEach((ex, idx) => {
        const card = document.createElement('section');
        card.className = 'card exercise-card';
        card.id = `card-${ex.id}`;

        let controlHtml = '';

        if (ex.type === 'select') {
            controlHtml = `
                <div class="mt-3">
                    <select id="${ex.id}" class="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-slate-800 text-sm font-medium">
                        <option value="">-- Selecciona una respuesta --</option>
                        ${ex.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
                    </select>
                </div>
            `;
        } else if (ex.type === 'radio') {
            controlHtml = `
                <div class="mt-3 space-y-2">
                    ${ex.options.map((opt, oIdx) => `
                        <label class="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700/60 hover:bg-purple-50 dark:hover:bg-purple-950/30 cursor-pointer text-xs font-medium transition-colors">
                            <input type="radio" name="${ex.id}" value="${opt.value}" class="text-purple-600 focus:ring-purple-500">
                            <span>${opt.label}</span>
                        </label>
                    `).join('')}
                </div>
            `;
        } else if (ex.type === 'switch') {
            controlHtml = `
                <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                    ${ex.options.map((opt, oIdx) => `
                        <button type="button" class="btn-secondary text-xs text-left p-3 option-switch-btn" data-ex="${ex.id}" data-val="${opt.value}">
                            ${opt.label}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        const labLinkHtml = ex.labRef ? `
            <a href="#${ex.labRef.id}" class="lab-link-pill" title="Ir al ${ex.labRef.name}">
                <span>${ex.labRef.badge}</span>
                <span>↗ Ir al Lab</span>
            </a>
        ` : '';

        const labHintHtml = ex.labHint ? `
            <div class="lab-experiment-hint">
                💡 <strong>Comprobación en el simulador:</strong> ${ex.labHint}
            </div>
        ` : '';

        card.innerHTML = `
            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div class="flex items-center gap-2">
                    <span class="badge text-xs font-bold text-purple-600 dark:text-purple-400">Pregunta ${idx + 1} / ${exercisesData.length}</span>
                    <span class="text-[11px] text-gray-400 font-mono" id="status-${ex.id}">Pendiente</span>
                </div>
                ${labLinkHtml}
            </div>
            <h3 class="text-base font-bold mb-1">${ex.title}</h3>
            <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">${ex.question}</p>
            <div class="text-[11px] text-gray-400 dark:text-gray-500 mt-1 mb-2 italic">📖 ${ex.biblio}</div>
            ${labHintHtml}
            ${controlHtml}
        `;

        container.appendChild(card);
    });

    // Delegación de eventos para controles
    exercisesData.forEach(ex => {
        if (ex.type === 'select') {
            const select = document.getElementById(ex.id);
            if (select) {
                select.addEventListener('change', (e) => {
                    const val = e.target.value;
                    if (val) {
                        state.answers[ex.id] = val;
                    } else {
                        delete state.answers[ex.id];
                    }
                    updateProgress();
                    saveProgress();
                });
            }
        } else if (ex.type === 'radio') {
            const radios = document.querySelectorAll(`input[name="${ex.id}"]`);
            radios.forEach(r => {
                r.addEventListener('change', (e) => {
                    state.answers[ex.id] = e.target.value;
                    updateProgress();
                    saveProgress();
                });
            });
        } else if (ex.type === 'switch') {
            const btns = document.querySelectorAll(`button[data-ex="${ex.id}"]`);
            btns.forEach(btn => {
                btn.addEventListener('click', () => {
                    btns.forEach(b => b.className = 'btn-secondary text-xs text-left p-3 option-switch-btn');
                    btn.className = 'btn-primary text-xs text-left p-3 option-switch-btn';
                    state.answers[ex.id] = btn.getAttribute('data-val');
                    updateProgress();
                    saveProgress();
                });
            });
        }
    });
}

// --- 7. PERSISTENCIA DE PROGRESO Y RECARGA (LOCALSTORAGE) ---
function saveProgress() {
    state.studentInfo.name = document.getElementById('student-name').value.trim();
    state.studentInfo.lu = document.getElementById('student-lu').value.trim();
    localStorage.setItem('tso_tp7_state_v2', JSON.stringify(state));
}

function loadProgress() {
    const raw = localStorage.getItem('tso_tp7_state_v2');
    if (!raw) return;
    try {
        const parsed = JSON.parse(raw);
        if (parsed.studentInfo) {
            state.studentInfo = parsed.studentInfo;
            document.getElementById('student-name').value = state.studentInfo.name || '';
            document.getElementById('student-lu').value = state.studentInfo.lu || '';
        }
        if (parsed.answers) {
            state.answers = parsed.answers;
            // Restaurar controles en UI
            Object.keys(state.answers).forEach(id => {
                const val = state.answers[id];
                const select = document.getElementById(id);
                if (select) {
                    select.value = val;
                }
                const radio = document.querySelector(`input[name="${id}"][value="${val}"]`);
                if (radio) {
                    radio.checked = true;
                }
                const switchBtn = document.querySelector(`button[data-ex="${id}"][data-val="${val}"]`);
                if (switchBtn) {
                    const allBtns = document.querySelectorAll(`button[data-ex="${id}"]`);
                    allBtns.forEach(b => b.className = 'btn-secondary text-xs text-left p-3 option-switch-btn');
                    switchBtn.className = 'btn-primary text-xs text-left p-3 option-switch-btn';
                }
            });
        }
        updateProgress();
    } catch (e) {
        console.error("Error al cargar estado previo:", e);
    }
}

function updateProgress() {
    const total = exercisesData.length;
    const answeredCount = Object.keys(state.answers).length;
    const pct = Math.round((answeredCount / total) * 100);

    const fill = document.getElementById('progress-fill');
    const txt = document.getElementById('progress-text');
    if (fill) fill.style.width = `${pct}%`;
    if (txt) txt.textContent = `${pct}% Completado (${answeredCount}/${total})`;

    exercisesData.forEach(ex => {
        const statusEl = document.getElementById(`status-${ex.id}`);
        if (statusEl) {
            if (state.answers[ex.id]) {
                statusEl.textContent = 'Respondido ✓';
                statusEl.className = 'text-[11px] text-emerald-500 font-bold font-mono';
            } else {
                statusEl.textContent = 'Pendiente';
                statusEl.className = 'text-[11px] text-gray-400 font-mono';
            }
        }
    });

    const name = document.getElementById('student-name').value.trim();
    const lu = document.getElementById('student-lu').value.trim();
    const exportBtn = document.getElementById('btn-export');
    if (exportBtn) {
        exportBtn.disabled = !(answeredCount === total && name.length > 0 && lu.length > 0);
    }
}

function setupListeners() {
    document.getElementById('student-name').addEventListener('input', () => {
        saveProgress();
        updateProgress();
    });
    document.getElementById('student-lu').addEventListener('input', () => {
        saveProgress();
        updateProgress();
    });

    // Conexión del Botón de Exportación (Punto 4 obligatorio)
    const exportBtn = document.getElementById('btn-export');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportAnswers);
    }

    // Importación de JSON
    const btnImport = document.getElementById('btn-import-json');
    const fileImport = document.getElementById('file-import-input');
    if (btnImport && fileImport) {
        btnImport.addEventListener('click', () => fileImport.click());
        fileImport.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (data.student) {
                        state.studentInfo.name = data.student.name || '';
                        state.studentInfo.lu = data.student.lu || '';
                        document.getElementById('student-name').value = state.studentInfo.name;
                        document.getElementById('student-lu').value = state.studentInfo.lu;
                    }
                    for (let key of Object.keys(data)) {
                        if (key.startsWith('ej')) {
                            state.answers[key] = data[key];
                        }
                    }
                    saveProgress();
                    renderExercises();
                    loadProgress();
                    alert("✅ Respuestas importadas correctamente desde " + file.name);
                } catch (err) {
                    alert("❌ Error al leer el archivo JSON: " + err.message);
                }
            };
            reader.readAsText(file);
        });
    }
}

// --- 8. EXPORTACIÓN DE RESPUESTAS A JSON ---
function exportAnswers() {
    const name = document.getElementById('student-name').value.trim();
    const lu = document.getElementById('student-lu').value.trim();

    if (!name || !lu) {
        alert("⚠️ Por favor completa tu Nombre, Apellido y Libreta Universitaria antes de exportar.");
        return;
    }

    const payload = {
        tp_id: "TSO-2026-TP7",
        student: {
            name: name,
            lu: lu
        },
        timestamp: new Date().toISOString(),
        ...state.answers
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "respuestas_tp7.json");
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();

    if (typeof confetti === 'function') {
        confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}
