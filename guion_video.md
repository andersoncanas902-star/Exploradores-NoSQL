# Guion / checklist para el video (máximo 10 minutos)

**Importante:** este archivo es solo el guion y la lista de lo que hay que mostrar. La IA no puede grabar el video — eso lo tienes que hacer tú, con tu propia voz explicando cada parte. Usa este guion como libreto, no lo leas palabra por palabra, dilo con tus palabras.

## 0. Antes de grabar

- Abre mongosh en la carpeta `Unidad 3/Tareas/S1. Tarea. Exploradores NoSQL/`.
- Ten listos los 5 archivos `.js` en orden (01 a 05) para hacer `load(...)` de cada uno sin perder tiempo buscando.
- Opcional: ten MongoDB Compass abierto en otra pestaña para mostrar las colecciones de forma visual, si quieres complementar la terminal.

## 1. Introducción (0:00 - 1:00)

- Preséntate: nombre, curso (Base de Datos 2), y el nombre de la actividad ("Exploradores NoSQL").
- Explica en una frase el contexto: sistema de hospitalización de la Secretaría de Salud de Antioquia, y que elegiste MongoDB (documental) en vez de Neo4j (grafos).
- Menciona que trabajaste individualmente, aclarando que la nomenclatura del curso habla de "equipos" pero que no tuviste compañeros asignados.

## 2. El esquema: qué había y qué agregaste (1:00 - 2:30)

- Muestra `schema.json` (puedes tenerlo abierto en el editor de texto, a un lado de la terminal).
- Explica rápido: ya existían pacientes, hospitalizaciones (con diagnósticos y alta embebidos), notas de evolución, signos vitales, órdenes de medicamento y notas de enfermería.
- Explica qué faltaba y qué agregaste: `medicos` y `camas`, como colecciones propias, y por qué las referenciaste en vez de embeberlas (un médico o una cama se reutilizan muchas veces, no tiene sentido copiarlos en cada documento).

## 3. Mostrar las colecciones en mongosh (2:30 - 3:30)

```js
use hce_hospitalizacion_grupo_6
show collections
db.medicos.find().limit(2)
db.camas.find().limit(2)
```
- Señala en pantalla que ya existen `medicos` y `camas`, y que las hospitalizaciones ahora tienen `medico_id` y `cama_id`.

## 4. CRUD en vivo (3:30 - 7:00)

Ejecuta (o copia y pega) cada bloque de `04_crud.js` por separado, explicando qué hace cada uno antes de correrlo:

1. **Create:** insertar el nuevo paciente, su hospitalización (ya con `medico_id` y `cama_id`) y la orden de medicamento.
2. **Update simple:** cambiar el teléfono de un paciente.
3. **Update anidado (objeto):** cambiar el teléfono del contacto de emergencia (`contacto_emergencia.telefono`).
4. **Update anidado (arreglo):** agregar un diagnóstico secundario con `$push`.
5. **Update anidado (subdocumento completo):** llenar el campo `alta` de una hospitalización que estaba activa.
6. **Soft delete:** liberar una cama (cambiar su estado) y marcar un paciente como inactivo, explicando por qué no se puede borrar una historia clínica de verdad (razón legal, Ley 1581).
7. **Hard delete:** insertar y luego eliminar el registro de prueba, explicando que ahí sí es una eliminación real y definitiva, porque es un dato de prueba, no un dato clínico.

## 5. Las 4 consultas avanzadas (7:00 - 9:30)

Ejecuta cada consulta de `05_consultas_avanzadas.js` una por una y explica en una frase qué responde cada una, antes de mostrar el resultado:

1. Ocupación de camas por servicio — "¿cuántas camas libres queda en cada servicio ahora mismo?"
2. Carga de pacientes por médico — "¿qué médico tiene más pacientes a cargo, y quién no tiene ninguno todavía?"
3. Días de estancia promedio por servicio — "¿qué servicio tiene las hospitalizaciones más largas?"
4. Diagnósticos más frecuentes — "¿qué está llegando más seguido al hospital?"

## 6. Cierre (9:30 - 10:00)

- Resume en 2-3 frases qué aprendiste de este ajuste al esquema (ej. la diferencia entre embeber y referenciar cuando la entidad se reutiliza mucho, o el riesgo de que Mongo no te obligue a declarar los campos nuevos).
- Menciona dónde queda el repositorio (enlace de GitHub) y agradece.

## Checklist rápido antes de subir el video

- [ ] Se ve la cara o al menos se escucha claro tu voz explicando (revisa las normas de tu curso sobre esto).
- [ ] Se muestran las 2 colecciones nuevas.
- [ ] Se ejecutan y explican las 7 operaciones del CRUD (create, update simple, 2 updates anidados más el de alta, soft delete x2, hard delete).
- [ ] Se ejecutan y explican las 4 consultas avanzadas.
- [ ] Dura 10 minutos o menos.
- [ ] El enlace del video queda pegado en el informe final / en la entrega de la plataforma.
