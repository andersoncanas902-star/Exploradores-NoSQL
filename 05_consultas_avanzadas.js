// 05_consultas_avanzadas.js
// Ejecutar con: load("05_consultas_avanzadas.js") despues de 04_crud.js
//
// 4 consultas de agregacion NUEVAS para la Unidad 3 (no son las mismas de la Unidad 2
// ni las del Foro U3: esas eran sobre diagnosticos/evolucion/signos vitales/servicios;
// estas 4 aprovechan las colecciones nuevas medicos y camas para ver patrones de
// ocupacion, carga de trabajo, tiempos de estancia y frecuencia de diagnosticos).

use("hce_hospitalizacion_grupo_6");

// ================================================================
// CONSULTA 1: Ocupacion de camas por servicio
// Pregunta que responde: ¿cuantas camas libres y ocupadas tiene AHORA cada
// servicio, y que porcentaje de ocupacion representa?
// Por que le importa a la Gobernacion de Antioquia: con hospitales publicos
// reportando esto, la Secretaria de Salud podria ver en un tablero en que
// municipios/servicios ya no hay camas disponibles y decidir a donde remitir
// pacientes nuevos o donde reforzar personal, en vez de enterarse del
// problema cuando ya no hay donde atender a alguien.
// Etapas: $match -> $group -> $project -> $sort
// ================================================================
print("\n=== CONSULTA 1: Ocupacion de camas por servicio ===");
db.camas.aggregate([
  { $match: { estado: { $in: ["libre", "ocupada"] } } }, // las de mantenimiento no cuentan como "disponibles ni ocupadas"
  {
    $group: {
      _id: "$servicio",
      total_camas: { $sum: 1 },
      ocupadas: { $sum: { $cond: [{ $eq: ["$estado", "ocupada"] }, 1, 0] } } // cuenta solo las que estan ocupada
    }
  },
  {
    $project: {
      _id: 0,
      servicio: "$_id",
      total_camas: 1,
      ocupadas: 1,
      libres: { $subtract: ["$total_camas", "$ocupadas"] },
      porcentaje_ocupacion: { $round: [{ $multiply: [{ $divide: ["$ocupadas", "$total_camas"] }, 100] }, 1] }
    }
  },
  { $sort: { porcentaje_ocupacion: -1 } } // el servicio mas lleno primero
]).forEach(doc => printjson(doc));


// ================================================================
// CONSULTA 2: Carga de pacientes por medico (incluye medicos con 0)
// Pregunta que responde: ¿que medico tiene mas hospitalizaciones a cargo, cuantas
// de esas siguen activas ahora mismo, y que medicos todavia no tienen a nadie
// asignado?
// Por que le importa a la Gobernacion de Antioquia: permite ver si la carga de
// trabajo esta repartida de forma pareja entre el personal medico de un servicio,
// o si unos pocos medicos estan sobrecargados mientras otros estan disponibles,
// algo clave para decidir donde reforzar turnos o redistribuir personal.
// Nota: "total_hospitalizaciones" se calcula aqui EN VIVO con $lookup (siempre
// exacto, pero recalculando cada vez); medicos.total_altas_dadas (ver 01 y 04) es
// un contador ya sumado para consultas rapidas tipo ranking. Son dos formas
// distintas de responder preguntas parecidas, cada una con su costo/beneficio.
// Etapas: $lookup -> $project -> $sort
// ================================================================
print("\n=== CONSULTA 2: Carga de hospitalizaciones por medico ===");
db.medicos.aggregate([
  {
    // desde medicos, busco todas las hospitalizaciones donde medico_id coincida con mi _id
    $lookup: {
      from: "hospitalizaciones",
      localField: "_id",
      foreignField: "medico_id",
      as: "hospitalizaciones_atendidas"
    }
  },
  {
    $project: {
      _id: 0,
      medico: "$nombre_completo",
      especialidad: 1,
      total_hospitalizaciones: { $size: "$hospitalizaciones_atendidas" }, // cuantas en total
      activas_ahora: {
        // de esas, cuantas siguen con estado "activa" en este momento
        $size: {
          $filter: {
            input: "$hospitalizaciones_atendidas",
            as: "h",
            cond: { $eq: ["$$h.estado", "activa"] }
          }
        }
      }
    }
  },
  { $sort: { total_hospitalizaciones: -1 } } // el medico con mas carga primero
]).forEach(doc => printjson(doc));


// ================================================================
// CONSULTA 3: Tiempo de estancia promedio por servicio
// Pregunta que responde: ¿que servicio tiene, en promedio, las hospitalizaciones
// mas largas? Solo se cuentan las que YA tienen alta (si sigue activa todavia no
// se sabe cuanto va a durar, incluirla danaria el promedio).
// Por que le importa a la Gobernacion de Antioquia: la estancia promedio es uno
// de los indicadores que mas se usa para planear cuantas camas necesita cada
// servicio (si Medicina Interna siempre tiene estancias largas, necesita mas
// camas que un servicio con pacientes que entran y salen rapido) y para detectar
// si un servicio se esta demorando mas de lo esperado en dar salida a sus
// pacientes, lo que puede significar sobrecarga o un problema de gestion.
// Etapas: $match -> $project -> $group -> $project -> $sort
// (nota: $round no se puede escribir directo dentro de un $avg en el mismo
// $group en esta version de Mongo, por eso el redondeo queda en un $project
// aparte, despues de agrupar).
// ================================================================
print("\n=== CONSULTA 3: Dias de estancia promedio por servicio ===");
db.hospitalizaciones.aggregate([
  { $match: { alta: { $ne: null } } }, // solo las que ya terminaron
  {
    $project: {
      servicio: 1,
      // dateDiff calcula cuantos dias completos pasaron entre el ingreso y el alta
      dias_estancia: {
        $dateDiff: {
          startDate: { $toDate: "$fecha_admision" },
          endDate: { $toDate: "$alta.fecha_alta" },
          unit: "day"
        }
      }
    }
  },
  {
    $group: {
      _id: "$servicio",
      estancia_promedio_dias: { $avg: "$dias_estancia" }, // promedio sin redondear todavia
      total_casos: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      servicio: "$_id",
      estancia_promedio_dias: { $round: ["$estancia_promedio_dias", 1] }, // ahora si redondeo a 1 decimal
      total_casos: 1
    }
  },
  { $sort: { estancia_promedio_dias: -1 } } // el servicio con estancias mas largas primero
]).forEach(doc => printjson(doc));


// ================================================================
// CONSULTA 4: Diagnosticos mas frecuentes (patron epidemiologico)
// Pregunta que responde: ¿que diagnosticos CIE-10 son los mas comunes en la
// base, y en que servicios aparecen?
// Por que le importa a la Gobernacion de Antioquia: esto es justo el tipo de
// dato que alimenta la vigilancia epidemiologica departamental (ej. si de
// repente sube mucho un diagnostico respiratorio en varios hospitales a la vez,
// podria ser el inicio de un brote, y la Secretaria de Salud necesita verlo
// rapido para reaccionar, no despues de semanas). Aclaracion honesta: con los
// pocos datos de prueba de esta base cada diagnostico sale con frecuencia 1,
// pero con datos reales de produccion (miles de hospitalizaciones) esta misma
// consulta si mostraria patrones repetidos de verdad.
// Etapas: $unwind -> $group -> $sort -> $project -> $limit
// ================================================================
print("\n=== CONSULTA 4: Diagnosticos mas frecuentes (top 10) ===");
db.hospitalizaciones.aggregate([
  { $unwind: "$diagnosticos" }, // separo cada diagnostico del arreglo en su propio documento temporal
  {
    $group: {
      _id: { codigo: "$diagnosticos.codigo_cie10", descripcion: "$diagnosticos.descripcion" },
      frecuencia: { $sum: 1 },
      servicios: { $addToSet: "$servicio" } // en que servicios ha aparecido ese diagnostico
    }
  },
  { $sort: { frecuencia: -1 } }, // el diagnostico mas repetido primero
  {
    $project: {
      _id: 0,
      codigo_cie10: "$_id.codigo",
      descripcion: "$_id.descripcion",
      frecuencia: 1,
      servicios: 1
    }
  },
  { $limit: 10 } // me quedo solo con los 10 diagnosticos mas frecuentes
]).forEach(doc => printjson(doc));
