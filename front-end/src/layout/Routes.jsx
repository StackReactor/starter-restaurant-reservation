import React, { useState, useEffect } from "react";
import AddEditReservation from "../dashboard/reservations/AddEditReservation";
import NewTable from "../dashboard/tables/NewTable";
import SeatParty from "../dashboard/reservations/SeatParty";
import SearchMobileNumber from "../dashboard/reservations/SearchMobileNumber";
import { listTables, listReservations } from "../utils/api";
import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import useQuery from "../utils/useQuery";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
export default function Routes() {
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tablesError, setTablesError] = useState(null);
  const [calledAPI, setCalledAPI] = useState(false);

  const query = useQuery();
  const dateQuery = query.get("date");
  const date = dateQuery ? dateQuery : today();

  useEffect(loadReservations, [calledAPI, date]);
  function loadReservations() {
    const abortController = new AbortController();
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
  }

  useEffect(loadTables, [calledAPI]);
  function loadTables() {
    const abortController = new AbortController();
    listTables(abortController.signal).then(setTables).catch(setTablesError);
  }

  return (
    <Switch>
      <Route exact path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact path="/tables/new">
        <NewTable
          date={date}
          calledAPI={calledAPI}
          setCalledAPI={setCalledAPI}
        />
      </Route>
      <Route exact path="/reservations/:reservation_id/edit">
        <AddEditReservation calledAPI={calledAPI} setCalledAPI={setCalledAPI} />
      </Route>
      <Route exact path="/reservations/:reservation_id/seat">
        <SeatParty
          date={date}
          reservations={reservations}
          setReservations={setReservations}
          calledAPI={calledAPI}
          setCalledAPI={setCalledAPI}
          tables={tables}
          setTables={setTables}
        />
      </Route>
      <Route exact path="/reservations/new">
        <AddEditReservation calledAPI={calledAPI} setCalledAPI={setCalledAPI} />
      </Route>
      <Route exact path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact path="/search">
        <SearchMobileNumber
          reservations={reservations}
          setReservations={setReservations}
          setReservationsError={setReservationsError}
        />
      </Route>
      <Route path="/dashboard">
        <Dashboard
          date={date}
          tables={tables}
          reservations={reservations}
          setReservations={setReservations}
          reservationsError={reservationsError}
          setReservationsError={setReservationsError}
          setTables={setTables}
          tablesError={tablesError}
          calledAPI={calledAPI}
          setCalledAPI={setCalledAPI}
        />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}
