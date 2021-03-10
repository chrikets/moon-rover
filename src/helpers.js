function randomIntegerWithinRange(max, min, abs) {
  let randInt = Math.floor(Math.random() * (max - min) + min);

  if (abs) {
    return randInt;
  }

  if (Math.random() < 0.5) {
    return (randInt *= -1);
  }
  return randInt;
}

function randomFloatWithinRange(max, min, abs) {
  let randFloat = Math.random() * (max - min);

  if (abs) {
    return randFloat;
  }

  if (Math.random() < 0.5) {
    return (randFloat *= -1);
  }

  return randFloat;
}

export { randomIntegerWithinRange, randomFloatWithinRange };
