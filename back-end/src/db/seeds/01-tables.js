const tablesData = require("./01-tables.json");
console.log(tablesData);
exports.seed = function (knex) {
  return knex
    .raw("TRUNCATE TABLE tables RESTART IDENTITY CASCADE")
    .then(() => knex("tables").insert(tablesData));
};
