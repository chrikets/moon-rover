import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math";

import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";

//side effect imports
import "@babylonjs/core/Meshes/meshBuilder";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Meshes/Builders/sphereBuilder";
import "@babylonjs/core/Meshes/Builders/boxBuilder";
import "@babylonjs/core/Meshes/Builders/groundBuilder";
import "@babylonjs/core/Physics/physicsEngineComponent";

import { buildBaseScene, bindSceneCamera } from "./scene_objects.js";

import { generateGui } from "./gui.js";

import { updateRoverAppliedTorques } from "./mission_hardware";

const canvas = document.querySelector("#renderCanvas");
const engine = new Engine(canvas);

let lois = [];
let torque = 5;
let keyboardInputs = { mf: false, mb: false, tl: false, tr: false };

function updateTorqueScalar(newTorque) {
  torque = newTorque;
}

function updateLois(newLocation) {
  lois.push(newLocation);
}

const createScene = () => {
  let scene = new Scene(engine);

  buildBaseScene(scene, canvas);

  bindSceneCamera(scene, canvas);

  generateGui(scene);

  function getForwardVector(_mesh) {
    _mesh.computeWorldMatrix(true);
    let forward_local = new Vector3(0, 0, 1);
    let worldMatrix = _mesh.getWorldMatrix();
    return Vector3.TransformNormal(forward_local, worldMatrix);
  }

  let inputMap = {};
  scene.actionManager = new ActionManager(scene);
  scene.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, function (evt) {
      inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    })
  );
  scene.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, function (evt) {
      inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    })
  );

  let onKeyDown = function (event) {
    console.log(event);
    switch (event.keyCode) {
      case 87: // w
        keyboardInputs["mf"] = true;
        break;

      case 83: // s
        keyboardInputs["mb"] = true;
        break;

      case 65: // a
        keyboardInputs["tl"] = true;
        break;

      case 68: // d
        keyboardInputs["tr"] = true;
        break;
    }
  };

  let onKeyUp = function (event) {
    Object.keys(keyboardInputs).forEach((key) => (keyboardInputs[key] = false));
  };

  canvas.addEventListener("keydown", onKeyDown, false);
  canvas.addEventListener("keyup", onKeyUp, false);

  scene.onDispose = function () {
    canvas.removeEventListener("keydown", onKeyDown);
    canvas.removeEventListener("keyup", onKeyUp);
  };

  scene.onBeforeRenderObservable.add(() => {
    updateRoverAppliedTorques(scene, keyboardInputs, torque);
  });

  scene.registerBeforeRender(function () {});

  return scene;
};

let scene = createScene();

engine.runRenderLoop(() => {
  scene.render();
});

export { updateTorqueScalar, updateLois };
