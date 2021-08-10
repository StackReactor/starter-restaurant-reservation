const reservationsData = require("./00-reservations.json");
console.log(reservationsData);
exports.seed = function (knex) {
  return knex
    .raw("TRUNCATE TABLE reservations RESTART IDENTITY CASCADE")
    .then(() => knex("reservations").insert(reservationsData));
};
