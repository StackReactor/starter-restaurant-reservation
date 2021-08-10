/**
 * Creates a new Table.
 * @class
 * @param {String} table_name
 * @param {Number} capacity
 */
module.exports = class Table {
  constructor({ table_name = null, capacity = null, reservation_id = null }) {
    this.table_name = table_name;
    this.capacity = capacity;
    this.reservation_id = reservation_id;
  }

  /**
   * @method propNames()
   * @returns {String[]}
   * The list of property names to be used in other methods.
   */
  get propNames() {
    // it's ok for reservation_id to be missing because db defaults it to null
    return ["table_name", "capacity"];
  }

  /**
   * @method hasAllProps()
   * @returns {Boolean}
   * True or false representing the presence of all necessary props.
   */
  hasAllProps() {
    return this.table_name && this.capacity;
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
