import React, { useEffect } from "react";

import ErrorAlert from "../layout/ErrorAlert";
import DashboardDate from "./DashboardDate";
import DashboardAllReservations from "./DashboardAllReservations";
import DashboardTable from "../layout/Table/DashboardTable";

/**
 * Defines the dashboard page.
 * @param date
 * @param updateDate
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({
  date,
  updateDate,
  loadAllReservations,
  loadDashboard,
  loadTables,
  tables,
  tablesError,
  setTablesError,
  listTables,
  reservationsDate,
  reservationsDateError,
  bookedReservations,
  bookedReservationsError,
  today,
}) {
  useEffect(loadTables, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(loadAllReservations, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(loadDashboard, [date]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <main>
      <h1>Dashboard</h1>
      <div className="text-center mb-3 px-5 pt-1 ">
        <h4 className="mb-0">Reservations on: {date}</h4>
      </div>
      <ErrorAlert error={reservationsDateError} />
      <div className="d-flex flex-wrap container-fluid justify-content-center ">
        {!reservationsDate.length ? (
          <p className="no-res">No reservations</p>
        ) : (
          reservationsDate.map((reservation) => (
            <div
              className="d-flex flex-column m-1 p-3 border border-dark rounded-lg col-sm col-md-3 col-lg-2 reservation-date"
              key={reservation.reservation_id}
            >
              <h4 className="mb-0">Res. #{reservation.reservation_id}</h4>
              <h5 className="mb-0">--{reservation.status.toUpperCase()}--</h5>
              <p className="mb-0">
                {reservation.first_name} {reservation.last_name}
              </p>
              <p className="mb-0">{reservation.mobile_number}</p>
              <p className="mb-0">Date: {reservation.reservation_date}</p>
              <p className="mb-0">Time: {reservation.reservation_time}</p>
              <p className="mb-0">Party Size: {reservation.people}</p>
            </div>
          ))
        )}
      </div>
      <div className="w-100 px-5 ">
        <DashboardDate date={date} updateDate={updateDate} today={today} />
      </div>
      <div className="d-flex row mb-3 mx-auto container-fluid justify-content-center">
        <div className="col-sm-12 col-lg-6 d-flex flex-wrap row container-fluid ">
          <DashboardAllReservations
            reservations={bookedReservations}
            reservationsError={bookedReservationsError}
          />
        </div>
        <div className="col ">
          <DashboardTable
            loadAllReservations={loadAllReservations}
            loadDashboard={loadDashboard}
            loadTables={loadTables}
            tables={tables}
            tablesError={tablesError}
            setTablesError={setTablesError}
            listTables={listTables}
          />
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
