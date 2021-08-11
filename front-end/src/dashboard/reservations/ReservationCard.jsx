import React from "react";
import { Link } from "react-router-dom";
import { updateReservationStatus } from "../../utils/api";

export default function ReservationCard({
  reservation,
  calledAPI,
  setCalledAPI,
}) {
  function handleCancel() {
    const abortController = new AbortController();
    const answer = window.confirm(
      "Do you want to cancel this reservation?\n\nThis cannot be undone."
    );
    if (answer) {
      updateReservationStatus(
        Number(reservation.reservation_id),
        "cancelled",
        abortController.signal
      )
        .then(() => setCalledAPI(!calledAPI))
        .catch(console.log);
    }
  }

  function upperCaseStatus() {
    return (
      reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)
    );
  }

  function getStatusStyle() {
    const style = { color: "" };
    if (reservation.status === "booked") {
      style.color = "green";
    }
    if (reservation.status === "seated") {
      style.color = "orange";
    }
    return style;
  }

  return (
    <div className="card mt-1">
      <div className="card-body">
        <h5 className="card-title">
          Name: {`${reservation.first_name} ${reservation.last_name}`}
        </h5>
        <p className="card-text">Number: {reservation.mobile_number}</p>
        <p className="card-text">Date: {reservation.reservation_date}</p>
        <p className="card-text">Time: {reservation.reservation_time}</p>
        <p className="card-text">Party Size: {reservation.people}</p>
        <p className="card-text">
          Status:{" "}
          <span
            data-reservation-id-status={reservation.reservation_id}
            style={getStatusStyle()}
          >
            {upperCaseStatus()}
          </span>
        </p>
      </div>
      {reservation.status === "booked" && (
        <div>
          <Link
            className="btn btn-primary w-25 mb-1 ml-1"
            to={`/reservations/${reservation.reservation_id}/seat`}
          >
            Seat
          </Link>
          <Link
            className="btn btn-secondary w-25 mb-1 ml-1"
            to={`/reservations/${reservation.reservation_id}/edit`}
          >
            Edit
          </Link>
          <button
            type="button"
            data-reservation-id-cancel={reservation.reservation_id}
            onClick={handleCancel}
            className="btn btn-danger w-25 mb-1 ml-1"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
