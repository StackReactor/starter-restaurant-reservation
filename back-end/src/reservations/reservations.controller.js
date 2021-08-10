const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const Reservation = require("./Reservation.class");
const { getPropsErrorMessage } = require("../common");

/**
 * CRUD
 */
async function list(req, res) {
  if (req.query.mobile_number) {
    res.json({ data: await service.listByNumber(req.query.mobile_number) });
  } else {
    res.json({ data: await service.listByDate(req.query.date) });
  }
}

async function create(req, res) {
  res.status(201).json({ data: await service.create(res.locals.reservation) });
}

async function read(req, res) {
  res.json({ data: res.locals.reservation });
}

async function updateReservation(req, res) {
  res.status(200).json({
    data: await service.updateReservation(
      res.locals.reservationId,
      res.locals.reservation
    ),
  });
}

async function updateStatus(req, res) {
  res.status(200).json({
    data: await service.updateStatus(
      res.locals.reservation.reservation_id,
      res.locals.requestedStatus
    ),
  });
}

/**
 * MIDDLEWARE
 */
function hasRequiredProperties(req, res, next) {
  const { data } = req.body;
  if (!data) return next({ status: 400, message: "No data to create." });

  const reservation = new Reservation(data);
  if (reservation.hasAllProps()) {
    res.locals.reservation = reservation;
    return next();
  }
  const message = getPropsErrorMessage("Missing", reservation.missingProps);
  return next({ status: 400, message });
}

function propsAreValid(req, res, next) {
  const reservation = res.locals.reservation;
  if (reservation.allPropsAreValid()) {
    return next();
  }
  const message = getPropsErrorMessage("Invalid", reservation.invalidProps);
  return next({ status: 400, message });
}

function dateIsInTheFuture(req, res, next) {
  res.locals.reservationDate = new Date(
    `${res.locals.reservation.reservation_date}, ${res.locals.reservation.reservation_time}`
  );
  const today = new Date();
  if (today.getTime() > res.locals.reservationDate.getTime()) {
    return next({
      status: 400,
      message: "Please book your reservation for a future date.",
    });
  }
  next();
}

function dateIsNotATuesday(req, res, next) {
  if (res.locals.reservationDate.getDay() === 2) {
    return next({
      status: 400,
      message: "The restaurant is closed on Tuesdays!",
    });
  }
  next();
}

function timeIsWithinBusinessHours(req, res, next) {
  const reservationTime = +res.locals.reservation.reservation_time.replace(
    ":",
    ""
  );
  if (reservationTime < 1030 || reservationTime > 2130) {
    return next({
      status: 400,
      message: "Please reserve a time within business hours.",
    });
  }
  next();
}

async function reservationExists(req, res, next) {
  const { reservation_id: id } = req.params;
  const reservation = await service.read(id);
  if (reservation) {
    res.locals.reservationId = reservation.reservation_id;
    res.locals.reservation = reservation;
    return next();
  } else {
    return next({ status: 404, message: `Reservation ID: ${id} not found.` });
  }
}

async function statusIsBooked(req, res, next) {
  const reservation = res.locals.reservation;
  if (reservation.status !== "booked") {
    return next({
      status: 400,
      message: `Reservation status cannot be ${reservation.status}`,
    });
  }
  next();
}

async function statusIsUnknown(req, res, next) {
  const reservation = res.locals.reservation;
  if (!["booked", "finished", "seated", null].includes(reservation.status)) {
    return next({
      status: 400,
      message: `Reservation status: ${reservation.status} is not acceptable. Please pass status of "booked".`,
    });
  }
  next();
}

async function statusPassedIsValid(req, res, next) {
  const reservationStatus = req.body.data.status;
  if (
    !["seated", "finished", "booked", "cancelled"].includes(reservationStatus)
  ) {
    return next({
      status: 400,
      message: `Reservation status: ${reservationStatus} is not acceptable. Please pass status of booked, seated, finished, or cancelled.`,
    });
  }
  res.locals.requestedStatus = reservationStatus;
  next();
}

async function currentStatusIsNotFinished(req, res, next) {
  const { status: reservationStatus } = res.locals.reservation;
  if (reservationStatus === "finished") {
    return next({
      status: 400,
      message: `A reservation with "finished" status cannot be updated.`,
    });
  }
  next();
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    asyncErrorBoundary(hasRequiredProperties),
    asyncErrorBoundary(propsAreValid),
    asyncErrorBoundary(dateIsInTheFuture),
    asyncErrorBoundary(dateIsNotATuesday),
    asyncErrorBoundary(timeIsWithinBusinessHours),
    asyncErrorBoundary(statusIsBooked),
    asyncErrorBoundary(statusIsUnknown),
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(read)],
  updateReservation: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(hasRequiredProperties),
    asyncErrorBoundary(propsAreValid),
    asyncErrorBoundary(dateIsInTheFuture),
    asyncErrorBoundary(dateIsNotATuesday),
    asyncErrorBoundary(timeIsWithinBusinessHours),
    asyncErrorBoundary(statusIsBooked),
    asyncErrorBoundary(statusIsUnknown),
    asyncErrorBoundary(updateReservation),
  ],
  updateStatus: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(currentStatusIsNotFinished),
    asyncErrorBoundary(statusPassedIsValid),
    asyncErrorBoundary(updateStatus),
  ],
};
