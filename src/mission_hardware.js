import { updateGui } from "./gui";

function updateRoverAppliedTorques(scene, inputs, torque) {
  const rover = scene
    .getPhysicsEngine()
    .getImpostors()
    .find((element) => element.object.name == "rover");

  if (inputs["mf"] == true) {
    rover._joints.forEach((element) => element.joint.setMotor(torque));
  } else if (inputs["mb"] == true) {
    rover._joints.forEach((element) => element.joint.setMotor(-1 * torque));
  } else if (inputs["tl"] == true) {
    rover._joints[0].joint.setMotor(-1); //back left
    rover._joints[1].joint.setMotor(-1); //front left
    rover._joints[2].joint.setMotor(1); //back right
    rover._joints[3].joint.setMotor(1);
  } else if (inputs["tr"] == true) {
    rover._joints[0].joint.setMotor(1);
    rover._joints[1].joint.setMotor(1);
    rover._joints[2].joint.setMotor(-1);
    rover._joints[3].joint.setMotor(-1);
  } else {
    rover._joints.forEach((element) => element.joint.setMotor(0));
  }

  const roverMesh = scene.meshes.find((element) => element.name == "rover");

  const coordinateDict = {
    X: roverMesh.position.x,
    Y: 0,
    Z: roverMesh.position.z,
  };

  updateGui(scene, coordinateDict);
}

export { updateRoverAppliedTorques };
