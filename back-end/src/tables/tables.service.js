const knex = require("../db/connection");
const tableName = "tables";

function list(occupied) {
  const query = knex(tableName).select("*");
  if (occupied != null) {
    query.where({ occupied: occupied });
  }
  return query.orderBy("table_name");
}

function create(newTable) {
  return knex(tableName).insert(newTable).returning("*");
}
function update(table_id, reservation_id) {
  return knex(tableName)
    .where({ table_id: table_id })
    .update({ occupied: true })
    .update({ reservation_id: reservation_id })
    .returning("*");
}

function finish(table_id) {
  return knex(tableName)
    .where({ table_id: table_id })
    .update({ occupied: false })
    .update({ reservation_id: null })
    .returning("*");
}
function checkTable(table_id) {
  return knex(tableName).where({ table_id: table_id }).returning("*");
}
//THINGS DONE ON RESERVATIONS TABLE
function getReservation(reservation_id) {
  return knex("reservations")
    .select("*")
    .where({ reservation_id: reservation_id });
}

function reservationStatus(reservation_id, status) {
  return knex("reservations")
    .update({ status: status })
    .where({ reservation_id: reservation_id });
}

module.exports = {
  list,
  create,
  update,
  finish,
  getReservation,
  checkTable,
  reservationStatus,
};
