# Evidencia de uso de IA

**Herramienta usada:** Claude (Anthropic), modelo Claude Sonnet 5, a través de Claude Code (agente con acceso a mi sistema de archivos y a mi terminal, para que pudiera ejecutar los scripts contra mi base real, no solo escribirlos).

A continuación dejo casos concretos y trazables de interacciones reales que ocurrieron construyendo este entregable: qué le pedí, qué devolvió, y qué mejoró específicamente eso frente a lo que yo habría hecho solo o a una primera versión sin revisar.

---

**Caso 1 — Diseño del ajuste del esquema**
- **Prompt (resumido):** "La Unidad 2 ya tiene pacientes, hospitalizaciones, diagnósticos y medicamentos, pero falta modelar médicos y camas como entidades propias. Diseña cómo agregarlas, justificando embedding vs. referencing igual que en el trabajo anterior, sin romper lo que ya existe."
- **Resultado:** `schema.json` con dos colecciones nuevas (`medicos`, `camas`), la decisión de referenciarlas (no embeberlas) y una decisión explícita de denormalización controlada (`camas.hospitalizacion_actual_id`).
- **Qué mejoró:** sin ese análisis yo habría tendido a meter el nombre del médico como texto en cada colección (como ya estaba en la Unidad 2) sin darme cuenta del problema real: no poder saber la carga de trabajo de un médico ni la disponibilidad de camas en tiempo real sin recorrer todo.

**Caso 2 — Generación de los scripts ejecutables**
- **Prompt (resumido):** "Genera los scripts .js para crear las colecciones nuevas, cargar datos de prueba, vincular las 10 hospitalizaciones que ya existían, el CRUD completo y 4 consultas de agregación nuevas, con comentarios en tono natural de estudiante."
- **Resultado:** los 5 scripts `01` a `05` de esta carpeta.
- **Qué mejoró:** pasó el diseño de papel a una base de datos real poblada y consultable en minutos, algo que a mano (escribiendo cada `insertMany` y cada pipeline de agregación) me habría tomado mucho más tiempo y con más errores de sintaxis.

**Caso 3 — Depuración de un error real contra el motor**
- **Prompt (resumido):** al correr `05_consultas_avanzadas.js` por primera vez, la Consulta 3 falló con `MongoServerError: The $round accumulator is a unary operator`.
- **Resultado:** la IA identificó que en esta versión de MongoDB no se puede escribir `$round` envolviendo directamente a `$avg` dentro del mismo `$group` (se interpreta mal como si `$round` fuera el acumulador), y separó la consulta en dos etapas: primero `$group` sin redondear, después un `$project` aparte que sí aplica `$round`.
- **Qué mejoró:** corrigió un bug real, verificado contra mi instalación de Mongo (no un error hipotético de un tutorial), y de paso me enseñó una limitación concreta del lenguaje de agregación que no sabía.

**Caso 4 — Autoevaluación contra la rúbrica real del curso**
- **Prompt (resumido):** "Aquí está la rúbrica exacta con 5 criterios de 5 puntos. Autoevalúa el entregable contra cada banda y mejora lo que haga falta para la banda máxima, sin inflar lo que no puedes controlar (video, repositorio en GitHub)."
- **Resultado:** se agregó un contador denormalizado (`medicos.total_altas_dadas`) y una operación explícita que toca 3 colecciones a la vez (dar de alta = hospitalización + cama + médico), comentarios de "por qué" en cada paso del CRUD, la relevancia clínica/epidemiológica de cada consulta para la Gobernación de Antioquia, y este mismo formato trazable de evidencia de IA.
- **Qué mejoró:** obligó a que el código no solo "funcionara", sino que dejara explícito el razonamiento detrás de cada decisión técnica — que es justo lo que la rúbrica pide para la banda más alta.

---

**Qué hice yo, más allá de pedir y copiar:**
- Ejecuté cada script en orden contra mi base de datos real antes de aceptar cualquier versión como definitiva (incluyendo volver a correr todo después de las mejoras de este caso 4).
- Revisé que la asignación de camas y médicos a las hospitalizaciones viejas tuviera sentido clínico y operativo (mismo servicio, camas activas coherentes con el estado real de cada hospitalización).
- Decidí yo mismo qué tan lejos llevar la denormalización (el contador de altas) entendiendo el riesgo que eso implica, riesgo que después desarrollé en `reflexion_etica.md`.
- Tomé mis propias capturas de pantalla de la ejecución real para el informe.

**Nota de honestidad académica:** declaro el uso de IA tal como lo pide el enunciado, sin ocultarlo. Claude generó directamente el código, los datos de prueba y el armado del informe; la ejecución contra el motor real, la verificación de resultados y la postura ética final son mías.

**Capturas incluidas en el PDF (sección "Evidencia de IA"):**
- `[CAPTURA: fragmento de esta conversación con Claude, mostrando el diseño de medicos/camas y la corrección del error de $round]`
