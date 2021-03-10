import { TelemetryMessageRover } from "./telemetry.js";
import { createMoonRocks, createWaypointSphere } from "./scene_objects";
import { updateTorqueScalar, updateLois } from "./index.js";

function parseCli(cliInput, scene) {
  if (cliInput.trim().length === 0) {
    return "No command entered";
  }

  const knownCmds = ["CLEAR", "CONFIRM", "ROVER", "SIMULATION"];

  const _cliInput = cliInput.toUpperCase();
  const cmd = _cliInput.split(".");
  const entryCmd = cmd[0];

  if (!knownCmds.includes(entryCmd)) {
    return "Unknown command.";
  }

  if (entryCmd == "CLEAR") {
    return "CLEAR";
  }

  if (entryCmd == "CONFIRM") {
    return "CONFIRM";
  }

  if (entryCmd == "ROVER") {
    return parseRoverCommands(cmd, scene);
  }

  if (entryCmd == "SIMULATION") {
    return parseSimulationCommands(cmd, scene);
  }
}

function parseRoverCommands(cmd, scene) {
  const roverCmds = [
    "DANGEROUS_COMMAND",
    "DRIVE",
    "HOLD",
    "IMAGING",
    "MARKLOC",
    "PAYLOAD",
    "REPORT",
    "ROTATE",
    "SAFE",
    "TORQUE",
    "WAYPOINT",
  ];

  if (!roverCmds.includes(cmd[1])) {
    return "Unknown rover command";
  }

  if (cmd[1] == "DANGEROUS_COMMAND") {
    return "Cannot comply";
  }

  if (cmd[1] == "DRIVE") {
    return "CMD NOT IMPLEMENTED";
  }

  if (cmd[1] == "HOLD") {
    //call rover stop
    return "Rover is holding for mission command";
  }

  if (cmd[1] == "IMAGING") {
    return "CMD NOT IMPLEMENTED";
  }

  if (cmd[1] == "MARKLOC") {
    if (cmd.length < 3) {
      return "No coordinates or quick cmd detected!";
    }

    if (cmd[2] == "HERE") {
      const roverMesh = scene.meshes.find((element) => element.name == "rover");
      updateLois([roverMesh.position.z, roverMesh.position.x]);
      return "Added this location to LOIs";
    }

    if (cmd.length < 4) {
      return "Correct x, y coordinates not entered";
    }

    updateLois([cmd[2], cmd[3]]);
    return "Location of interest marked";
  }

  if (cmd[1] == "PAYLOAD") {
    const msg = JSON.stringify(
      new TelemetryMessageRover(
        `${roverObject.position.x}, ${roverObject.position.y}`
      )
    );

    return "Rover and payload telemetry sent";
  }

  if (cmd[1] == "REPORT") {
    return "CMD NOT IMPLEMENTED";
  }

  if (cmd[1] == "ROTATE") {
    return "CMD NOT IMPLEMENTED";
  }

  if (cmd[1] == "SAFE") {
    return "Rover entering safety posture.";
  }

  if (cmd[1] == "TORQUE") {
    if (cmd.length < 3) {
      return "Missing torque value";
    }

    if (!typeof cmd[2] == "number") {
      return "Torque value must be a scalar, and will be converted to a positive value if less than zero.";
    }

    let _torque = cmd[2];

    if (_torque < 0) {
      _torque *= -1;
    }

    updateTorqueScalar(_torque);

    return `Rover f/r torque changed to ${_torque}`;
  }

  if (cmd[1] == "WAYPOINT") {
    if (cmd.length < 4) {
      return "Correct x, y coordinates not entered";
    }

    const destination = [cmd[2], cmd[3]];

    createWaypointSphere(scene, destination);
    return "Waypoint marked";
  }

  return "Unknown rover command";
}

function parseSimulationCommands(cmd, scene) {
  const simulationCommands = ["GENERATE_ROCKS"];

  if (!simulationCommands.includes(cmd[1])) {
    return "Unknown simulation command";
  }

  if (cmd.length < 3) {
    return "Missing parameter, quantity of moon rocks to generate.";
  }

  let _numberRocks = cmd[2];

  if (!typeof _numberRocks == "number") {
    return "The last delimited parameter should be positive scalar value.";
  }

  if (_numberRocks < 0) {
    _numberRocks *= -1;
  }

  createMoonRocks(scene, _numberRocks);

  return `${_numberRocks} rocks have been created. I cannot guarantee your rover's safety.`;
}

export { parseCli };
