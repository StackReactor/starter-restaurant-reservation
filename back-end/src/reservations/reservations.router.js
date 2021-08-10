/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */

const router = require("express").Router();
const controller = require("./reservations.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router
  .route("/")
  .get(controller.list)
  .put(controller.update)
  .post(controller.create)
  .all(methodNotAllowed);

router
  .route("/:reservation_id")
  .get(controller.listReservation)
  .put(controller.update)
  .all(methodNotAllowed);

router
  .route("/:reservation_id/status")
  .get(controller.listPeople)
  .put(controller.reservationStatus)
  .all(methodNotAllowed);
module.exports = router;
