const service = require("./tables.service");
const reservationService = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const Table = require("./Table.class");
const { getPropsErrorMessage } = require("../common");

/**
 * CRUD
 */
async function list(req, res, next) {
  res.json({ data: await service.list() });
}

async function create(req, res, next) {
  res.status(201).json({ data: await service.create(res.locals.table) });
}

async function read(req, res, next) {
  res.json({ data: res.locals.table });
}

async function updateReservationId(req, res, next) {
  res.json({
    data: await service.updateReservationId(
      res.locals.table.table_id,
      res.locals.reservation_id
    ),
  });
}

async function destroyReservationId(req, res, next) {
  await service.destroyReservationId(res.locals.table);
  res.sendStatus(200);
}

/**
 * MIDDLEWARE for /tables and /tables/:table_id
 */
async function tableExists(req, res, next) {
  const { table_id } = req.params;
  const table = await service.read(table_id);
  if (table) {
    res.locals.table = table;
    return next();
  } else {
    return next({
      status: 404,
      message: `table_id: ${table_id} does not exist`,
    });
  }
}

function hasAllTableProperties(req, res, next) {
  const { data } = req.body;
  if (!data) return next({ status: 400, message: "No data to create." });
  const table = new Table(data);
  if (table.hasAllProps()) {
    res.locals.table = table;
    return next();
  }
  const message = getPropsErrorMessage("Missing", table.missingProps);
  next({ status: 400, message });
}

function tableNameIsLongEnough(req, res, next) {
  if (res.locals.table.table_name.length < 2) {
    return next({ status: 400, message: "table_name is too short" });
  }
  next();
}

/**
 * MIDDLEWARE for tables/:table_id/seat
 */
async function reservationIdExists(req, res, next) {
  const { data } = req.body;
  if (!data) {
    return next({ status: 400, message: "Request data is missing." });
  }
  const id = data.reservation_id;
  res.locals.reservation_id = id;
  if (!id) {
    return next({
      status: 400,
      message: `No reservation_id requested`,
    });
  }
  const reservation = await reservationService.read(id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  } else {
    return next({
      status: 404,
      message: `The reservation_id: ${id} does not exist.`,
    });
  }
}

async function tableIsAvailable(req, res, next) {
  const table = res.locals.table;
  if (table.reservation_id) {
    return next({
      status: 400,
      message: "Table is currently occupied/unavailable.",
    });
  }
  next();
}

async function tableIsNotAvailable(req, res, next) {
  const table = res.locals.table;
  if (!table.reservation_id) {
    return next({
      status: 400,
      message: "Table is not occupied/cannot be finished.",
    });
  }
  next();
}

async function partyFitsTable(req, res, next) {
  if (res.locals.reservation.people > res.locals.table.capacity) {
    return next({
      status: 400,
      message: "Reservation party size is too large for table capacity.",
    });
  }
  res.locals.table.reservation_id = res.locals.reservation_id;
  next();
}

async function reservationIsNotSeated(req, res, next) {
  const id = res.locals.reservation.reservation_id;
  if (res.locals.reservation.status === "seated") {
    return next({
      status: 400,
      message: `Reservation ID: ${id} is already seated at another table.`,
    });
  }
  next();
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    asyncErrorBoundary(hasAllTableProperties),
    asyncErrorBoundary(tableNameIsLongEnough),
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(tableExists), asyncErrorBoundary(read)],
  updateReservationId: [
    asyncErrorBoundary(reservationIdExists),
    asyncErrorBoundary(reservationIsNotSeated),
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(tableIsAvailable),
    asyncErrorBoundary(partyFitsTable),
    asyncErrorBoundary(updateReservationId),
  ],
  destroyReservationId: [
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(tableIsNotAvailable),
    asyncErrorBoundary(destroyReservationId),
  ],
};
