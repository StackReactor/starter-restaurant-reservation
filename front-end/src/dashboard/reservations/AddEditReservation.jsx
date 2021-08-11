/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import {
  createReservation,
  readReservation,
  updateReservationDetails,
} from "../../utils/api";
import ErrorAlert from "../../layout/ErrorAlert";
import { getDateInt, getTimeInt } from "../../utils/timeIntegers";

export default function AddEditReservation({ calledAPI, setCalledAPI }) {
  const history = useHistory();
  const [errors, setErrors] = useState(null);
  const [formData, setFormData] = useState({});
  const [reservation, setReservation] = useState({});
  const {
    params: { reservation_id },
  } = useRouteMatch();

  useEffect(loadReservation, []);
  function loadReservation() {
    if (reservation_id) {
      readReservation(reservation_id)
        .then((response) => {
          let {
            first_name,
            last_name,
            mobile_number,
            reservation_date,
            reservation_time,
            people,
          } = response;
          reservation_date = reservation_date.slice(0, 10);
          setReservation(() => ({
            ...reservation,
            first_name,
            last_name,
            mobile_number,
            reservation_date,
            reservation_time,
            people,
          }));
          setFormData(() => ({
            ...formData,
            first_name,
            last_name,
            mobile_number,
            reservation_date,
            reservation_time,
            people,
          }));
        })
        .then(console.log)
        .catch(console.log);
    } else {
      setReservation({
        first_name: "",
        last_name: "",
        mobile_number: "",
        reservation_date: "",
        reservation_time: "",
        people: "",
      });
    }
  }

  useEffect(syncFormAndReservation, [reservation]);
  function syncFormAndReservation() {
    setFormData(() => ({ ...formData, ...reservation }));
  }

  function handleChange({ target }) {
    setFormData(() => ({ ...formData, [target.name]: target.value }));
  }

  function getDateErrors() {
    const errorsArr = [];
    const today = new Date();
    const reservationDate = new Date(
      `${formData.reservation_date} ${formData.reservation_time}`
    );
    const timeNowInt = getTimeInt(today);
    const resTimeInt = getTimeInt(reservationDate);
    const dateNowInt = getDateInt(today);
    const resDateInt = getDateInt(reservationDate);

    if (reservationDate.getDay() === 2) {
      errorsArr.push("The restaurant is closed on Tuesdays");
    }
    if (resDateInt < dateNowInt) {
      errorsArr.push("Date must be in the future");
    }
    if (resTimeInt < 1030 || resTimeInt > 2130) {
      errorsArr.push("Time must be within business hours (10:30 - 21:30)");
    }
    if (dateNowInt === resDateInt && timeNowInt > resTimeInt) {
      errorsArr.push("Time of reservation has already passed today");
    }
    return errorsArr;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setErrors(null);
    const errorsArr = getDateErrors();
    if (!errorsArr.length) {
      if (reservation_id) {
        updateReservationDetails(formData, reservation_id)
          .then(() => setCalledAPI(!calledAPI))
          .then(() =>
            history.push(`/dashboard?date=${formData.reservation_date}`)
          )
          .catch(setErrors);
      } else {
        createReservation(formData)
          .then(() => setCalledAPI(!calledAPI))
          .then(() =>
            history.push(`/dashboard?date=${formData.reservation_date}`)
          )
          .catch(setErrors);
      }
    } else {
      const errorMessage = { message: `${errorsArr.join(", ").trim()}` };
      setErrors(errorMessage);
    }
  }

  return (
    <div>
      <h2>Reserve A Table</h2>
      {errors ? <ErrorAlert error={errors} /> : null}
      <form name="create_reservation" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="first_name">First Name</label>
          <input
            required
            type="text"
            name="first_name"
            value={formData.first_name}
            className="form-control"
            placeholder="Jane"
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="last_name">Last Name</label>
          <input
            required
            type="text"
            name="last_name"
            value={formData.last_name}
            className="form-control"
            placeholder="Appleseed"
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="mobile_number">Mobile Number</label>
          <input
            required
            type="tel"
            name="mobile_number"
            value={formData.mobile_number}
            className="form-control"
            placeholder="123-456-7890"
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="reservation_date">Date</label>
          <input
            required
            type="date"
            name="reservation_date"
            value={formData.reservation_date}
            className="form-control"
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="reservation_time">Time</label>
          <input
            required
            type="time"
            name="reservation_time"
            value={formData.reservation_time}
            className="form-control"
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="people">Number of People</label>
          <input
            required
            type="number"
            name="people"
            value={formData.people}
            className="form-control"
            placeholder="#"
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
        <button
          onClick={history.goBack}
          className="btn btn-secondary ml-1"
          type="button"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
