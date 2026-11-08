// 04_crud.js
// Ejecutar con: load("04_crud.js") despues de 03_vincular_existentes.js
//
// Aqui esta el CRUD completo que pide la Unidad 3: Create, Update (campo simple y
// campo anidado), y Delete (soft delete Y eliminacion definitiva real). Cada paso
// imprime un titulo y el resultado, para que sea facil tomar la captura de pantalla
// de cada operacion por separado.

use("hce_hospitalizacion_grupo_6");

// ======================================================================
// CREATE 1: nuevo paciente que ingresa al hospital
// ======================================================================
print("\n=== CREATE 1: nuevo paciente PAC011 ===");
db.pacientes.insertOne({
  _id: "PAC011",
  documento_identidad: { tipo: "CC", numero: "1152233445" },
  nombre_completo: "Marcela Isabel Ochoa Ramirez",
  fecha_nacimiento: "1988-05-19",
  sexo: "F",
  eps: "EPS Sura",
  telefono: "3142219988",
  direccion: "Calle 60 # 28-14, Medellin",
  contacto_emergencia: { nombre: "Daniel Ochoa", parentesco: "hermano", telefono: "3151122334" }
});
print(db.pacientes.findOne({ _id: "PAC011" }));

// ======================================================================
// CREATE 2: su hospitalizacion, YA con medico_id y cama_id (asi deberia
// quedar cualquier hospitalizacion nueva de aqui en adelante).
// Le asigno a la Dra. Laura Jaramillo (MED006), que hasta ahora no tenia
// ningun paciente, y reutilizo la cama CAMA007 (301) que habia quedado
// libre despues del alta de PAC001 en la Unidad 2 (asi se reutilizan las
// camas en un hospital real).
// ======================================================================
print("\n=== CREATE 2: nueva hospitalizacion HOSP011 ===");
db.hospitalizaciones.insertOne({
  _id: "HOSP011",
  paciente_id: "PAC011",
  fecha_admision: "2026-11-05T09:10:00Z",
  motivo_admision: "Enrojecimiento, dolor e hinchazon en pierna derecha de 2 dias",
  servicio: "Medicina Interna",
  medico_tratante: "Dra. Laura Jaramillo",
  medico_id: "MED006",
  cama_id: "CAMA007",
  estado: "activa",
  diagnosticos: [
    { codigo_cie10: "L03.11", descripcion: "Celulitis de miembro inferior derecho", tipo: "principal", fecha: "2026-11-05T09:40:00Z" }
  ],
  alta: null
});

// como ahora CAMA007 tiene un paciente adentro, hay que avisarle a la coleccion camas
db.camas.updateOne({ _id: "CAMA007" }, { $set: { estado: "ocupada", hospitalizacion_actual_id: "HOSP011" } });
print(db.hospitalizaciones.findOne({ _id: "HOSP011" }));
print(db.camas.findOne({ _id: "CAMA007" }));

// ======================================================================
// CREATE 3: una orden de medicamento para esa hospitalizacion nueva
// ======================================================================
print("\n=== CREATE 3: orden de medicamento para HOSP011 ===");
db.ordenes_medicamento.insertOne({
  hospitalizacion_id: "HOSP011",
  medicamento: "Clindamicina",
  dosis: "600 mg",
  via: "intravenosa",
  frecuencia: "cada 8 horas",
  fecha_inicio: "2026-11-05T10:00:00Z",
  fecha_fin: null,
  medico_ordena: "Dra. Laura Jaramillo",
  medico_id: "MED006",
  estado: "activa"
});
print("Orden insertada. Total ordenes de HOSP011:", db.ordenes_medicamento.countDocuments({ hospitalizacion_id: "HOSP011" }));

// ======================================================================
// UPDATE 1 (campo simple): a la paciente PAC002 le cambiaron el numero
// de celular. Es un campo de primer nivel, no esta adentro de nada.
// ======================================================================
print("\n=== UPDATE 1 (campo simple): nuevo telefono de PAC002 ===");
db.pacientes.updateOne(
  { _id: "PAC002" },
  { $set: { telefono: "3109876543" } }
);
print(db.pacientes.findOne({ _id: "PAC002" }, { _id: 1, nombre_completo: 1, telefono: 1 }));

// ======================================================================
// UPDATE 2 (campo ANIDADO, dentro de un objeto): el contacto de
// emergencia es un subdocumento dentro de pacientes; aqui actualizo solo
// su telefono con la notacion de punto, sin tocar el resto del contacto.
// ======================================================================
print("\n=== UPDATE 2 (campo anidado - objeto): telefono del contacto de emergencia de PAC005 ===");
db.pacientes.updateOne(
  { _id: "PAC005" },
  { $set: { "contacto_emergencia.telefono": "3199988776" } } // solo cambia ese campo del objeto, el resto queda igual
);
print(db.pacientes.findOne({ _id: "PAC005" }, { _id: 1, contacto_emergencia: 1 }));

// ======================================================================
// UPDATE 3 (campo ANIDADO, dentro de un arreglo/vector): a la hospitalizacion
// nueva HOSP011 le encuentran un segundo diagnostico (secundario), asi que
// se lo agrego al arreglo "diagnosticos" con $push, sin reemplazar el que
// ya tenia.
// ======================================================================
print("\n=== UPDATE 3 (campo anidado - arreglo): se agrega diagnostico secundario a HOSP011 ===");
db.hospitalizaciones.updateOne(
  { _id: "HOSP011" },
  { $push: { diagnosticos: { codigo_cie10: "E11.9", descripcion: "Diabetes mellitus tipo 2 sin complicaciones", tipo: "secundario", fecha: "2026-11-06T08:00:00Z" } } }
);
print(db.hospitalizaciones.findOne({ _id: "HOSP011" }, { _id: 1, diagnosticos: 1 }));

// ======================================================================
// UPDATE 4 (campo ANIDADO + egreso real): a HOSP008 (hospitalizacion que
// estaba activa) finalmente le dan el alta. El subdocumento "alta" estaba
// en null y aqui se llena por primera vez.
// ======================================================================
print("\n=== UPDATE 4 (campo anidado): se llena el subdocumento 'alta' de HOSP008 ===");
db.hospitalizaciones.updateOne(
  { _id: "HOSP008" },
  {
    $set: {
      estado: "dada_de_alta",
      alta: {
        fecha_alta: "2026-11-07T10:30:00Z",
        tipo_alta: "mejoria",
        diagnostico_egreso: "Neumonia viral resuelta, buena respuesta a manejo de soporte",
        indicaciones: "Reposo relativo 5 dias, abundantes liquidos, control por consulta externa en 7 dias",
        medico_egreso: "Dr. Andres Felipe Suarez"
      }
    }
  }
);
print(db.hospitalizaciones.findOne({ _id: "HOSP008" }, { _id: 1, estado: 1, alta: 1 }));

// ======================================================================
// SOFT DELETE 1: como HOSP008 ya tiene alta, la cama que ocupaba (CAMA012)
// se "libera" (baja logica): no se borra la cama, solo se le cambia el
// estado para que el sistema sepa que ya puede recibir a otro paciente.
// ======================================================================
print("\n=== SOFT DELETE 1: se libera la cama CAMA012 ===");
db.camas.updateOne(
  { _id: "CAMA012" },
  { $set: { estado: "libre", hospitalizacion_actual_id: null } }
);
print(db.camas.findOne({ _id: "CAMA012" }));

// ======================================================================
// SOFT DELETE 2: la paciente PAC009 (la de mayor edad en la base) pide
// que se elimine su informacion del sistema. Por ley, una historia clinica
// NO se puede borrar asi nomas (debe conservarse por motivos legales y de
// continuidad en la atencion), asi que en vez de un delete real se hace
// una BAJA LOGICA: se marca como inactiva pero el registro sigue existiendo.
// ======================================================================
print("\n=== SOFT DELETE 2: PAC009 se marca como inactiva (baja logica) ===");
db.pacientes.updateOne(
  { _id: "PAC009" },
  { $set: { activo: false, fecha_inactivacion: "2026-11-08" } }
);
print(db.pacientes.findOne({ _id: "PAC009" }, { _id: 1, nombre_completo: 1, activo: 1, fecha_inactivacion: 1 }));

// ======================================================================
// HARD DELETE: eliminacion DEFINITIVA real, pero sobre un registro de
// PRUEBA que se crea unicamente para poder borrarlo (no se borra ningun
// dato clinico real de la base). Primero se inserta, despues se elimina.
// ======================================================================
print("\n=== HARD DELETE: insertar y luego borrar un registro de prueba ===");
db.pacientes.insertOne({
  _id: "PAC_PRUEBA999",
  documento_identidad: { tipo: "CC", numero: "0000000000" },
  nombre_completo: "PACIENTE DE PRUEBA - NO ES UN CASO REAL",
  fecha_nacimiento: "2000-01-01",
  sexo: "O",
  eps: "N/A",
  telefono: "0000000000",
  direccion: "N/A",
  contacto_emergencia: { nombre: "N/A", parentesco: "N/A", telefono: "0000000000" }
});
print("Registro de prueba creado:", db.pacientes.countDocuments({ _id: "PAC_PRUEBA999" }), "documento(s)");

const resultadoBorrado = db.pacientes.deleteOne({ _id: "PAC_PRUEBA999" }); // eliminacion definitiva, no se puede recuperar
print("Documentos eliminados:", resultadoBorrado.deletedCount);
print("Verificacion (debe salir 0):", db.pacientes.countDocuments({ _id: "PAC_PRUEBA999" }));

print("\nCRUD completo ejecutado sin errores.");
