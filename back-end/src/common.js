function getPropsErrorMessage(missingOrInvalid, props) {
  let message = `${missingOrInvalid} properties: `;
  const len = props.length;
  for (let i = 0; i < len; i++) {
    const prop = props[i];
    message += prop;
    if (i < len - 1) {
      message += ", ";
    } else {
      message += ".";
    }
  }
  return message;
}

module.exports = { getPropsErrorMessage };
