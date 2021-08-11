/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useRouteMatch, useHistory } from "react-router-dom";
import { readReservation, updateTable } from "../../utils/api";
import ErrorAlert from "../../layout/ErrorAlert";

export default function SeatParty({ date, calledAPI, setCalledAPI, tables }) {
  const history = useHistory();
  const [reservation, setReservation] = useState(null);
  const [table, setTable] = useState(tables[0]);
  const [error, setError] = useState(null);
  const abortController = new AbortController();
  const {
    params: { reservation_id },
  } = useRouteMatch();

  useEffect(loadReservation, []);
  function loadReservation() {
    readReservation(reservation_id, abortController.signal)
      .then(setReservation)
      .catch(() => setError({ message: "The reservation was not found" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const dateCopy = date;
    if (reservation && validateCapacity()) {
      updateTable(table.table_id, reservation_id, abortController.signal)
        .then(() => setCalledAPI(!calledAPI))
        .then(history.push(`/dashboard?date=${dateCopy}`))
        .catch(() => setError({ message: "Update failed." }));
    }
  }

  function handleChange({ target }) {
    setTable(() => tables.find((entry) => +entry.table_id === +target.value));
  }

  function validateCapacity() {
    return reservation.people <= table.capacity;
  }

  return (
    <div>
      <h2>Seat Party {reservation_id}</h2>
      <ErrorAlert error={error} />
      <form name="seat-party" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="table_id">Table number:</label>
          <select className="ml-2" onChange={handleChange} name="table_id">
            {tables.map((table) => (
              <option value={table.table_id} key={table.table_id}>
                {table.table_name} - {table.capacity}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" type="submit">
          Submit
        </button>
        <button
          className="btn btn-secondary ml-1"
          onClick={history.goBack}
          type="button"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
