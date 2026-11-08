// 02_insert_medicos_camas.js
// Ejecutar con: load("02_insert_medicos_camas.js") despues de 01_create_medicos_camas.js
// Carga 7 medicos y 16 camas de prueba. Los 5 primeros medicos son justo los que ya
// aparecian como texto en las hospitalizaciones de la Unidad 2 (no me los invente de cero,
// los saque de insert_pacientes.js / insert_pacientes_extra.js); agrego 2 medicos nuevos
// que todavia no tienen pacientes asignados, para poder mostrar en las consultas de la
// Unidad 3 que un medico puede aparecer con carga = 0.

use("hce_hospitalizacion_grupo_6");

// ---------- MEDICOS ----------
if (db.medicos.countDocuments() === 0) {
  db.medicos.insertMany([
    // total_altas_dadas arranca en 0 para todos; 03_vincular_existentes.js lo pone al
    // dia con las altas que ya existian antes de que este contador existiera.
    { _id: "MED001", nombre_completo: "Dr. Andres Felipe Suarez", documento_identidad: { tipo: "CC", numero: "70556123" }, registro_medico: "TP-45231-ANT", especialidad: "Medicina Interna", servicio_principal: "Medicina Interna", telefono: "3011239876", activo: true, total_altas_dadas: 0 },
    { _id: "MED002", nombre_completo: "Dra. Camila Vasquez", documento_identidad: { tipo: "CC", numero: "43221098" }, registro_medico: "TP-50112-ANT", especialidad: "Cirugia General", servicio_principal: "Cirugia General", telefono: "3022348765", activo: true, total_altas_dadas: 0 },
    { _id: "MED003", nombre_completo: "Dr. Oscar Giraldo", documento_identidad: { tipo: "CC", numero: "71004455" }, registro_medico: "TP-38890-ANT", especialidad: "Medicina Interna", servicio_principal: "Medicina Interna", telefono: "3033457890", activo: true, total_altas_dadas: 0 },
    { _id: "MED004", nombre_completo: "Dr. Santiago Lopera", documento_identidad: { tipo: "CC", numero: "15778899" }, registro_medico: "TP-41256-ANT", especialidad: "Ortopedia y Traumatologia", servicio_principal: "Ortopedia y Traumatologia", telefono: "3044567123", activo: true, total_altas_dadas: 0 },
    { _id: "MED005", nombre_completo: "Dra. Natalia Correa", documento_identidad: { tipo: "CC", numero: "43556712" }, registro_medico: "TP-47765-ANT", especialidad: "Medicina Interna", servicio_principal: "Medicina Interna", telefono: "3055678234", activo: true, total_altas_dadas: 0 },
    // estos 2 son nuevos: todavia no han atendido a nadie en la base (sirve para la
    // consulta de "carga de pacientes por medico" en 05_consultas_avanzadas.js).
    { _id: "MED006", nombre_completo: "Dra. Laura Jaramillo", documento_identidad: { tipo: "CC", numero: "1040223311" }, registro_medico: "TP-52980-ANT", especialidad: "Medicina Interna", servicio_principal: "Medicina Interna", telefono: "3066789345", activo: true, total_altas_dadas: 0 },
    { _id: "MED007", nombre_completo: "Dr. Felipe Montoya", documento_identidad: { tipo: "CC", numero: "98123456" }, registro_medico: "TP-39871-ANT", especialidad: "Cirugia General", servicio_principal: "Cirugia General", telefono: "3077890456", activo: true, total_altas_dadas: 0 }
  ]);
  print("7 medicos insertados.");
} else {
  print("Ya habia medicos cargados, no se insertan de nuevo.");
}

// Parche para cuando este script ya se habia corrido ANTES de que existiera el campo
// total_altas_dadas (lo deja en 0 solo si el documento todavia no lo tiene).
db.medicos.updateMany({ total_altas_dadas: { $exists: false } }, { $set: { total_altas_dadas: 0 } });

// ---------- CAMAS ----------
// Las distribuyo por servicio y piso. OJO: dejo varias camas "sin usar" (nunca referenciadas
// desde ninguna hospitalizacion) a proposito, para que la consulta de ocupacion por servicio
// de verdad muestre servicios con camas libres y no todo lleno al 100%.
if (db.camas.countDocuments() === 0) {
  db.camas.insertMany([
    // UCI, piso 1 (servicio nuevo, todavia sin ninguna hospitalizacion registrada ahi)
    { _id: "CAMA001", numero_cama: "101", piso: 1, servicio: "UCI", estado: "libre", hospitalizacion_actual_id: null },
    { _id: "CAMA002", numero_cama: "102", piso: 1, servicio: "UCI", estado: "libre", hospitalizacion_actual_id: null },

    // Cirugia General, piso 2
    { _id: "CAMA003", numero_cama: "201", piso: 2, servicio: "Cirugia General", estado: "libre", hospitalizacion_actual_id: null },
    { _id: "CAMA004", numero_cama: "202", piso: 2, servicio: "Cirugia General", estado: "libre", hospitalizacion_actual_id: null },
    { _id: "CAMA005", numero_cama: "203", piso: 2, servicio: "Cirugia General", estado: "libre", hospitalizacion_actual_id: null },
    { _id: "CAMA006", numero_cama: "204", piso: 2, servicio: "Cirugia General", estado: "libre", hospitalizacion_actual_id: null },

    // Medicina Interna, piso 3 (el servicio con mas movimiento en la base)
    { _id: "CAMA007", numero_cama: "301", piso: 3, servicio: "Medicina Interna", estado: "libre", hospitalizacion_actual_id: null },
    { _id: "CAMA008", numero_cama: "302", piso: 3, servicio: "Medicina Interna", estado: "libre", hospitalizacion_actual_id: null },
    { _id: "CAMA009", numero_cama: "303", piso: 3, servicio: "Medicina Interna", estado: "libre", hospitalizacion_actual_id: null },
    { _id: "CAMA010", numero_cama: "304", piso: 3, servicio: "Medicina Interna", estado: "libre", hospitalizacion_actual_id: null },
    { _id: "CAMA011", numero_cama: "305", piso: 3, servicio: "Medicina Interna", estado: "libre", hospitalizacion_actual_id: null },
    { _id: "CAMA012", numero_cama: "306", piso: 3, servicio: "Medicina Interna", estado: "libre", hospitalizacion_actual_id: null },
    { _id: "CAMA013", numero_cama: "307", piso: 3, servicio: "Medicina Interna", estado: "libre", hospitalizacion_actual_id: null },

    // Ortopedia y Traumatologia, piso 4
    { _id: "CAMA014", numero_cama: "401", piso: 4, servicio: "Ortopedia y Traumatologia", estado: "libre", hospitalizacion_actual_id: null },
    { _id: "CAMA015", numero_cama: "402", piso: 4, servicio: "Ortopedia y Traumatologia", estado: "libre", hospitalizacion_actual_id: null },
    { _id: "CAMA016", numero_cama: "403", piso: 4, servicio: "Ortopedia y Traumatologia", estado: "mantenimiento", hospitalizacion_actual_id: null } // esta la dejo en mantenimiento, para que la consulta de ocupacion tambien sepa manejar ese estado
  ]);
  print("16 camas insertadas (UCI, Cirugia General, Medicina Interna, Ortopedia).");
} else {
  print("Ya habia camas cargadas, no se insertan de nuevo.");
}

print("\nTotal medicos:", db.medicos.countDocuments());
print("Total camas:", db.camas.countDocuments());
