import React from "react";
import ErrorAlert from "../layout/ErrorAlert";
import SeatReservation from "../layout/Reservation/SeatReservation";

/**
 * Defines the dashboard all reservations component.
 *
 * @returns {JSX.Element}
 */
function DashboardAllReservations({ reservations, reservationsError }) {
  return (
    <main>
      <div className="mb-3 container-fluid">
        <h4 className="mb-0 text-center">All Booked Or Seated Reservations</h4>
      </div>

      <ErrorAlert error={reservationsError} />
      <div className="d-flex flex-wrap container-fluid m-auto justify-content-center">
        {reservations.map((reservation) =>
          reservation.status === "finished" ||
          reservation.status === "cancelled" ? null : (
            <div
              className="d-flex flex-column border border-dark rounded-lg p-3 col-sm col-lg-5 reservation-all m-1"
              key={reservation.reservation_id}
            >
              <SeatReservation reservation={reservation} />
            </div>
          )
        )}
      </div>
    </main>
  );
}

export default DashboardAllReservations;
