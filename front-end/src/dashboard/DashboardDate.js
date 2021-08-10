import React from "react";
import { useHistory } from "react-router-dom";
import { previous, next, today } from "../utils/date-time";

function DashboardDate({ date, updateDate }) {
  const history = useHistory();
  const handlePastDay = () => {
    updateDate(previous(date));
    history.push(`/dashboard?date=${previous(date)}`);
  };
  const handleNextDay = () => {
    updateDate(next(date));
    history.push(`/dashboard?date=${next(date)}`);
  };
  const handleToday = () => {
    updateDate(today());
    history.push(`/dashboard`);
  };
  return (
    <div className="d-flex row justify-content-center">
      <button
        className=" btn btn-outline-primary m-3 px-5 rounded-pill"
        onClick={handlePastDay}
      >
        Past Day <br />
        &#8592;
      </button>
      <button
        className=" btn btn-outline-primary m-3 px-5 rounded-pill"
        onClick={handleNextDay}
      >
        Next Day <br />
        &#8594;
      </button>
      <button
        className=" btn btn-primary m-3 px-5 rounded-pill"
        onClick={handleToday}
        disabled={date === today()}
      >
        Today
      </button>
    </div>
  );
}

export default DashboardDate;
