import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../../layout/ErrorAlert";
import { createTable } from "../../utils/api";

/**
 * Defines the create table page.
 *
 * @returns {JSX.Element}
 */

function CreateTable(loadTables, loadAllReservations, loadDashboard) {
  const initialFormState = {
    table_name: "",
    capacity: 0,
  };
  const [formData, setFormData] = useState({ ...initialFormState });
  const [tablesError, setTablesError] = useState(null);
  const history = useHistory();

  const handleChange = ({ target }) => {
    setFormData({
      ...formData,
      [target.name]: target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const abortController = new AbortController();
      await createTable(formData, abortController.signal);
      await loadTables;
      await loadAllReservations;
      await loadDashboard;
      history.push(`/dashboard`);
    } catch (error) {
      setTablesError(error);
    }
  };

  const handleCancel = (event) => {
    event.preventDefault();
    history.goBack();
  };

  return (
    <main>
      <h1>Create New Table</h1>
      <div className="d-md-flex mb-3">
        <form onSubmit={handleSubmit} className="column">
          <label>
            Table Name
            <br />
            <input
              type="text"
              id="table_name"
              name="table_name"
              required
              value={formData.table_name}
              onChange={handleChange}
              className="w-100"
              minLength="2"
              placeholder="Enter Table Name"
            />
          </label>

          <br />
          <label>
            Seating Capacity
            <br />
            <input
              type="number"
              id="capacity"
              name="capacity"
              required
              value={formData.capacity}
              onChange={handleChange}
              className="w-100"
              min="1"
            />
          </label>
          <div className="container">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary m-1 rounded-pill"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary m-1 rounded-pill">
              Submit
            </button>
          </div>
        </form>
        <ErrorAlert error={tablesError} />
      </div>
    </main>
  );
}

export default CreateTable;
