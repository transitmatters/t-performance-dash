const known = [
  /[Uu]p to ([0-9]+) min/, // "Up to 15 minutes"
  /([0-9]+) min/,          // "15 minutes"
  /[A-Za-z]+ speeds/,     // "Reduced speeds"
  /delay/,
  /notice/,
  /[Ss]huttle/,  // might want to worry about this one...
];

// TODO: audit this. Like, list all the alerts
// to see what filters are actually accurate
const anti = [
  / stop .* move /i, // "The stop X will permanently move to Y"
  /temporary stop/
]

const findMatch = (alert) => {
  const text = alert.text;

  if (anti.some((exp) => text.match(exp))) {
    return false;
  }
  return known.some((exp) => text.match(exp))
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
