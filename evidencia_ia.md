# Evidencia de uso de IA

**Herramienta usada:** Claude (Anthropic), modelo Claude Sonnet 5, a través de Claude Code.

**Qué generó directamente la IA (archivos técnicos del repositorio):**
1. El ajuste del esquema documental (`schema.json`): el diseño de las dos colecciones nuevas (`medicos` y `camas`), la decisión de referenciarlas en vez de embeberlas, y la decisión de guardar `hospitalizacion_actual_id` dentro de `camas` como una denormalización controlada.
2. Los scripts de MongoDB listos para ejecutar en mongosh: `01_create_medicos_camas.js`, `02_insert_medicos_camas.js`, `03_vincular_existentes.js`, `04_crud.js` y `05_consultas_avanzadas.js`.
3. Los datos de prueba de los médicos y las camas nuevas, y el mapeo para conectar las 10 hospitalizaciones que ya existían con un médico y una cama reales.
4. Las 4 consultas de agregación avanzadas (ocupación de camas por servicio, carga de pacientes por médico, días de estancia promedio por servicio, frecuencia de diagnósticos).
5. El armado del informe final en PDF, a partir del esquema, las capturas y los textos ya escritos.

**Qué hice yo, más allá de copiar y pegar:**
- Ejecuté cada script en orden contra mi base de datos real (MongoDB local) antes de darlos por buenos, y corregí junto con la IA un error real que salió al correr la consulta 3 (`$round` no se podía usar directo dentro de un `$avg` en esa versión de Mongo).
- Revisé que la asignación de camas y médicos a las hospitalizaciones viejas tuviera sentido (que la cama fuera del mismo servicio que la hospitalización, que las camas de las hospitalizaciones activas quedaran "ocupadas" y las demás "libres").
- Verifiqué los resultados de las 4 consultas nuevas y los comparé contra lo que esperaba a mano (ej. que Medicina Interna tuviera más camas ocupadas que los demás servicios, porque es el servicio con más movimiento en la base).
- Tomé mis propias capturas de pantalla de la ejecución real en mongosh (ver carpeta de capturas) para el informe.

**Nota de honestidad académica:** declaro el uso de IA tal como lo pide el enunciado, sin ocultarlo. Claude generó directamente el código, los datos de prueba y el armado del informe; la ejecución contra el motor real, la verificación de los resultados y la reflexión ética que sustenta mi postura son mías.

**Capturas incluidas en el PDF (sección "Evidencia de IA"):**
- `[CAPTURA: fragmento de esta conversación con Claude, mostrando el diseño de medicos/camas]`
