/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { deletePartyFromTable } from "../../utils/api";

export default function TableCard({ calledAPI, setCalledAPI, table }) {
  const [error, setError] = useState(null);

  function handleFinish() {
    const abortController = new AbortController();
    const answer = window.confirm(
      "Is this table ready to seat new guests? \n\nThis cannot be undone."
    );
    if (answer) {
      deletePartyFromTable(table.table_id, abortController.signal)
        .then(() => setCalledAPI(() => !calledAPI))
        .catch(setError);
    }
  }

  function getStatusStyle() {
    const style = { color: "" };
    if (table.reservation_id) {
      style.color = "red";
    } else {
      style.color = "green";
    }
    return style;
  }

  return (
    <div className="card" key={table.table_id}>
      <div className="card-body">
        <h5 className="card-title">Table: {table.table_name}</h5>
        <p className="card-text">Capacity: {table.capacity}</p>
        <p>
          Status:{" "}
          <span data-table-id-status={table.table_id} style={getStatusStyle()}>
            {table.reservation_id ? "Occupied" : "Free"}
          </span>
        </p>
        {table.reservation_id && (
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleFinish}
            data-table-id-finish={table.table_id}
          >
            Finish
          </button>
        )}
      </div>
    </div>
  );
}
