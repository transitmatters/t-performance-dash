const known = [
  /[Uu]p to ([0-9]+) min/, // "Up to 15 minutes"
  /([0-9]+) min/,          // "15 minutes"
  /[A-Za-z]+ speeds/,     // "Reduced speeds"
  /delay/,
  /notice/,
];

const findMatch = (alert) => {
  const text = alert.text;
  for (const exp of known) {
    const match = text.match(exp);
    if (match != null) {
      return match;
    }
  }
  return null;
}

const recognize = (alert) => {
  return !!findMatch(alert);
}

const alertText = (alert) => {
  return findMatch(alert)[0];
};

export {
  recognize,
  alertText,
};
