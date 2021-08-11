// import React, { useState } from "react";
// import { useHistory } from "react-router-dom";
// import { listReservationsForPhoneNumber } from "../../utils/api";
// import ReservationCard from "./ReservationCard";
// import ErrorAlert from "../../layout/ErrorAlert";

// export default function SearchMobileNumber() {
//   const [mobileNumber, setMobileNumber] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [error, setError] = useState(null);
//   const history = useHistory();

//   function handleChange({ target }) {
//     setMobileNumber(() => target.value);
//   }

//   function handleSubmit(event) {
//     const abortController = new AbortController();
//     event.preventDefault();
//     listReservationsForPhoneNumber(mobileNumber, abortController.signal)
//       .then(setSearchResults)
//       .catch(setError);
//   }

//   return (
//     <div>
//       {error && <ErrorAlert error={error} />}
//       <form className="mt-2" name="search_for_number" onSubmit={handleSubmit}>
//         <label html>
//           <h2>Search by Mobile Number</h2>
//         </label>
//         <div className="row">
//           <div className="col-lg-8 col-sm-6 col-xs-8">
//             <input
//               required
//               name="mobile_number"
//               type="text"
//               value={mobileNumber}
//               className="form-control"
//               placeholder="Enter a customer's phone number"
//               onChange={handleChange}
//             />
//           </div>
//           <div className="col-lg-4 col-sm-6 col-xs-4 mt-1">
//             <button type="submit" className="btn btn-primary">
//               Find
//             </button>
//             <button
//               type="button"
//               className="btn btn-secondary ml-1"
//               onClick={() => history.goBack()}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </form>
//       <div className="mt-4">
//         {searchResults.length ? (
//           searchResults.map((reservation) => (
//             <ReservationCard reservation={reservation} />
//           ))
//         ) : (
//           <h1>No reservations found</h1>
//         )}
//       </div>
//     </div>
//   );
// }
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { listReservationsForPhoneNumber } from "../../utils/api";
import ReservationCard from "./ReservationCard";
import ErrorAlert from "../../layout/ErrorAlert";

export default function SearchMobileNumber() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [findPressed, setFindPressed] = useState(false);
  const [error, setError] = useState(null);
  const history = useHistory();

  function handleChange({ target }) {
    setMobileNumber(() => target.value);
  }

  function handleSubmit(event) {
    const abortController = new AbortController();
    setFindPressed(false);
    event.preventDefault();
    listReservationsForPhoneNumber(mobileNumber, abortController.signal)
      .then((response) => {
        setFindPressed(true);
        return response;
      })
      .then(setSearchResults)
      .catch(setError);
  }

  return (
    <div>
      {error && <ErrorAlert error={error} />}
      <form className="mt-2" name="search_for_number" onSubmit={handleSubmit}>
        <label html>
          <h2>Search by Mobile Number</h2>
        </label>
        <div className="row">
          <div className="col-lg-8 col-sm-6 col-xs-8">
            <input
              required
              name="mobile_number"
              type="text"
              value={mobileNumber}
              className="form-control"
              placeholder="Enter a customer's phone number"
              onChange={handleChange}
            />
          </div>
          <div className="col-lg-4 col-sm-6 col-xs-4 mt-1">
            <button type="submit" className="btn btn-primary">
              Find
            </button>
            <button
              type="button"
              className="btn btn-secondary ml-1"
              onClick={() => history.goBack()}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
      <div className="mt-4">
        {searchResults.length
          ? searchResults.map((reservation) => (
              <ReservationCard reservation={reservation} />
            ))
          : findPressed && <h1>No reservations found</h1>}
      </div>
    </div>
  );
}
