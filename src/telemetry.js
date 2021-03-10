import { randomFloatWithinRange, randomIntegerWithinRange } from "./helpers.js";

class TelemetryMessageBase {
  constructor() {}
}

class TelemetryMessageRover {
  constructor(postion) {
    this.postion = postion;
    this.origin = "rover";
    this.timestamp = Date.now();
    this.internaltemp = "Some_internal_temp";
    this.effectivecharge = "Effective charge";
    this.currentpwrconsumption = "power_consumption/s";
    this.currentSpeed = "n_cm/s";
    this.currentHeading = "direction_heading";
    this.payloadMsg = new TelemeMessagePayload();
  }
}

class TelemeMessagePayload {
  constructor() {
    this.timestamp = Date.now();
    this.name = "spectrometer";
    this.data = { data: "data", time: "time" };
    this.status = "nominal";
    this.powerconsump = "some_number/s";
    this.uptime = "uptime";
  }
}

export { TelemetryMessageBase, TelemetryMessageRover, TelemeMessagePayload };
