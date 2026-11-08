// 01_create_medicos_camas.js
// Ejecutar con: load("01_create_medicos_camas.js") dentro de mongosh, ya parado en esta carpeta.
// Esto NO borra nada de lo que ya existe de la Unidad 2 (pacientes, hospitalizaciones, etc).
// Solo hace 2 cosas:
//   1) crea las 2 colecciones nuevas que pide la Unidad 3: medicos y camas.
//   2) le avisa a Mongo (con collMod) que hospitalizaciones, ordenes_medicamento y
//      notas_evolucion ahora PUEDEN tener un campo medico_id (y hospitalizaciones un cama_id).
//      Esto no era obligatorio porque Mongo deja agregar campos nuevos aunque el validador
//      no los mencione, pero lo hago igual para dejar el validador actualizado y que cualquiera
//      que lea el esquema sepa que esos campos existen oficialmente.

use("hce_hospitalizacion_grupo_6");

// ---------- 1) COLECCION NUEVA: MEDICOS ----------
// Es coleccion propia y referenciada (ver schema.json) porque un mismo medico aparece
// en muchisimas hospitalizaciones, ordenes y notas; si lo embebieramos tocaria repetir
// su nombre y especialidad cientos de veces.
if (!db.getCollectionNames().includes("medicos")) {
  db.createCollection("medicos", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "nombre_completo", "documento_identidad", "registro_medico", "especialidad"],
        properties: {
          _id: { bsonType: "string" }, // usamos codigos "MED001" igual que con pacientes y hospitalizaciones
          nombre_completo: { bsonType: "string" },
          documento_identidad: {
            bsonType: "object",
            required: ["tipo", "numero"],
            properties: {
              tipo: { enum: ["CC", "CE"] },
              numero: { bsonType: "string" }
            }
          },
          registro_medico: { bsonType: "string" }, // la "tarjeta profesional" del medico, es unica
          especialidad: { bsonType: "string" },
          servicio_principal: { bsonType: "string" },
          telefono: { bsonType: "string" },
          activo: { bsonType: "bool" }, // si sigue trabajando en el hospital o ya no
          // contador DENORMALIZADO (a proposito, igual que hospitalizacion_actual_id en camas):
          // cuantas altas ha dado este medico en total. Se podria calcular siempre con un
          // $lookup a hospitalizaciones (como hace la Consulta 2 de 05_consultas_avanzadas.js),
          // pero tener tambien el contador ya sumado sirve para un reporte rapido tipo
          // "ranking de medicos" sin tener que correr una agregacion cada vez. El precio es que
          // la aplicacion (aqui, 04_crud.js) debe sumarle 1 manualmente cada vez que ese medico
          // da una alta; si se olvida, el contador queda desactualizado (riesgo que se discute
          // en reflexion_etica.md, seccion de trazabilidad).
          total_altas_dadas: { bsonType: "int" }
        }
      }
    }
  });
  print("Coleccion 'medicos' creada.");
} else {
  print("La coleccion 'medicos' ya existia, no se vuelve a crear.");
}
db.medicos.createIndex({ registro_medico: 1 }, { unique: true }); // no pueden existir 2 medicos con la misma tarjeta profesional
db.medicos.createIndex({ especialidad: 1 }); // para buscar rapido "todos los internistas", etc.

// ---------- 2) COLECCION NUEVA: CAMAS ----------
// Tambien es coleccion propia y referenciada: una cama se reutiliza con pacientes distintos
// a lo largo del tiempo, y necesitamos poder preguntar "cuantas camas libres hay AHORA" sin
// tener que recorrer toda la historia de hospitalizaciones.
if (!db.getCollectionNames().includes("camas")) {
  db.createCollection("camas", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "numero_cama", "piso", "servicio", "estado"],
        properties: {
          _id: { bsonType: "string" }, // "CAMA001", "CAMA002", etc.
          numero_cama: { bsonType: "string" }, // el numero que se ve fisicamente en la puerta del cuarto, ej "301"
          piso: { bsonType: "int" },
          servicio: { bsonType: "string" }, // Medicina Interna, Cirugia General, Ortopedia y Traumatologia, UCI...
          estado: { enum: ["libre", "ocupada", "mantenimiento"] },
          // hospitalizacion_actual_id es un dato "duplicado a proposito" (ver schema.json,
          // decision_de_diseno_denormalizacion_controlada): se podria calcular buscando en
          // hospitalizaciones, pero guardarlo aqui hace que "que camas estan libres" sea
          // una consulta instantanea, que es justo lo que un hospital necesita a cada rato.
          hospitalizacion_actual_id: { bsonType: ["string", "null"] }
        }
      }
    }
  });
  print("Coleccion 'camas' creada.");
} else {
  print("La coleccion 'camas' ya existia, no se vuelve a crear.");
}
db.camas.createIndex({ numero_cama: 1 }, { unique: true }); // no pueden existir 2 camas con el mismo numero
db.camas.createIndex({ servicio: 1, estado: 1 }); // acelera "cuantas camas libres hay en tal servicio"

// ---------- 3) AJUSTE DEL VALIDADOR DE LAS COLECCIONES QUE YA EXISTIAN ----------
// Agrego medico_id (y cama_id en hospitalizaciones) como campos OPCIONALES en el validador.
// No marco los campos de texto viejos (medico_tratante, medico, medico_ordena) como obsoletos:
// se quedan tal cual, como una "foto" del nombre del medico en ese momento (ver schema.json).

db.runCommand({
  collMod: "hospitalizaciones",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "paciente_id", "fecha_admision", "servicio", "estado", "diagnosticos"],
      properties: {
        _id: { bsonType: "string" },
        paciente_id: { bsonType: "string" },
        fecha_admision: { bsonType: "string" },
        motivo_admision: { bsonType: "string" },
        servicio: { bsonType: "string" },
        medico_tratante: { bsonType: "string" }, // historico de texto, se conserva igual que en la U2
        medico_id: { bsonType: ["string", "null"] }, // NUEVO: referencia real a medicos._id
        cama_id: { bsonType: ["string", "null"] },   // NUEVO: referencia real a camas._id
        estado: { enum: ["activa", "dada_de_alta"] },
        diagnosticos: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["codigo_cie10", "descripcion", "tipo"],
            properties: {
              codigo_cie10: { bsonType: "string" },
              descripcion: { bsonType: "string" },
              tipo: { enum: ["principal", "secundario"] },
              fecha: { bsonType: "string" }
            }
          }
        },
        alta: { bsonType: ["object", "null"] }
      }
    }
  }
});
print("Validador de 'hospitalizaciones' actualizado con medico_id y cama_id.");

db.runCommand({
  collMod: "ordenes_medicamento",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["hospitalizacion_id", "medicamento", "dosis", "via", "frecuencia", "estado"],
      properties: {
        hospitalizacion_id: { bsonType: "string" },
        medicamento: { bsonType: "string" },
        dosis: { bsonType: "string" },
        via: { bsonType: "string" },
        frecuencia: { bsonType: "string" },
        fecha_inicio: { bsonType: "string" },
        fecha_fin: { bsonType: ["string", "null"] },
        medico_ordena: { bsonType: "string" }, // historico de texto
        medico_id: { bsonType: ["string", "null"] }, // NUEVO
        estado: { enum: ["activa", "suspendida", "finalizada"] }
      }
    }
  }
});
print("Validador de 'ordenes_medicamento' actualizado con medico_id.");

db.runCommand({
  collMod: "notas_evolucion",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["hospitalizacion_id", "fecha", "medico", "nota"],
      properties: {
        hospitalizacion_id: { bsonType: "string" },
        fecha: { bsonType: "string" },
        medico: { bsonType: "string" }, // historico de texto
        medico_id: { bsonType: ["string", "null"] }, // NUEVO
        nota: { bsonType: "string" }
      }
    }
  }
});
print("Validador de 'notas_evolucion' actualizado con medico_id.");

print("\nListo. Colecciones actuales en la base:");
print(db.getCollectionNames());
