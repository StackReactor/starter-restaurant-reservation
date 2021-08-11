import React from "react";
import { finishTable } from "../../utils/api";
import ErrorAlert from "../ErrorAlert";

/**
 * Defines the dashboard all tables component.
 *
 * @returns {JSX.Element}
 */
function DashboardTable({
  loadAllReservations,
  loadDashboard,
  loadTables,
  tables,
  tablesError,
  setTablesError,
}) {
  async function finishClick(event) {
    if (
      window.confirm(
        "Is this table ready to seat new guests? This cannot be undone."
      )
    ) {
      const abortController = new AbortController();
      const reservationTableIds = event.target.value.split(",");
      
      Promise.all([
        // reservationStatusUpdate(
        //   reservationTableIds[1], //reservation_id
        //   "finished",
        //   abortController.signal
        // ),

        finishTable(
          reservationTableIds[0], //table_id
          reservationTableIds[1], //reservation_id
          abortController.signal
        ),
      ])
        .then(loadTables)
        .then(loadAllReservations)
        .then(loadDashboard)
        .catch(setTablesError);

      return () => abortController.abort();
    } else {
      //do nothing
    }
  }

  return (
    <main>
      <div className="mb-3 container-fluid ">
        <h4 className="mb-0 text-center ">Tables</h4>
      </div>
      <ErrorAlert error={tablesError} />
      <div className="d-flex flex-wrap container-fluid justify-content-center">
        {tables.map((table) => (
          <div
            className=" border  border-secondary d-flex flex-column p-3 col table text-center"
            key={table.table_id}
          >
            <h4 className="mb-0 pt-3">
              {table.table_name} - {table.capacity}
            </h4>

            <p data-table-id-status={table.table_id} className="occupied ">
              {table.occupied ? "Occupied" : "Free"}
            </p>
            <p className="text-center">
              {table.occupied ? `Res. #${table.reservation_id}` : null}
            </p>
            <button
              className="btn btn-outline-primary bg-white rounded-pill "
              onClick={finishClick}
              value={[table.table_id, table.reservation_id]}
              data-table-id-finish={table.table_id}
              data-reservation-id-status={table.reservation_id}
              disabled={!table.occupied}
            >
              Finish
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default DashboardTable;
