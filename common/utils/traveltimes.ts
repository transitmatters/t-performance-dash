export const averageTravelTime = (traveltimes: (number | undefined)[]) => {
  if (traveltimes && traveltimes.length >= 1) {
    const totalSum = traveltimes.reduce((a, b) => {
      if (a && b) {
        return a + b;
      } else {
        return 0;
      }
    });
    return (totalSum || 0) / traveltimes.length;
  } else {
    return 0;
  }
};
