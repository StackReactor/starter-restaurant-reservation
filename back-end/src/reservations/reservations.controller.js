/**
 * List handler for reservation resources
 */
function checkInPast(currentDate) {
  let [year, month, day] = currentDate.split("-");
  month -= 1;
  const versusToday = new Date(year, month, day);
  versusToday.setHours(23);
  versusToday.setMinutes(59);
  const today = new Date();

  if (versusToday.getTime() < today.getTime()) {
    return false;
  }
  return true;
}
function checkTuesday(currentDate) {
  let [year, month, day] = currentDate.split("-");
  month -= 1;
  const tuesdayDate = new Date(year, month, day);

  if (tuesdayDate.getDay() === 2) {
    return false;
  }
  return true;
}
const ReservationService = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
function hasData(req, res, next) {
  const methodName = "hasData";
  req.log.debug({ __filename, methodName, body: req.body });

  if (req.body.data) {
    req.log.trace({ __filename, methodName, valid: true });
    return next();
  }
  const message = "body must have data property";
  next({ status: 400, message: message });
  req.log.trace({ __filename, methodName, valid: false }, message);
}
function dataHas(propertyName) {
  const methodName = `dataHas('${propertyName}')`;
  return (req, res, next) => {
    req.log.debug({ __filename, methodName, body: req.body });
    const { data = {} } = req.body;
    const value = data[propertyName];
    if (value) {
      req.log.trace({ __filename, methodName, valid: true });
      return next();
    }
    const message = `Article must include a ${propertyName}`;
    next({ status: 400, message: message });
    req.log.trace({ __filename, methodName, valid: false }, message);
  };
}
function peopleIsNumber(req, res, next) {
  const methodName = "people is a number";
  req.log.debug({ __filename, methodName, body: req.body });
  const people = req.body.data.people;

  if (typeof people != "number") {
    return next({ status: 400, message: "people is not a number" });
  }
  next();
}

function hasValidDate(req, res, next) {
  const methodName = "hasValidDate And Time";
  req.log.debug({ __filename, methodName, body: req.body });
  const date = req.body.data.reservation_date;
  const checkDate = new Date(date);
  const time = req.body.data.reservation_time;
  const [hour, minute] = time.split(":");
  if (isNaN(hour) || isNaN(minute)) {
    const message = "reservation_time is not valid time type";
    req.log.trace({ __filename, methodName, valid: false }, message);
    return next({ status: 400, message: message });
  }

  if (checkDate == "Invalid Date") {
    const message = "reservation_date is not valid date type";
    req.log.trace({ __filename, methodName, valid: false }, message);
    return next({ status: 400, message: message });
  }

  if (!checkTuesday(date) || !checkInPast(date)) {
    const message =
      "reservation_date is not valid...either in the past (needs to be current or future day) or Tuesday closed";
    req.log.trace({ __filename, methodName, valid: false }, message);
    return next({ status: 400, message: message });
  }
  req.log.trace({ __filename, methodName, valid: true });
  next();
}
const hasFirstName = dataHas("first_name");
const hasLastName = dataHas("last_name");
const hasMobileNumber = dataHas("mobile_number");
const hasReservationDate = dataHas("reservation_date");
const hasReservationTime = dataHas("reservation_time");
const hasPeople = dataHas("people");

function hasBookedStatus(req, res, next) {
  const { data = {} } = req.body;
  const status = data.status;
  if (status === undefined || status === "booked") {
    return next(); //db automatically populated with booked
  }
  const message = `Status ${status} must be booked or not defined`;
  next({ status: 400, message: message });
}

async function create(req, res) {
  const newReservation = await ReservationService.create(req.body.data);

  res.status(201).json({
    data: newReservation[0],
  });
}
async function update(req, res) {
  const updatedReservation = await ReservationService.update(req.body.data);

  res.status(200).json({
    data: updatedReservation[0],
  });
}

async function list(req, res) {
  const methodName = "list";
  req.log.debug({ __filename, methodName });

  const { date = null } = req.query;
  const { mobile_number = null } = req.query;
  const { reservation_id = null } = req.query;
  const data = await ReservationService.list(
    date,
    mobile_number,
    reservation_id
  );

  res.json({ data: data });
  req.log.trace({ __filename, methodName, return: true, data });
}

async function reservationExists(req, res, next) {
  const { reservation_id = null } = req.params;
  if (reservation_id === null) {
    const message = "Reservation ID param is missing";
    return next({ status: 400, message: message });
  }
  const reservationData = await ReservationService.reservationExists(
    reservation_id
  );

  if (!reservationData[0]) {
    const message = `reservation_id ${reservation_id} does not exist`;
    return next({ status: 404, message: message });
  }
  res.locals.reservationId = reservation_id;
  res.locals.reservationData = reservationData[0];
  next();
}

async function listReservation(req, res, next) {
  const methodName = "listReservation";
  req.log.debug({ __filename, methodName });

  const data = await ReservationService.list(
    null,
    null,
    res.locals.reservationId
  );

  res.json({ data: data[0] });
  req.log.trace({ __filename, methodName, return: true, data });
}

async function listPeople(req, res, next) {
  const methodName = "listPeople";
  req.log.debug({ __filename, methodName });

  const data = await ReservationService.listPeople(res.locals.reservationId);
  res.json({ data });
  req.log.trace({ __filename, methodName, return: true, data });
}
async function reservationStatus(req, res, next) {
  const validStatus = ["booked", "seated", "finished", "cancelled"];
  const methodName = "reservationStatus";
  req.log.debug({ __filename, methodName });

  let { status = null } = req.body.data;
  if (status === null) {
    const message = `status ${status} and is missing from parameters`;
    req.log.debug({ __filename, methodName, valid: false }, message);
    return next({ status: 400, message: message });
  }

  if (res.locals.reservationData.status === "finished") {
    const message = `status ${res.locals.reservationData.status} cannot be changed`;
    req.log.debug({ __filename, methodName, valid: false }, message);
    return next({ status: 400, message: message });
  }

  if (!validStatus.includes(status)) {
    const message = `status ${status} is not valid`;
    req.log.debug({ __filename, methodName, valid: false }, message);
    return next({ status: 400, message: message });
  }
  const reservationStatusData = await ReservationService.reservationStatus(
    res.locals.reservationId,
    status
  );

  res.json({ data: reservationStatusData[0] });
  req.log.trace({ __filename, methodName, return: true, data });
}

module.exports = {
  create: [
    hasData,
    hasFirstName,
    hasLastName,
    hasMobileNumber,
    hasReservationDate,
    hasReservationTime,
    hasPeople,
    hasBookedStatus,
    peopleIsNumber,
    hasValidDate,
    asyncErrorBoundary(create),
  ],
  update: [
    asyncErrorBoundary(reservationExists),
    hasData,
    hasFirstName,
    hasLastName,
    hasMobileNumber,
    hasReservationDate,
    hasReservationTime,
    hasPeople,
    peopleIsNumber,
    hasValidDate,
    asyncErrorBoundary(update),
  ],
  listPeople: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(listPeople),
  ],
  list: asyncErrorBoundary(list),
  listReservation: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(listReservation),
  ],
  reservationStatus: [
    asyncErrorBoundary(reservationExists),

    asyncErrorBoundary(reservationStatus),
  ],
};
