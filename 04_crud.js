// 04_crud.js
// Ejecutar con: load("04_crud.js") despues de 03_vincular_existentes.js
//
// Aqui esta el CRUD completo que pide la Unidad 3: Create, Update (campo simple,
// campo anidado en objeto, campo anidado en arreglo, y una operacion que toca
// VARIAS colecciones relacionadas a la vez), y Delete (soft delete Y eliminacion
// definitiva real). En cada bloque dejo un comentario de POR QUE se eligio esa
// forma de hacerlo y no otra, no solo que es lo que hace. Cada paso imprime un
// titulo y el resultado, para que sea facil tomar la captura de pantalla de cada
// operacion por separado.

use("hce_hospitalizacion_grupo_6");

// ======================================================================
// CREATE 1: nuevo paciente que ingresa al hospital
// Por que insertOne simple: pacientes es una coleccion independiente (no depende
// de que exista nada mas todavia), asi que no hay ninguna otra coleccion que tocar
// en este paso.
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
// libre despues del alta de PAC001 en la Unidad 2.
//
// Por que esto SI toca 2 colecciones en el mismo paso (hospitalizaciones Y camas):
// una cama y la hospitalizacion que la ocupa son dos caras del mismo hecho de
// negocio ("este paciente esta en esta cama"). Si solo insertara la hospitalizacion
// y me olvidara de marcar la cama como ocupada, la cama CAMA007 seguiria apareciendo
// "libre" en la Consulta 1 (ocupacion por servicio) aunque en realidad ya tenga un
// paciente adentro: serian datos inconsistentes.
// ======================================================================
print("\n=== CREATE 2: nueva hospitalizacion HOSP011 (toca hospitalizaciones + camas) ===");
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

db.camas.updateOne({ _id: "CAMA007" }, { $set: { estado: "ocupada", hospitalizacion_actual_id: "HOSP011" } });
print(db.hospitalizaciones.findOne({ _id: "HOSP011" }));
print(db.camas.findOne({ _id: "CAMA007" }));

// ======================================================================
// CREATE 3: una orden de medicamento para esa hospitalizacion nueva.
// Por que es su propia coleccion y no un campo embebido dentro de la
// hospitalizacion: una hospitalizacion puede acumular muchas ordenes a lo largo
// de los dias, y cada una se actualiza de estado (activa/suspendida/finalizada)
// por separado (ver schema.json de la Unidad 2); embeberla obligaria a reescribir
// todo el documento de la hospitalizacion cada vez que cambia una sola orden.
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
// de celular.
// Por que $set simple alcanza aqui: telefono es un campo de primer nivel, no esta
// adentro de ningun objeto ni arreglo, asi que no hace falta notacion de punto ni
// ningun operador especial de arreglos.
// ======================================================================
print("\n=== UPDATE 1 (campo simple): nuevo telefono de PAC002 ===");
db.pacientes.updateOne(
  { _id: "PAC002" },
  { $set: { telefono: "3109876543" } }
);
print(db.pacientes.findOne({ _id: "PAC002" }, { _id: 1, nombre_completo: 1, telefono: 1 }));

// ======================================================================
// UPDATE 2 (campo ANIDADO, dentro de un objeto): el contacto de
// emergencia es un subdocumento dentro de pacientes.
// Por que uso notacion de punto ("contacto_emergencia.telefono") en vez de
// reemplazar todo el objeto contacto_emergencia con $set: si yo mandara
// $set: { contacto_emergencia: { telefono: "..." } }, Mongo BORRARIA nombre y
// parentesco porque no los mencione. La notacion de punto cambia solo esa
// propiedad del objeto y deja el resto intacto.
// ======================================================================
print("\n=== UPDATE 2 (campo anidado - objeto): telefono del contacto de emergencia de PAC005 ===");
db.pacientes.updateOne(
  { _id: "PAC005" },
  { $set: { "contacto_emergencia.telefono": "3199988776" } }
);
print(db.pacientes.findOne({ _id: "PAC005" }, { _id: 1, contacto_emergencia: 1 }));

// ======================================================================
// UPDATE 3 (campo ANIDADO, dentro de un arreglo/vector): a la hospitalizacion
// HOSP011 le encuentran un segundo diagnostico (secundario).
// Por que uso $push y NO $set sobre el arreglo completo: diagnosticos ya tenia
// el diagnostico principal cargado. Si hiciera $set: { diagnosticos: [...] } con
// solo el nuevo, borraria el principal sin querer. $push agrega un elemento mas
// al final del arreglo sin tocar los que ya estaban, que es justo lo que pasa en
// la vida real: a un paciente le van apareciendo diagnosticos nuevos, no se le
// borran los anteriores.
// ======================================================================
print("\n=== UPDATE 3 (campo anidado - arreglo): se agrega diagnostico secundario a HOSP011 ===");
db.hospitalizaciones.updateOne(
  { _id: "HOSP011" },
  { $push: { diagnosticos: { codigo_cie10: "E11.9", descripcion: "Diabetes mellitus tipo 2 sin complicaciones", tipo: "secundario", fecha: "2026-11-06T08:00:00Z" } } }
);
print(db.hospitalizaciones.findOne({ _id: "HOSP011" }, { _id: 1, diagnosticos: 1 }));

// ======================================================================
// OPERACION MULTI-COLECCION: dar de alta a HOSP008.
//
// "Dar de alta" no es un solo cambio, es UN hecho de negocio que afecta a 3
// colecciones relacionadas a la vez, y las 3 tienen que quedar coherentes entre si:
//   1) hospitalizaciones: se llena el subdocumento "alta" (estaba en null) y el
//      campo "estado" pasa de "activa" a "dada_de_alta". Esto es un UPDATE anidado
//      (el subdocumento alta es un objeto completo que se escribe de una vez).
//   2) camas: la cama CAMA012 que el paciente ocupaba debe quedar "libre" de nuevo
//      (si no la libero, esa cama se queda "ocupada" para siempre en el sistema
//      aunque ya no haya nadie ahi, y el hospital pensaria que tiene una cama menos
//      disponible de las que realmente tiene).
//   3) medicos: al medico que dio la alta (Dr. Andres Felipe Suarez, MED001) se le
//      suma 1 a su contador total_altas_dadas con $inc (no con $set de un numero
//      fijo, para no pisar el valor si otra alta se registro al mismo tiempo).
//
// Por que hago esto en 3 pasos separados y no en una sola instruccion: MongoDB (en
// esta configuracion local, sin replica set) no tiene transacciones multi-documento
// activas, asi que no hay ninguna garantia automatica de que las 3 escrituras
// ocurran todas o ninguna. Si el script se cayera justo entre el paso 1 y el 2,
// quedaria una hospitalizacion con alta pero la cama seguiria "ocupada": un dato
// inconsistente. En un sistema real esto se resolveria con una transaccion de
// MongoDB (session.withTransaction) o con un proceso de reconciliacion que revise
// y corrija esos casos. Lo dejo así́ de explicito a proposito porque es justo el
// riesgo de integridad que discuto en reflexion_etica.md.
// ======================================================================
print("\n=== OPERACION MULTI-COLECCION: dar de alta a HOSP008 (hospitalizaciones + camas + medicos) ===");

// paso 1 de 3: llenar el subdocumento "alta" y cambiar el estado
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

// paso 2 de 3: liberar la cama que ocupaba (soft delete de la ocupacion, no se borra la cama)
db.camas.updateOne(
  { _id: "CAMA012" },
  { $set: { estado: "libre", hospitalizacion_actual_id: null } }
);

// paso 3 de 3: sumar 1 al contador de altas del medico que dio la salida
db.medicos.updateOne(
  { _id: "MED001" },
  { $inc: { total_altas_dadas: 1 } }
);

print(db.hospitalizaciones.findOne({ _id: "HOSP008" }, { _id: 1, estado: 1, alta: 1 }));
print(db.camas.findOne({ _id: "CAMA012" }));
print(db.medicos.findOne({ _id: "MED001" }, { _id: 1, nombre_completo: 1, total_altas_dadas: 1 }));

// ======================================================================
// SOFT DELETE: la paciente PAC009 (la de mayor edad en la base) pide
// que se elimine su informacion del sistema.
// Por que SOFT delete y no un delete real: por ley, una historia clinica no se
// puede borrar asi nomas (debe conservarse por motivos legales y de continuidad
// en la atencion, ver Ley 1581 en reflexion_etica.md), asi que en vez de un
// deleteOne se hace una BAJA LOGICA: se marca activo:false y se guarda la fecha,
// pero el documento sigue existiendo completo para quien tenga permiso de verlo.
// ======================================================================
print("\n=== SOFT DELETE: PAC009 se marca como inactiva (baja logica) ===");
db.pacientes.updateOne(
  { _id: "PAC009" },
  { $set: { activo: false, fecha_inactivacion: "2026-11-08" } }
);
print(db.pacientes.findOne({ _id: "PAC009" }, { _id: 1, nombre_completo: 1, activo: 1, fecha_inactivacion: 1 }));

// ======================================================================
// HARD DELETE: eliminacion DEFINITIVA real, pero sobre un registro de
// PRUEBA creado unicamente para poder borrarlo.
// Por que aqui SI es correcto un hard delete y no un soft delete: este documento
// no es un paciente real, no tiene historia clinica que proteger ni obligacion
// legal de conservarse, y su unico proposito es demostrar que deleteOne funciona.
// Guardarlo "inactivo" para siempre seria dejar basura de prueba mezclada con
// datos reales sin ningun beneficio. Primero se inserta, despues se elimina.
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
