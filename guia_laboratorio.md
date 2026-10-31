# 📘 Guía Práctica de Experimentación en Laboratorios Interactivos
## Trabajo Práctico N° 7: Memoria Virtual

**Universidad Nacional de Jujuy (UNJu) — Facultad de Ingeniería**  
**Cátedra:** Teoría de Sistemas Operativos (TSO) — Ciclo Lectivo 2026  
**Responsable de Cátedra:** Ing. María Fernanda Vázquez | **JTP:** Ing. Fabio D. Argañaraz  

---

### 🎯 Propósito y Alcance de esta Guía

Los laboratorios interactivos de `index.html` permiten reproducir experimentalmente la mecánica de la memoria virtual, delimitada a los siguientes tópicos centrales de la Unidad 9:
1. **Cálculo analítico del Tiempo de Acceso Efectivo (EAT) con TLB y traducción de dirección lógica a física (MMU).**
2. **Políticas de reemplazo de páginas:** FIFO, LRU, Reloj (Segunda Oportunidad), NRU (clasificación por bits $R/M$), NFU y su variante con envejecimiento, y Óptimo.
3. **Verificación empírica de la anomalía de Belady** en algoritmos que no son de pila.
4. **Modelo de Conjunto de Trabajo (*Working Set*), hiperpaginación (*thrashing*) y control por frecuencia de fallos (PFF).**
5. **Ciclo de tratamiento de un fallo de página (*Page Fault Handling*):** secuencia didáctica de 8 etapas que representa el tratamiento general entre MMU y SO, inspección del bit de presencia $P$ y bit de modificación $M$ (*dirty bit*), transferencias con swap y reinicio de instrucción.

Esta guía detalla:
- Qué secuencias y parámetros específicos probar en cada uno de los 5 laboratorios.
- Qué fenómenos y métricas observar en la matriz física de marcos y paneles de cálculo.
- Con qué ejercicio evaluativo del TP (15 consignas en total) se relaciona cada prueba para contrastar tus deducciones teóricas antes de exportar `respuestas_tp7.json`.

---

## 🔄 Laboratorio 1: Algoritmos de Reemplazo de Páginas (Paso a Paso)
**Ubicación en simulador:** Sección `#rep-simulator`  
**Ejercicios asociados:** **Ejercicio 1**, **Ejercicio 2**, **Ejercicio 3**, **Ejercicio 4**, **Ejercicio 5**, **Ejercicio 6** y **Ejercicio 7**.

### 📋 Estado Inicial y Trazas Disponibles
- **Traza Canónica:** `0, 1, 7, 2, 3, 2, 7, 1, 3` (4 marcos físicos).
- **Traza de Diapositivas U9:** `A, B, C, D, A, B, E, A, B, C, D, E` (3 o 4 marcos físicos).
- **Traza de Belady:** `0, 1, 2, 3, 0, 1, 4, 0, 1, 2, 3, 4`.

---

### 🧪 Experimento 1.1: Reemplazo FIFO con 4 Marcos
> **Objetivo:** Seguir la cola estricta de llegada (*First-In, First-Out*) y contar aciertos (*hits*) y fallos de página (*page faults*).

1. **Configuración:**
   - Selecciona **`📋 1. Traza Canónica (0 1 7 2 3 2 7 1 3)`**.
   - En **Algoritmo**, selecciona **`FIFO (First-In, First-Out)`**.
   - En **Marcos**, coloca **`4`**.
   - Haz clic en **`🔄 Reiniciar`**.
2. **Procedimiento Paso a Paso:**
   - Haz clic en **`⏭️ Siguiente Referencia`** sucesivamente:
     - **Ref 1 (Pág 0):** Fallo de página (Carga en Marco 0).
     - **Ref 2 (Pág 1):** Fallo de página (Carga en Marco 1).
     - **Ref 3 (Pág 7):** Fallo de página (Carga en Marco 2).
     - **Ref 4 (Pág 2):** Fallo de página (Carga en Marco 3). Memoria llena: `{0, 1, 7, 2}`.
     - **Ref 5 (Pág 3):** Memoria llena $\implies$ ¡Fallo de reemplazo! Como la página más antigua en memoria es la **0**, se desaloja la página 0 y entra la 3: `{3, 1, 7, 2}`.
     - **Ref 6 (Pág 2):** Acierto (*hit*). La página 2 ya reside en memoria.
     - **Ref 7 (Pág 7):** Acierto (*hit*). La página 7 ya reside en memoria.
     - **Ref 8 (Pág 1):** Acierto (*hit*). La página 1 ya reside en memoria.
     - **Ref 9 (Pág 3):** Acierto (*hit*). La página 3 ya reside en memoria.
3. **Métricas Finales:**
   - **4 Aciertos (hits)** y **exactamente 5 Fallos de Página**.
   - ✅ *Esta simulación resuelve directamente el **Ejercicio 1***.

---

### 🧪 Experimento 1.2: NFU con Registros de Envejecimiento (Aging)
> **Fundamento (Diapositivas U9 pág. 38-43):**
> En este práctico se denomina algoritmo de envejecimiento (*aging*) a la variante de NFU basada en registros desplazables de 8 bits. Cada marco posee un registro de 8 bits inicializado en `00000000`. Al concluir cada referencia, los registros de todos los marcos se desplazan un bit a la derecha ($>> 1$) y se incorpora por la izquierda (MSB) el valor del bit de referencia $R$, tras lo cual $R$ se limpia a 0. Ante un fallo con memoria completa, se desaloja el marco con el menor valor numérico binario.
>
> **Ejecución en el Simulador:** Puedes seleccionar directamente en el selector de algoritmos **`Envejecimiento (Aging, variante de NFU)`** y cargar la secuencia **`🎓 2. Diapositivas U9`** configurando 4 marcos para observar la evolución binaria y numérica paso a paso.

1. **Análisis de la Secuencia Oficial:**
   - Secuencia: `A, B, C, D, A, B, E` sobre 4 marcos (M0 a M3) inicialmente vacíos.
   - Cargas iniciales en memoria vacía ($t_0$ a $t_3$):
     - M0 recibe A ($R=1$), M1 recibe B ($R=1$), M2 recibe C ($R=1$), M3 recibe D ($R=1$).
   - Acierto en $t_4$ (Referencia A): M0 marca $R=1$, los demás desplazan con $R=0$.
   - Acierto en $t_5$ (Referencia B): M1 marca $R=1$, los demás desplazan con $R=0$.
   - Estado de los registros en $t_6$ previo al desalojo por la referencia a **E**:
     - **Marco 0 (Pág A):** `01000100` (decimal $68$)
     - **Marco 1 (Pág B):** `10001000` (decimal $136$)
     - **Marco 2 (Pág C):** `00010000` (decimal $16$)
     - **Marco 3 (Pág D):** `00100000` (decimal $32$)
2. **Selección de Víctima:**
   - El menor valor binario es `00010000` ($16$), perteneciente al **Marco 2** que alberga a la **Página C**.
   - Por lo tanto, la página desalojada es la **Página C (Marco 2)**.
   - ✅ *Resuelve el **Ejercicio 2***.

---

### 🧪 Experimento 1.3: Clasificación NRU por Clases de Bits $R$ y $M$
1. **Mecánica y Supuestos de NRU:**
   - La MMU actualiza en hardware el bit $R$ en accesos y el bit $M$ en escrituras.
   - **Supuesto de escritura:** A efectos de la simulación, las referencias a páginas numéricas impares y a las páginas B y D se consideran operaciones de escritura, por lo que activan el bit $M$.
   - **Interrupción de reloj:** En la simulación de NRU, los bits $R$ se reinician periódicamente a 0 cada cuatro referencias para representar la interrupción de temporizador del sistema operativo.
   - Se clasifica a las páginas en 4 clases estrictas:
     - **Clase 0:** $R=0, M=0$ (Prioridad máxima de desalojo).
     - **Clase 1:** $R=0, M=1$.
     - **Clase 2:** $R=1, M=0$.
     - **Clase 3:** $R=1, M=1$.
2. **Caso Analítico del Práctico:**
   - Estado: P0 ($R=1, M=0$ $\to$ Clase 2), P1 ($R=0, M=0$ $\to$ Clase 0), P2 ($R=0, M=0$ $\to$ Clase 0), P3 ($R=1, M=1$ $\to$ Clase 3).
   - Las candidatas prioritarias pertenecen a la **Clase 0: P1 y P2**. Cualquiera de ellas puede ser seleccionada según el criterio de desempate implementado (menor índice de marco).
   - ✅ *Resuelve el **Ejercicio 3***.

---

### 🧪 Experimento 1.4: Algoritmo Óptimo de Reemplazo (OPT / MIN de Belady)
1. **Fundamento Teórico (Diapositivas U9 pág. 30-31):**
   - El algoritmo Óptimo de Belady reemplaza aquella página que no será utilizada durante el mayor lapso en el futuro (o que nunca más se utilizará).
2. **Procedimiento en el Simulador:**
   - Selecciona la traza canónica `0, 1, 7, 2, 3, 2, 7, 1, 3` con 4 marcos.
   - Elige el algoritmo **`Óptimo (OPT / MIN de Belady)`**.
   - Avanza hasta el paso 5 (referencia a la **página 3** con memoria llena `{0, 1, 7, 2}`).
   - *Inspección del futuro:*
     - Página 2 se referencia en el paso 6.
     - Página 7 se referencia en el paso 7.
     - Página 1 se referencia en el paso 8.
     - Página 0 **no vuelve a ser referenciada jamás** en el resto de la traza.
   - *Resultado:* El algoritmo desaloja a la **Página 0** del Marco 0.
   - ✅ *Resuelve el **Ejercicio 4***.

---

### 🧪 Experimento 1.5: Reemplazo LRU según Última Referencia
1. **Regla de Escala Temporal:**
   - Los números de tiempo aumentan conforme progresa la ejecución; por ende, el menor valor numérico representa el instante más antiguo.
2. **Bajo LRU puro (Último acceso):**
   - P0 ($280$), P1 ($265$), P2 ($270$), P3 ($285$).
   - Menor valor: $265 \implies$ la víctima es **Página 1**.
   - ✅ *Resuelve el **Ejercicio 5***.

---

### 🧪 Experimento 1.6: Algoritmo del Reloj (Segunda Oportunidad)
1. **Procedimiento del Simulador:**
   - Selecciona el algoritmo **`Reloj (Segunda Oportunidad)`**.
   - Disposición circular: P3 ($R=1$), P0 ($R=1$), P2 ($R=0$), P1 ($R=0$). Puntero en P3.
   - Al ocurrir un fallo de página:
     - P3: $R=1 \implies$ segunda oportunidad concedida ($R=0$), puntero avanza.
     - P0: $R=1 \implies$ segunda oportunidad concedida ($R=0$), puntero avanza.
     - P2: encuentra $R=0 \implies$ **Página 2 es desalojada**. Puntero avanza a P1.
   - ✅ *Resuelve el **Ejercicio 6***.

---

## 💥 Laboratorio 2: La Anomalía de Belady
**Ubicación en simulador:** Sección `#belady-simulator`  
**Ejercicio asociado:** **Ejercicio 9**.

### 📋 Cadena de Belady
Cadena canónica: `0, 1, 2, 3, 0, 1, 4, 0, 1, 2, 3, 4` bajo **FIFO**.
- **Con 3 Marcos:** Se producen **9 fallos de página**.
- **Con 4 Marcos (¡Más memoria física!):** Se producen paradójicamente **10 fallos de página**.
- **Fundamento teórico:** FIFO no es un algoritmo de pila y no garantiza la propiedad de inclusión. Por ello, el conjunto de páginas residentes con tres marcos no necesariamente es subconjunto del conjunto residente con cuatro marcos, y el aumento de memoria puede producir más fallos de página.
- ✅ *Resuelve el **Ejercicio 9***.

---

## ⚡ Laboratorio 3: Calculadora de Tiempo de Acceso Efectivo con TLB y Traducción MMU
**Ubicación en simulador:** Sección `#tlb-simulator`  
**Ejercicios asociados:** **Ejercicio 8**, **Ejercicio 10** y **Ejercicio 15**.

### 📋 Modelo Simplificado de 1 Nivel
$$\text{EAT} = \alpha \cdot (t_{\text{TLB}} + t_{\text{RAM}}) + (1 - \alpha) \cdot (t_{\text{TLB}} + 2 \cdot t_{\text{RAM}})$$
*Supuestos del modelo: la página está presente en memoria principal, la tabla tiene un solo nivel y no se consideran fallos de página ni costos adicionales de recarga del TLB.*

1. **Parámetros de Evaluación:**
   - $\alpha = 90\%$ ($0.90$), $t_{\text{TLB}} = 20\text{ ns}$, $t_{\text{RAM}} = 100\text{ ns}$.
   - Acierto: $20 + 100 = 120\text{ ns}$.
   - Fallo: $20 + 2 \times 100 = 220\text{ ns}$.
   - $$\text{EAT} = 0.90 \times 120 + 0.10 \times 220 = 108 + 22 = \mathbf{130.00\text{ ns}}$$
2. **Rendimiento respecto del acceso sin TLB:**
   - Acceso sin TLB: 2 accesos obligatorios a RAM = $200\text{ ns}$.
   - Reducción del tiempo de acceso: $(200 - 130) / 200 = \mathbf{35.0\%}$ respecto del acceso sin TLB.
   - ✅ *Resuelve el **Ejercicio 10***.

### 🧪 Experimento 3.2: Traducción Completa de Dirección Lógica a Física (MMU)
> **Ubicación en el simulador:** Dentro del **Laboratorio 3** (`#tlb-simulator`), en la subsección inferior titulada **"🗺️ Traducción Completa de Dirección Lógica a Física (MMU)"** (`#mmu-panel`).

1. **Procedimiento en el Panel MMU:**
   - Ingresa la dirección virtual en hexadecimal: `0x065C` ($1628$ en decimal).
   - Selecciona tamaño de página: **512 Bytes** ($2^9$ bytes $\implies 9$ bits de desplazamiento).
   - Configura el marco físico en la tabla de páginas: **Marco 10**.
2. **Descomposición y Cálculo Matemático:**
   - Número de página: $p = \lfloor 1628 / 512 \rfloor = \mathbf{3}$ (bits superiores).
   - Desplazamiento (*offset*): $d = 1628 \pmod{512} = \mathbf{92}$ (decimal) = `0x5C` (9 bits de offset).
   - Cálculo de Dirección Física:
     $$\text{Dirección Física} = (\text{Marco} \times \text{Tamaño}) + d = (10 \times 512) + 92 = 5120 + 92 = \mathbf{5212}\ (\text{hex: } \mathbf{0x145C})$$
   - ✅ *Resuelve el **Ejercicio 8***.
3. **Tamaño de Página y Fragmentación Interna:**
   - Un proceso requiere $10.500$ bytes con páginas de $4.096$ bytes ($4\text{ KiB}$):
     - Páginas necesarias: $\lceil 10.500 / 4.096 \rceil = \mathbf{3\text{ páginas}}$ ($12.288$ bytes asignados en total).
     - Fragmentación interna en la última página: $12.288 - 10.500 = \mathbf{1.788\text{ bytes}}$.
   - ✅ *Resuelve el **Ejercicio 15***.

---

## 🌊 Laboratorio 4: Working Set, Hiperpaginación y Control por Frecuencia (PFF)
**Ubicación en simulador:** Sección `#ws-simulator`  
**Ejercicios asociados:** **Ejercicio 11**, **Ejercicio 12** y **Ejercicio 14**.

### 📋 Principio de Peter Denning
Visualiza el Working Set $W(t, \Delta)$ a partir de trazas de referencias con una ventana móvil de tamaño $\Delta$. Observa cómo, al modificar la ventana o la cantidad de marcos disponibles, la demanda total puede superar la memoria física disponible y provocar hiperpaginación.
- Demanda agregada de marcos: $D = \sum |W_i(t, \Delta)|$.
- Si $D > m$ (marcos físicos disponibles en RAM) $\implies$ el modelo predice un **estado inminente de hiperpaginación (thrashing)**, caracterizado por una degradación severa del rendimiento, donde la CPU dedica la mayor parte del tiempo a transferencias de páginas con swap en vez de ejecutar trabajo útil.
- **Acción correctiva del sistema operativo:** suspender temporalmente uno o más procesos o reducir el grado de multiprogramación hasta que la demanda agregada cumpla $D \le m$.

1. **Experimento con Trazas Simuladas:**
   - Con $\Delta = 10$, el proceso P1 con la traza `[2, 6, 1, 5, 7, 7, 7, 1, 6, 2]` genera el conjunto:
     $$W(t, 10) = \{1, 2, 5, 6, 7\}$$
     con una demanda de $|W| = 5$ páginas.
   - ✅ *Resuelve el **Ejercicio 11***.
2. **Causa Primaria de Hiperpaginación:**
   - La condición ocurre cuando $D = \sum \text{WSS}_i > m$ (la demanda agregada de marcos de los conjuntos de trabajo excede la memoria RAM disponible).
   - ✅ *Resuelve el **Ejercicio 12***.
3. **Control por Frecuencia de Fallos de Página (PFF - Page-Fault Frequency):**
   - El sistema operativo monitorea la tasa de fallos de cada proceso estableciendo un **límite superior (*upper threshold*)** y un **límite inferior (*lower threshold*)**.
   - **Tasa > Límite Superior:** El proceso requiere más memoria física para albergar su conjunto de trabajo activo. *Acción correctiva:* asignarle marcos adicionales si existen marcos libres en RAM; de lo contrario, suspender un proceso para reducir la multiprogramación y evitar que el sistema caiga en hiperpaginación.
   - **Tasa < Límite Inferior:** El proceso tiene marcos ociosos en exceso. *Acción:* retirar marcos para reasignarlos a otros procesos.
   - ✅ *Resuelve el **Ejercicio 14***.

---

## 🛠️ Laboratorio 5: Tratamiento de un Fallo de Página (Paso a Paso)
**Ubicación en simulador:** Sección `#pagefault-simulator`  
**Ejercicio asociado:** **Ejercicio 13**.

### 📋 Secuencia Didáctica de 8 Etapas en el Manejo de un Fallo de Página
El simulador interactivo reproduce una secuencia didáctica de 8 etapas que representa el tratamiento general de un fallo de página entre el hardware de la MMU y el sistema operativo:
1. **Etapa 1 (Modo Usuario / CPU):** La instrucción de un proceso referencia una dirección virtual (ej. `0x065C`).
2. **Etapa 2 (Modo Hardware / MMU):** La MMU consulta la TLB y la Tabla de Páginas; al no poder completar la traducción (por ejemplo, por bit de presencia $P = 0$), suspende la instrucción y genera una excepción hacia el sistema operativo.
3. **Etapa 3 (Modo Hardware ➔ Kernel):** La MMU eleva el **trap por fallo de página** (*Page Fault Exception*). La CPU conmuta a Modo Núcleo y guarda el estado del proceso (registros y PC) en la pila del kernel.
4. **Etapa 4 (Modo Kernel / SO):** El SO verifica la legalidad de la dirección en el PCB:
   - *Si es ilegal:* el sistema operativo notifica una violación de acceso y finaliza el proceso (en sistemas tipo Unix puede utilizarse la señal SIGSEGV).
   - *Si es legal:* localiza el bloque de disco correspondiente en el área de intercambio (*swap*).
5. **Etapa 5 (Modo Kernel / SO):** Búsqueda de marco físico en RAM:
   - *Si hay marco libre:* se asigna directamente (Escenario 1).
   - *Si la memoria está llena:* el algoritmo de reemplazo (ej. FIFO, Reloj, NRU) selecciona una página víctima (Escenarios 2 y 3).
6. **Etapa 6 (Modo Kernel / SO):** Inspección del bit sucio (*dirty bit*, $M$):
   - *Si $M = 0$ (Limpia):* la página en RAM es idéntica a su copia en disco swap; se desaloja directamente sin escribir a swap (ahorro de I/O).
   - *Si $M = 1$ (Modificada / Sucia):* el SO **debe escribir obligatoriamente la víctima en disco swap (*swap-out*)** antes de reutilizar el marco.
7. **Etapa 7 (Modo Kernel / E/S Disco):** El SO programa la lectura de la página solicitada desde el swap hacia el marco liberado (*swap-in*). Actualiza la Tabla de Páginas asignando el marco y configurando $P = 1, M = 0$.
8. **Etapa 8 (Modo Kernel ➔ Usuario):** El SO restaura los registros de la CPU y el Program Counter original. Conmuta a Modo Usuario y **reinicia de forma transparente exactamente la misma instrucción** interrumpida, completando el acceso exitosamente.

### 🧪 Experimento 5.1: Víctima Modificada ($M = 1$)
1. Selecciona el escenario **`💾 3. Memoria Llena - Víctima Modificada (M=1)`**.
2. Presiona **`⏭️ Siguiente Etapa`** sucesivamente.
3. Observa en la **Etapa 6** que, al tener $M = 1$, el SO no puede simplemente sobreescribir el marco: debe emitir la escritura obligatoria en disco swap (*swap-out*) y esperar a que culmine la transferencia antes de realizar el *swap-in* en la **Etapa 7**.
4. ✅ *Resuelve el **Ejercicio 13***.

---

## 📊 Matriz de Autochequeo: De la Simulación a la Evaluación

| N° | Ejercicio Evaluativo | Simulador / Tópico | Parámetros Clave | Resultado Objetivo |
| :-: | :--- | :--- | :--- | :--- |
| **1** | FIFO con 4 Marcos | Lab 1 (Reemplazo) | Traza canónica `0 1 7 2 3 2 7 1 3` | `5 fallos de página` |
| **2** | NFU con envejecimiento | Lab 1 (Aging) / Diapos U9 | Traza `A B C D A B E`, desempate menor marco | `Página C (Marco 2)` |
| **3** | NRU Bits R/M | Lab 1 (Reemplazo) | P0(1,0), P1(0,0), P2(0,0), P3(1,1) | `Clase 0: P1 y P2` |
| **4** | Algoritmo Óptimo (OPT) | Lab 1 (Reemplazo) | Traza canónica, paso 5 (ref a pág 3) | `Página 0` |
| **5** | LRU Último Acceso | Concepto temporal | P0(280), P1(265), P2(270), P3(285) | `Página 1` |
| **6** | Algoritmo del Reloj | Lab 1 (Reemplazo) | Anillo P3(1), P0(1), P2(0), P1(0) | `Página 2` |
| **7** | Reemplazo Local/Global | Concepto | Multiprogramación concurrente | `Local: mismo proceso / Global: cualquiera` |
| **8** | Traducción MMU (0x065C)| Lab 3 (Panel MMU) | Pág de 512 B, Marco 10 ($10 \times 512 + 92$) | `Página 3, desplazamiento 92, dirección física 5212 (0x145C)` |
| **9** | Anomalía de Belady | Lab 2 (Belady) | Cadena 0 1 2 3 0 1 4 0 1 2 3 4 con 4 marcos | `10 fallos de página` |
| **10** | Tiempo Acceso Efectivo | Lab 3 (Calculadora TLB)| $\alpha=0.9$, $t_{\text{TLB}}=20$, $t_{\text{RAM}}=100$ | `130.00 ns` |
| **11** | Modelo Working Set | Lab 4 (Working Set) | Traza de P1 en $\Delta=10$ | `{1, 2, 5, 6, 7}` |
| **12** | Causa de Hiperpaginación| Lab 4 (Working Set) | Condición analítica de sobrecarga | `D = Σ WSS > m` |
| **13** | Fallo con Víctima $M=1$| Lab 5 (Tratamiento) | Escenario 3: memoria llena, bit dirty $M=1$ | `Escribir la víctima en disco swap, cargar la nueva página en el marco liberado, actualizar la tabla (P=1, M=0) y reiniciar la instrucción.` |
| **14** | Control por PFF | Lab 4 (Panel PFF) | Tasa de fallos supera límite superior | `Asignarle marcos adicionales de memoria física si existen marcos libres; de lo contrario, suspender un proceso para reducir el grado de multiprogramación.` |
| **15** | Fragmentación Interna | Lab 3 (Paginación) | Proceso de 10.500 B con páginas de 4.096 B | `3 páginas asignadas (12.288 bytes totales) y 1.788 bytes de fragmentación interna.` |

---

### 🏁 Flujo de Entrega
1. Abre `index.html` en tu navegador.
2. Experimenta con cada uno de los 5 laboratorios siguiendo esta guía paso a paso.
3. Resuelve los 15 ejercicios de autoevaluación.
4. Exporta tu archivo `respuestas_tp7.json`.
5. Ejecuta en terminal:
   ```bash
   python autograder_tp7.py
   ```
6. Constata tu calificación de **100/100 pts (Nota: 10.0 / 10.0)** antes de realizar el commit y push final a GitHub Classroom.
