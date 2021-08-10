const knex = require("../db/connection");
const reservationsService = require("../reservations/reservations.service");

function list() {
  return knex("tables").select("*").orderBy("table_name", "asc");
}

async function create(table) {
  return await knex("tables")
    .insert(table, "*")
    .then((response) => response[0]);
}

async function read(table_id) {
  return await knex("tables").where({ table_id }).first();
}

async function updateReservationId(table_id, reservation_id) {
  return await knex("tables")
    .where({ table_id })
    .update("reservation_id", reservation_id)
    .then(() => reservationsService.updateStatus(reservation_id, "seated"));
}

async function destroyReservationId(table) {
  return await knex("tables")
    .where({ table_id: table.table_id })
    .update("reservation_id", null)
    .then(() =>
      reservationsService.updateStatus(table.reservation_id, "finished")
    );
}

module.exports = {
  list,
  create,
  read,
  updateReservationId,
  destroyReservationId,
};
