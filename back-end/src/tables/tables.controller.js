const TableService = require("./tables.service");
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

const hasTableName = dataHas("table_name");
const hasCapacity = dataHas("capacity");
const hasReservationId = dataHas("reservation_id");

async function reservationExists(req, res, next) {

  if (!req.body || !req.body.data) {
    const message = `Req Doesn't have body data in checking reservationExists`;
    return next({ status: 400, message: message });
  }
  const { reservation_id = null } = req.body.data;

  const reservationData = await TableService.getReservation(reservation_id);

  if (!reservationData[0]) {
    const message = `From Tables Controller: ${reservation_id}-reservation_id does not exist`;
    return next({ status: 404, message: message });
  }
  res.locals.partySize = reservationData[0].people; //use to check party vs table capacity
  res.locals.reservationData = reservationData[0];
  res.locals.reservationId = reservation_id;
  next();
}

function validNameLength(req, res, next) {
  const methodName = "validNameLength";
  req.log.debug({ __filename, methodName, body: req.body });

  if (req.body.data.table_name.length > 1) {
    req.log.trace({ __filename, methodName, valid: true });
    return next();
  }
  const message = "table_name is too short";
  next({ status: 400, message: message });
  req.log.trace({ __filename, methodName, valid: false }, message);
}

async function create(req, res) {
  const newTable = await TableService.create(req.body.data);

  res.status(201).json({
    data: newTable[0],
  });
}

async function checkTable(req, res, next) {
  const { table_id = null } = req.params;
  if (table_id === null) {
    const message = "table_id is missing in params";
    next({ status: 400, message: message });
  }
  const tableData = await TableService.checkTable(table_id);
  if (!tableData[0]) {
    const message = `${table_id}-table_id does not exist`;
    return next({ status: 404, message: message });
  }
  if (tableData[0].capacity < res.locals.partySize) {
    const message = `${table_id}-table_id does not have enough capacity for ${res.locals.partySize}`;
    return next({ status: 400, message: message });
  }

  if (tableData[0].occupied) {
    const message = `${table_id}-table_id is occupied`;
    return next({ status: 400, message: message });
  }
  res.locals.tableId = table_id;
  next();
}
async function checkTableFinish(req, res, next) {
  const { table_id = null } = req.params;
  if (table_id === null) {
    const message = "table_id is missing in params";
    next({ status: 400, message: message });
  }
  const tableData = await TableService.checkTable(table_id);
  if (!tableData[0]) {
    const message = `${table_id}-table_id does not exist`;
    return next({ status: 404, message: message });
  }

  if (!tableData[0].occupied) {
    const message = `${table_id}-table_id is not occupied`;
    return next({ status: 400, message: message });
  }
  res.locals.tableId = table_id;
  next();
}

async function update(req, res, next) {
  const updatedTable = await TableService.update(
    res.locals.tableId,
    res.locals.reservationId
  );
  console.log(
    "TABLES CONTROLLER RESID & STATUS",
    res.locals.reservationId,
    res.locals.reservationData
  );
  if (
    res.locals.reservationData.status === "seated" ||
    res.locals.reservationData.status === "finished"
  ) {
    const message = `${res.locals.reservationData.status} reservation status`;
    return next({ status: 400, message: message });
  } else if (res.locals.reservationData.status === "booked") {
    await TableService.reservationStatus(res.locals.reservationId, "seated");
  }

  res.status(200).json({
    data: updatedTable,
  });
}

async function finish(req, res) {
  const finishTable = await TableService.finish(res.locals.tableId);

  await TableService.reservationStatus(res.locals.reservationId, "finished");

  res.status(200).json({
    data: finishTable,
  });
}

async function list(req, res) {
  const methodName = "list";
  req.log.debug({ __filename, methodName });

  const { occupied = null } = req.query;
  const data = await TableService.list(occupied);
  res.json({ data });
  req.log.trace({ __filename, methodName, return: true, data });
}

module.exports = {
  create: [
    hasData,
    hasTableName,
    hasCapacity,
    validNameLength,
    asyncErrorBoundary(create),
  ],
  list: asyncErrorBoundary(list),
  update: [
    hasData,
    hasReservationId,
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(checkTable),
    asyncErrorBoundary(update),
  ],
  finish: [
    asyncErrorBoundary(checkTableFinish),
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(finish),
  ],
};
