# 🛠️ TP N° 7: Memoria Virtual — TLB, Reemplazo de Páginas, Belady, Working-Set y Manejo de Fallos

**Universidad Nacional de Jujuy (UNJu) — Facultad de Ingeniería**  
**Cátedra:** Teoría de Sistemas Operativos (TSO)  
**Ciclo Lectivo:** 2026  
**Responsable de Cátedra:** Ing. María Fernanda Vázquez  
**JTP:** Ing. Fabio D. Argañaraz  

[![GitHub Classroom Autograding](https://github.com/UNJU-Teoria-de-Sistemas-Operativos/TP7/actions/workflows/classroom.yml/badge.svg)](https://github.com/UNJU-Teoria-de-Sistemas-Operativos/TP7/actions/workflows/classroom.yml)

---

## 🎯 Alcance Temático y Objetivos del Trabajo Práctico

Este trabajo práctico se concentra específicamente en los tópicos nucleares de Memoria Virtual de la **Unidad 9**:
- **Traducción Asociativa mediante TLB, Cálculo de EAT y MMU:** Calculadora interactiva de Tiempo de Acceso Efectivo ($\text{EAT}$), análisis de reducción del tiempo respecto al acceso sin TLB y traducción completa de dirección lógica a física ($\text{Marco} \times \text{Tamaño} + \text{Desplazamiento}$).
- **Políticas de Reemplazo de Páginas:** Implementación y análisis comparativo sobre memoria principal de los algoritmos **FIFO**, **LRU**, **Reloj (Segunda Oportunidad)**, **NRU** (clasificación por bits de referencia $R$ y modificación $M$), **NFU y su variante con envejecimiento** (*Aging* con registros de 8 bits desplazables) y la política teórica **Óptima (OPT / MIN)**.
- **Anomalía de Belady y Algoritmos de Pila (*Stack Algorithms*):** Verificación empírica de la anomalía en FIFO sobre pantalla dividida y análisis de las propiedades de inclusión.
- **Modelo de Conjunto de Trabajo (*Working Set*), Hiperpaginación (*Thrashing*) y Frecuencia de Fallos (PFF):** Modelado de $W(t, \Delta)$ a partir de trazas de referencias con ventana móvil $\Delta$, balanceo de demanda agregada de marcos $D = \sum |W_i|$ y estrategia de control adaptativo por frecuencia de fallos (PFF).
- **Ciclo de Tratamiento de un Fallo de Página (*Page Fault Handling*):** Secuencia didáctica de 8 etapas que representa el tratamiento general entre la MMU y el sistema operativo, verificación del bit de presencia $P$, selección de víctima, inspección del bit sucio $M$ (escritura obligatoria en swap) y reinicio transparente de la instrucción.

---

## 📚 Mapa Bibliográfico Oficial

Para la resolución de los laboratorios y el banco de autoevaluación, consulta la siguiente bibliografía oficial de la cátedra:

| Material Oficial | Referencia | Temas Cubiertos |
| :--- | :--- | :--- |
| **Diapositivas Unidad 9: Memoria Virtual** | Cátedra TSO UNJu (2026), pág. 1-60 | TLB, EAT, Reemplazo de Páginas, Aging, Belady, Working Set y PFF |
| **Silberschatz, Galvin & Gagne** | *Fundamentos de Sistemas Operativos*, 7ma Edición (2006) / 9na Edición | Cap. 8.4-8.5 (Paginación y TLB), Cap. 9.1-9.6 (Manejo de Fallos, Reemplazo y Thrashing) |
| **Tanenbaum, A. S. & Bos, H.** | *Sistemas Operativos Modernos*, 4ta Edición (2015) | Cap. 3.3 (Tablas de Páginas, TLB y Fallos de Página), Cap. 3.4 (Algoritmos de Reemplazo) |

---

## 🚀 Estructura del Entorno de Práctica

El trabajo se desarrolla íntegramente a través del ecosistema interactivo y de autoevaluación:

1. **Laboratorios Interactivos Web (`index.html` y `app.js`):**
   - 🔄 **Laboratorio 1: Algoritmos de Reemplazo de Páginas:** Simulación paso a paso con matriz visual interactiva para FIFO, LRU, Reloj (con aguja circular y segundas oportunidades), NRU (con clases 0 a 3, bits R/M e interrupción periódica de reloj), Envejecimiento (Aging, con registros de 8 bits desplazables) y Óptimo.
   - 💥 **Laboratorio 2: La Anomalía de Belady:** Comparación simultánea en pantalla dividida de FIFO con 3 marcos (9 fallos) vs 4 marcos (10 fallos) sobre la secuencia canónica.
   - ⚡ **Laboratorio 3: Calculadora de Tiempo de Acceso Efectivo con TLB y Traducción MMU:** Dinámica interactiva de $\alpha$, tiempos de acceso, reducción porcentual y descomposición completa de dirección lógica a física.
   - 🌊 **Laboratorio 4: Working Set, Hiperpaginación y Control por PFF:** Ventana móvil $\Delta$ calculada sobre trazas de referencias de procesos, balanceo $D \le m$ y panel de control por frecuencia de fallos (PFF).
   - 🛠️ **Laboratorio 5: Tratamiento de un Fallo de Página (Paso a Paso):** Stepper visual con una secuencia didáctica de 8 etapas y 4 escenarios (marco libre, víctima limpia $M=0$, víctima modificada $M=1$ con escritura en swap, y violación de acceso).
   - 📝 **Banco de Autoevaluación:** 15 ejercicios conceptuales y de cálculo con validación local y exportación a `respuestas_tp7.json`.

2. **Guía Práctica de Experimentación (`guia_laboratorio.md`):**
   - Manual paso a paso con las secuencias exactas, deducciones analíticas y matriz de correspondencia con los 15 ejercicios.

3. **Autograder Automatizado (`autograder_tp7.py` y `rubric_tp7.json`):**
   - Evaluador de consola local con rúbrica criptográfica SHA-256 para verificar tu calificación antes de realizar la entrega.

---

## 💻 Instrucciones de Resolución y Entrega

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/UNJU-Teoria-de-Sistemas-Operativos/TU_REPOSITORIO_TP7.git
cd TU_REPOSITORIO_TP7
```

### 2️⃣ Experimentar y Completar la Evaluación

1. Abre `index.html` en tu navegador web preferido (no requiere servidores web ni dependencias externas).
2. Experimenta en cada uno de los 5 simuladores siguiendo la `guia_laboratorio.md`.
3. Completa tu Nombre, Apellido, Libreta Universitaria y responde las 15 consignas evaluativas.
4. Al alcanzar el **100% Completado**, presiona el botón **Exportar Respuestas (.json)** para descargar `respuestas_tp7.json`.
5. Coloca el archivo descargado en la raíz de la carpeta de este repositorio.

### 3️⃣ Validar con el Autograder en Local

Ejecuta en tu terminal:

```bash
python autograder_tp7.py
```

El script verificará tus respuestas contra la rúbrica oficial y te otorgará el reporte detallado:

```text
==============================================================================
   UNIVERSIDAD NACIONAL DE JUJUY - FACULTAD DE INGENIERÍA
   CÁTEDRA: TEORÍA DE SISTEMAS OPERATIVOS (TSO) - CICLO LECTIVO 2026
   REPORTE OFICIAL DE AUTOEVALUACIÓN: TP N° 7 (MEMORIA VIRTUAL)
==============================================================================
  PUNTAJE TOTAL: 100/100 pts
  NOTA FINAL:    10.0 / 10.0
  ESTADO:        [APROBADO]
==============================================================================
```

### 4️⃣ Entrega en GitHub Classroom

Una vez obtenido el puntaje deseado:

```bash
git add respuestas_tp7.json
git commit -m "Entrega TP7 - [Nombre y Apellido]"
git push origin main
```
```
