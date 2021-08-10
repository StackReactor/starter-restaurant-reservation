const knex = require("../db/connection");

async function listByDate(reservation_date) {
  return await knex("reservations")
    .where({ reservation_date })
    .whereNot({ status: "finished" })
    .whereNot({ status: "cancelled" })
    .orderBy("reservation_time", "asc");
}

async function listByNumber(mobile_number) {
  return await knex("reservations")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

async function create(reservation) {
  reservation.status = "booked";
  return await knex("reservations")
    .insert(reservation, "*")
    .then((response) => response[0]);
}

async function read(reservation_id) {
  return await knex("reservations").where({ reservation_id }).first();
}

async function updateReservation(reservation_id, reservation) {
  return await knex("reservations")
    .where({ reservation_id })
    .update(reservation)
    .then(() => reservation);
}

async function updateStatus(reservation_id, newStatus) {
  return await knex("reservations")
    .where({ reservation_id })
    .update("status", newStatus)
    .then(() => read(reservation_id));
}

module.exports = {
  listByDate,
  listByNumber,
  create,
  read,
  updateReservation,
  updateStatus,
};
