import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../../utils/api";
import ErrorAlert from "../../layout/ErrorAlert";

export default function NewTable({ date, calledAPI, setCalledAPI }) {
  const history = useHistory();
  const [errors, setErrors] = useState(null);
  const [formData, setFormData] = useState({
    table_name: "",
    capacity: "",
  });

  function handleChange({ target }) {
    return setFormData(() => ({ ...formData, [target.name]: target.value }));
  }

  function validateData() {
    const errorsArr = [];
    if (formData.table_name.length < 2) {
      errorsArr.push("table name is too short");
    }
    if (formData.capacity < 1) {
      errorsArr.push("table capacity must be at least 1");
    }
    return errorsArr;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setErrors(null);
    const errorsArr = validateData();
    if (!errorsArr.length) {
      createTable(formData)
        .then(() => setCalledAPI(() => !calledAPI))
        .then(history.push(`/dashboard?date=${date}`))
        .catch(setErrors);
    } else {
      const errorMessage = { message: `${errorsArr.join(", ").trim()}` };
      setErrors(errorMessage);
    }
  }

  return (
    <div>
      <h2>Create Table</h2>
      {errors ? <ErrorAlert error={errors} /> : null}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="table_name">Table Name</label>
          <input
            required
            type="text"
            name="table_name"
            value={formData.table_name}
            className="form-control"
            onChange={handleChange}
            placeholder="#5"
          ></input>
        </div>
        <div className="form-group">
          <label htmlFor="capacity">Capacity</label>
          <input
            required
            type="number"
            name="capacity"
            value={formData.capacity}
            className="form-control"
            onChange={handleChange}
            placeholder="Party Size"
          ></input>
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
        <button
          type="button"
          onClick={() => history.goBack()}
          className="btn btn-secondary ml-1"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
