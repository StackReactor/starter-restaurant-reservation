/**
 * Creates a new Reservation.
 * @class
 * @param {String} first_name - all names accepted, no format constraints
 * @param {String} last_name - all names accepted, no format constraints
 * @param {String} mobile_number - format: XXX-XXX-XXXX
 * @param {String} reservation_date - format: YYYY-MM-DD
 * @param {String} reservation_time - format: HH:MM (24H)
 * @param {Number} people - integer up to 3 digits representing number of people
 */
module.exports = class Reservation {
  constructor({
    first_name = null,
    last_name = null,
    mobile_number = null,
    reservation_date = null,
    reservation_time = null,
    people = null,
    status = "booked",
  }) {
    this.first_name = first_name;
    this.last_name = last_name;
    this.mobile_number = mobile_number;
    this.reservation_date = reservation_date;
    this.reservation_time = reservation_time;
    this.people = people;
    this.status = status;
  }

  /**
   * @method propNames()
   * @returns {String[]}
   * The list of property names to be used in other methods.
   */
  get propNames() {
    return [
      "first_name",
      "last_name",
      "mobile_number",
      "reservation_date",
      "reservation_time",
      "people",
    ];
  }

  /**
   * @method hasAllProps()
   * @returns {Boolean}
   * True or false representing the presence of all necessary props.
   */
  hasAllProps() {
    return (
      this.first_name &&
      this.last_name &&
      this.mobile_number &&
      this.reservation_date &&
      this.reservation_time &&
      this.people
    );
  }
  /**
   * @method allPropsAreValid()
   * @returns {Boolean}
   * True or false representing the validity of all necessary props.
   */
  allPropsAreValid() {
    const regExForProps = this.regExForProps;
    return (
      regExForProps.mobile_number.test(this.mobile_number) &&
      regExForProps.reservation_time.test(this.reservation_time) &&
      regExForProps.reservation_date.test(this.reservation_date) &&
      regExForProps.people.test(this.people) &&
      typeof this.people === "number"
    );
  }

  /**
   * @method regExForProps() - getter
   * @returns {RegEx{}}
   * Each constructed property is assigned their appropriate formatting.
   */
  get regExForProps() {
    return {
      first_name: /.*/,
      last_name: /.*/,
      mobile_number: /(\d{3}([-])?)?\d{3}([-])?\d{4}/,
      reservation_time: /([2][0-3])|([0-1][0-9])[:][0-5][0-9]/,
      reservation_date: /\d{4}[-]\d{2}[-]\d{2}/,
      people: /\d{1,3}/,
    };
  }

  /**
   * @method invalidProps() - getter
   * @returns {String[]}
   * The names of the properties that are formatted incorrectly.
   */
  get invalidProps() {
    const regExForProps = this.regExForProps;
    const propNames = this.propNames;
    const result = [];

    if (typeof this.people != "number") {
      result.push("people");
    }

    for (let prop of propNames) {
      if (!regExForProps[prop].test(this[prop])) {
        result.push(prop);
      }
    }

    return result;
  }

  /**
   * @method missingProps() - getter
   * @returns {String[]}
   * The names of the properties that are missing.
   */
  get missingProps() {
    const propNames = this.propNames;
    const result = [];
    for (let prop of propNames) {
      if (!this[prop]) {
        result.push(prop);
      }
    }
    return result;
  }
};
