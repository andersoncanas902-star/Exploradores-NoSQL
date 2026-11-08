// 03_vincular_existentes.js
// Ejecutar con: load("03_vincular_existentes.js") despues de 02_insert_medicos_camas.js
//
// Las 10 hospitalizaciones que ya existian desde la Unidad 2 NO tienen medico_id ni
// cama_id (ese campo no existia todavia). Este script las "pone al dia":
//   1) les agrega medico_id, buscando el medico por el nombre de texto que ya tenian.
//   2) les agrega cama_id, asignandoles una cama del servicio correspondiente.
//   3) actualiza el estado de esas camas (ocupada si la hospitalizacion sigue activa,
//      libre si ya tuvo el alta).
//   4) hace lo mismo con ordenes_medicamento y notas_evolucion (solo medico_id).
//
// Esto se hace UNA sola vez (si lo corres 2 veces no pasa nada malo, solo vuelve a
// dejar todo en el mismo estado, porque son $set, no $push).

use("hce_hospitalizacion_grupo_6");

// ---------- 1) medico_id en hospitalizaciones, ordenes_medicamento y notas_evolucion ----------
// Mapa nombre de texto -> _id real en la coleccion medicos.
const mapaMedicos = {
  "Dr. Andres Felipe Suarez": "MED001",
  "Dra. Camila Vasquez": "MED002",
  "Dr. Oscar Giraldo": "MED003",
  "Dr. Santiago Lopera": "MED004",
  "Dra. Natalia Correa": "MED005"
};

Object.keys(mapaMedicos).forEach(nombre => {
  const medicoId = mapaMedicos[nombre];

  const r1 = db.hospitalizaciones.updateMany({ medico_tratante: nombre }, { $set: { medico_id: medicoId } });
  const r2 = db.ordenes_medicamento.updateMany({ medico_ordena: nombre }, { $set: { medico_id: medicoId } });
  const r3 = db.notas_evolucion.updateMany({ medico: nombre }, { $set: { medico_id: medicoId } });

  print(`${nombre} -> ${medicoId}: ${r1.modifiedCount} hospitalizaciones, ${r2.modifiedCount} ordenes, ${r3.modifiedCount} notas actualizadas.`);
});

// ---------- 2) cama_id en hospitalizaciones ----------
// Le doy a cada hospitalizacion vieja una cama del servicio que le corresponde.
// (en un hospital real esto ya existiria desde el ingreso; aqui lo completamos porque
// la cama es un dato nuevo que no existia en la Unidad 2).
const mapaCamas = {
  "HOSP001": "CAMA007", // Medicina Interna, 301
  "HOSP002": "CAMA003", // Cirugia General, 201
  "HOSP003": "CAMA008", // Medicina Interna, 302 (hospitalizacion ACTIVA)
  "HOSP004": "CAMA014", // Ortopedia, 401
  "HOSP005": "CAMA009", // Medicina Interna, 303
  "HOSP006": "CAMA010", // Medicina Interna, 304
  "HOSP007": "CAMA011", // Medicina Interna, 305
  "HOSP008": "CAMA012", // Medicina Interna, 306 (hospitalizacion ACTIVA)
  "HOSP009": "CAMA015", // Ortopedia, 402
  "HOSP010": "CAMA013"  // Medicina Interna, 307
};

Object.keys(mapaCamas).forEach(hospId => {
  const camaId = mapaCamas[hospId];
  db.hospitalizaciones.updateOne({ _id: hospId }, { $set: { cama_id: camaId } });
});
print("cama_id asignado a las 10 hospitalizaciones existentes.");

// ---------- 3) estado real de cada cama, segun si la hospitalizacion sigue activa ----------
Object.keys(mapaCamas).forEach(hospId => {
  const camaId = mapaCamas[hospId];
  const hosp = db.hospitalizaciones.findOne({ _id: hospId }, { estado: 1 });

  if (hosp.estado === "activa") {
    // el paciente sigue internado: la cama queda OCUPADA y guarda cual hospitalizacion la tiene
    db.camas.updateOne({ _id: camaId }, { $set: { estado: "ocupada", hospitalizacion_actual_id: hospId } });
  } else {
    // ya le dieron el alta: la cama vuelve a estar LIBRE para el siguiente paciente
    db.camas.updateOne({ _id: camaId }, { $set: { estado: "libre", hospitalizacion_actual_id: null } });
  }
});
print("Estado de las camas actualizado segun si su hospitalizacion sigue activa o ya tuvo alta.");

// ---------- 4) verificacion rapida ----------
print("\n=== Verificacion: hospitalizaciones activas y su cama ===");
db.hospitalizaciones.find({ estado: "activa" }, { _id: 1, paciente_id: 1, medico_id: 1, cama_id: 1 }).forEach(d => printjson(d));

print("\n=== Verificacion: camas ocupadas ===");
db.camas.find({ estado: "ocupada" }).forEach(d => printjson(d));
