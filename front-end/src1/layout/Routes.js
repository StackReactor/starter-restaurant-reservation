import React, { useEffect, useState } from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import CreateReservation from "./Reservation/CreateReservation";
import SearchReservation from "./Reservation/SearchReservations";
import CreateTable from "./Table/CreateTable";
import SeatTable from "./Table/SeatTable";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import EditReservation from "./Reservation/EditReservation";
import { listReservations, listTables } from "../utils/api";
import useQuery from "../utils/useQuery";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  const [date, setDate] = useState(today());
  async function updateDate(newDate) {
    setDate(newDate);
  }

  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);
  const [reservationsDate, setReservationsDate] = useState([]);
  const [reservationsDateError, setReservationsDateError] = useState(null);
  const [bookedReservations, setBookedReservations] = useState([]);
  const [bookedReservationsError, setBookedReservationsError] = useState(null);

  function loadTables() {
    const abortController = new AbortController();
    listTables({}, abortController.signal)
      .then(setTables)
      .catch(setTablesError);
    return () => abortController.abort();
  }
  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsDateError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservationsDate)
      .catch(setReservationsDateError);
    return () => abortController.abort();
  }
  function loadAllReservations() {
    const abortController = new AbortController();
    listReservations({}, abortController.signal)
      .then(setBookedReservations)
      .catch(setBookedReservationsError);
    return () => abortController.abort();
  }
  useEffect(loadTables, []);
  useEffect(loadAllReservations, []);
  useEffect(loadDashboard, [date]);

  const query = useQuery();
  const dateQuery = query.get("date");

  useEffect(() => {
    if (dateQuery != null) {
      setDate(dateQuery);
    }
  }, [dateQuery]);

  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>

      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route path="/reservations/:reservation_id/seat">
        <SeatTable />
      </Route>
      <Route path="/reservations/:reservation_id/edit">
        <EditReservation today={today()} updateDate={updateDate} />
      </Route>
      <Route exact={true} path="/reservations/new">
        <CreateReservation today={today()} updateDate={updateDate} />
      </Route>
      <Route path="/dashboard">
        <Dashboard
          date={date}
          today={today()}
          updateDate={updateDate}
          loadAllReservations={loadAllReservations}
          loadDashboard={loadDashboard}
          loadTables={loadTables}
          tables={tables}
          tablesError={tablesError}
          setTablesError={setTablesError}
          listTables={listTables}
          reservationsDate={reservationsDate}
          setReservationsDate={setReservationsDate}
          reservationsDateError={reservationsDateError}
          bookedReservations={bookedReservations}
          setBookedReservations={setBookedReservations}
          bookedReservationsError={bookedReservationsError}
          setBookedReservationsError={setBookedReservationsError}
        />
      </Route>
      <Route exact={true} path="/tables/new">
        <CreateTable
          loadAllReservations={loadAllReservations}
          loadDashboard={loadDashboard}
          loadTables={loadTables}
        />
      </Route>
      <Route exact={true} path="/search">
        <SearchReservation />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
