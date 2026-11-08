# S1. Tarea. Exploradores NoSQL — Hospitalización (MongoDB)

Continuación de la actividad de la Unidad 2 (`Tareas/Tarea. Construyendo una base de datos NoSQL/`), sobre la misma base de datos: `hce_hospitalizacion_grupo_6` (MongoDB local). Rol: analista NoSQL para el sistema de hospitalización de la Secretaría de Salud de Antioquia. Tecnología elegida: **MongoDB (documental)**, no grafos.

Esta Unidad 3 **no crea una base nueva ni borra nada**: amplía el esquema que ya existía agregando dos entidades que faltaban — **médicos** y **camas** — y agrega CRUD completo y 4 consultas de agregación nuevas.

## Qué se agregó frente a la Unidad 2

- Colección **medicos** (7 documentos): los 5 médicos que ya aparecían como texto suelto en la Unidad 2, convertidos en entidad propia, más 2 médicos nuevos sin pacientes asignados todavía.
- Colección **camas** (16 documentos): entidad nueva que no existía, repartida en 4 servicios (UCI, Cirugía General, Medicina Interna, Ortopedia y Traumatología), con estado `libre` / `ocupada` / `mantenimiento`.
- Las colecciones `hospitalizaciones`, `ordenes_medicamento` y `notas_evolucion` ahora tienen un campo `medico_id` (y `hospitalizaciones` también `cama_id`), referenciando a las colecciones nuevas, sin borrar los campos de texto que ya tenían (se conservan como histórico).
- `medicos` también tiene un contador denormalizado `total_altas_dadas`, que se actualiza con `$inc` en el CRUD cada vez que ese médico da una alta (ver la sección "decisión de diseño" en `schema.json` y la operación multi-colección en `04_crud.js`).
- Justificación completa de embedding vs. referencing para las dos entidades nuevas: ver `schema.json`.

## Estado

- [x] Esquema ajustado (`schema.json`).
- [x] Colecciones `medicos` y `camas` creadas, con validación e índices (`01_create_medicos_camas.js`).
- [x] 7 médicos y 16 camas de prueba cargados (`02_insert_medicos_camas.js`).
- [x] Las 10 hospitalizaciones de la Unidad 2 vinculadas a médico y cama reales (`03_vincular_existentes.js`).
- [x] CRUD completo ejecutado: insertar, actualizar campo simple, actualizar campo anidado (objeto y arreglo), una operación multi-colección (dar de alta: hospitalización + cama + médico a la vez), soft delete (paciente inactivo) y eliminación definitiva real de un registro de prueba (`04_crud.js`).
- [x] 4 consultas de agregación avanzadas nuevas, distintas a las de la Unidad 2 y a las del Foro U3 (`05_consultas_avanzadas.js`).
- [x] `evidencia_ia.md`, `reflexion_etica.md`, `division_trabajo.md` completos.
- [x] Guion de video (`guion_video.md`) — **pendiente de grabar**, no lo puede hacer la IA.
- [ ] **Capturas de pantalla reales** de mongosh/Compass para cada operación y cada consulta (pendiente — tienes que tomarlas tú, ver instrucciones abajo).
- [ ] Informe final en PDF armado y revisado.
- [ ] Video grabado y enlace pegado en el informe/entrega.
- [ ] Repositorio subido a GitHub.
- [ ] Entrega realizada en la plataforma del curso.

## Cómo volver a ejecutar todo desde cero

```powershell
cd "C:\Users\Usuario\OneDrive\Documentos\PB\Semestre 4\Base de datos 2\Unidad 3\Tareas\S1. Tarea. Exploradores NoSQL"
mongosh
```

Dentro de mongosh (en este orden, cada uno depende del anterior):
```js
use hce_hospitalizacion_grupo_6
load("01_create_medicos_camas.js")
load("02_insert_medicos_camas.js")
load("03_vincular_existentes.js")
load("04_crud.js")
load("05_consultas_avanzadas.js")
```

**Importante:** `04_crud.js` inserta documentos de prueba (`PAC011`, `HOSP011`, etc.) y modifica datos reales (da de alta a `HOSP008`, marca `PAC009` como inactiva). Si lo corres dos veces, va a fallar al intentar insertar `PAC011` de nuevo porque el `_id` ya existe (es el comportamiento esperado de un `insertOne`, no es un error del script). Si necesitas repetirlo desde cero, borra esos documentos de prueba primero.

## Dónde tomar las capturas que faltan

Para el informe en PDF necesitas pegar capturas reales de tu pantalla (mongosh o Compass) de:
1. Las 2 colecciones nuevas creadas (`show collections` o `db.getCollectionNames()`).
2. Cada operación del CRUD en `04_crud.js` (idealmente una por cada bloque CREATE/UPDATE/DELETE).
3. El resultado de cada una de las 4 consultas de `05_consultas_avanzadas.js`.

Ninguna de esas capturas la puede generar la IA — tienen que ser pantallazos reales de tu terminal.

## Archivos de esta carpeta

| Archivo | Contenido |
|---|---|
| `schema.json` | Ajuste del esquema: qué se agregó y por qué (embedding vs. referencing) |
| `01_create_medicos_camas.js` | Crea `medicos` y `camas`, actualiza validadores |
| `02_insert_medicos_camas.js` | Carga 7 médicos y 16 camas de prueba |
| `03_vincular_existentes.js` | Conecta las hospitalizaciones viejas con médico y cama reales |
| `04_crud.js` | CRUD completo: insertar, actualizar (simple y anidado), soft delete, hard delete |
| `05_consultas_avanzadas.js` | Las 4 consultas de agregación nuevas (ocupación, carga médica, estancia, frecuencia de diagnósticos) |
| `evidencia_ia.md` | Evidencia de uso de IA |
| `reflexion_etica.md` | Reflexión ética |
| `division_trabajo.md` | Aclaración de trabajo individual |
| `guion_video.md` | Guion/checklist para grabar el video (máx. 10 minutos) |
