import { Vector3 } from "@babylonjs/core/Maths/math";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { FollowCamera } from "@babylonjs/core/Cameras";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { GridMaterial } from "@babylonjs/materials/grid";
//use grid material for rover, lander, moon rocks
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import * as CANNON from "cannon";
//side effect imports
import "@babylonjs/core/Meshes/meshBuilder";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Meshes/Builders/sphereBuilder";
import "@babylonjs/core/Meshes/Builders/boxBuilder";
import "@babylonjs/core/Meshes/Builders/groundBuilder";
import "@babylonjs/core/Physics/physicsEngineComponent";

import { CannonJSPlugin } from "@babylonjs/core/Physics/Plugins";
import { PhysicsImpostor } from "@babylonjs/core/Physics/physicsImpostor";
import { HingeJoint } from "@babylonjs/core/Physics/physicsJoint";

import { randomFloatWithinRange, randomIntegerWithinRange } from "./helpers";

let environmentScaleVals = {
  map: {
    basewidth_px: 1024,
    baseheight_px: 512,
    baselunarwidth_km: 0,
    baselunarheight_km: 0,
    meshsubdivisions: 250,
    meshelevationmax: 5,
    meshelevationmin: -10,
  },
  skybox: {
    height_units: 1000,
    width_px: 0,
    depth_px: 0,
  },
  objects: {
    numberLunarRocks: 150,
  },
};

function createSceneMaterials(scene) {
  const groundMaterial = new StandardMaterial("groundMaterial", scene);
  groundMaterial.diffuseTexture = new Texture(
    "./src/textures/lunar/1024x512_lroc_color.jpg",
    scene
  );

  const defaultGridMaterial = new GridMaterial("defaultGridMaterial", scene);
  defaultGridMaterial.majorUnitFrequency = 5;
  defaultGridMaterial.gridRatio = 0.5;

  const firmamentMaterial = new StandardMaterial("firmamentMaterial", scene);
  firmamentMaterial.diffuseColor = new Color3.Black();
  firmamentMaterial.specularColor = new Color3.Black();
  firmamentMaterial.emissiveColor = new Color3.Black();
  firmamentMaterial.ambientColor = new Color3.Black();
  firmamentMaterial.backFaceCulling = false;

  const waypointMaterial = new StandardMaterial("waypointMaterial", scene);
  waypointMaterial.diffuseColor = new Color3(1, 0, 1);
  waypointMaterial.specularColor = new Color3(0.5, 0.6, 0.87);
  waypointMaterial.emissiveColor = new Color3(1, 1, 1);
  waypointMaterial.ambientColor = new Color3(0.23, 0.98, 0.53);
}

function createRover(scene) {
  let wheels = [];
  let joints = [];

  const rover = new Mesh.CreateBox("rover", 1, scene);
  rover.scaling.y = 0.4;
  rover.scaling.x = 0.9;

  rover.physicsImpostor = new PhysicsImpostor(
    rover,
    PhysicsImpostor.BoxImpostor,
    { mass: 5, friction: 0.1, restitution: 1 },
    scene
  );

  rover.material = scene.materials.find(
    (element) => element.name == "defaultGridMaterial"
  );

  for (let i = 0; i < 4; i++) {
    wheels[i] = new MeshBuilder.CreateCylinder(
      `wheel${i}`,
      { height: 0.1, diameterTop: 0.5, diameterBottom: 0.5, tessellation: 50 },
      scene
    );

    wheels[i].material = rover.material;

    wheels[i].rotation.z = Math.PI / 2;
    wheels[i].position.y = 2;
    wheels[i].position.x = Math.floor(i / 2);
    wheels[i].position.z = i % 2;

    wheels[i].physicsImpostor = new PhysicsImpostor(
      wheels[i],
      PhysicsImpostor.CylinderImpostor,
      { mass: 6, friction: 1, restitution: 0.6 },
      scene
    );

    joints[i] = new HingeJoint({
      mainPivot: new Vector3(-0.5 + wheels[i].position.x, -0.2, -0.5 + (i % 2)),
      connectedPivot: new Vector3(0, 0, 0),
      mainAxis: new Vector3(Math.floor(i / 2) * 2 - 1, 0, 0),
      connectedAxis: new Vector3(0, 1, 0),
    });

    rover.physicsImpostor.addJoint(wheels[i].physicsImpostor, joints[i]);
  }

  rover.position.y = 11.8;
  rover.position.x = 0;
  rover.position.z = 0;

  return rover;
}

function createGroundFromLunarMaps(scene) {
  const grnd = MeshBuilder.CreateGroundFromHeightMap(
    "groundFromHeightMap",
    "./src/textures/lunar/1024x512_lroc_hm.jpg",
    {
      width: 1024,
      height: 1024,
      subdivisions: 360,
      minHeight: -10,
      maxHeight: 20,
      onReady: function () {
        grnd.physicsImpostor = new PhysicsImpostor(
          grnd,
          PhysicsImpostor.HeightmapImpostor,
          { mass: 0, friction: 1 }
        );
      },
    },
    scene
  );

  grnd.material = scene.materials.find(
    (element) => element.name == "groundMaterial"
  );
}

function createFirmament(scene) {
  const firmament = MeshBuilder.CreateSphere(
    "firmament",
    { segments: 20, diameter: 1000 },
    scene
  );
  firmament.position.x = 0;
  firmament.position.y = 0;
  firmament.position.z = 0;

  firmament.material = scene.materials.find(
    (element) => element.name == "firmamentMaterial"
  );
}

function createMoonRocks(scene, numberOfRocks) {
  for (let i = 0; i < numberOfRocks; ++i) {
    let _moonRock = MeshBuilder.CreatePolyhedron(
      `rock_${i}`,
      {
        type: randomIntegerWithinRange(1, 14, true),
        size: randomFloatWithinRange(0.1, 3, true),
      },
      scene
    );

    const xpos = randomIntegerWithinRange(10, 400, false);
    const zpos = randomIntegerWithinRange(10, 400, false);

    _moonRock.position.y = 15;
    _moonRock.position.x = xpos;
    _moonRock.position.z = zpos;
    _moonRock.physicsImpostor = new PhysicsImpostor(
      _moonRock,
      PhysicsImpostor.BoxImpostor,
      {
        mass: randomIntegerWithinRange(1, 6, true),
        friction: 0.3,
        restitution: 0,
      }
    );

    _moonRock.material = scene.materials.find(
      (element) => element.name == "defaultGridMaterial"
    );
  }
}

function createWaypointSphere(scene, destination) {
  const waypoint = new Mesh.CreateSphere("wpt", 10, 0.5, scene);
  waypoint.material = scene.materials.find(
    (element) => element.name == "waypointMaterial"
  );
  waypoint.position.x = destination[0];
  waypoint.position.z = destination[1];
  waypoint.position.y = 5;
}

function createSceneCamera(scene, canvas) {
  let camera = new FollowCamera("camera1", new Vector3(0, 10, 10), scene);
  camera.setTarget(new Vector3(10, 10, 10));
  camera.attachControl(canvas, true);
  camera.checkCollisions = true;
  camera.layerMask = 1;
  camera.lowerHeightOffsetLimit = 1;
  camera.upperHeightOffsetLimit = 15;

  scene.activeCamera = camera;
  scene.activeCameras.push(camera);
  camera.attachControl(canvas, true);
}

function bindSceneCamera(scene, canvas) {
  let camera = scene.activeCamera;

  let hit = (camera.heightOffset = 4);
  camera.rotationOffset = 180;
  camera.cameraAcceleration = 0.05;
  camera.maxCameraSpeed = 400;
  camera.attachControl(canvas, true);
  camera.lockedTarget = scene.meshes.find((element) => element.name == "rover");

  camera.ellipsoid = new Vector3(1, 1, 1);

  camera.lowerRadiusLimit = 2;
  camera.upperRadiusLimit = 25;
}

function createSceneLight(scene) {
  let light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
  light.intensity = 0.4;
}

function enableScenePhysics(scene) {
  scene.enablePhysics(null, new CannonJSPlugin(true, 10, CANNON));
  //lunar gravity
  scene.getPhysicsEngine().setGravity(new Vector3(0, -1.62, 0));
}

function buildBaseScene(scene, canvas) {
  enableScenePhysics(scene);
  createSceneLight(scene);
  createSceneCamera(scene, canvas);
  createSceneMaterials(scene);
  createGroundFromLunarMaps(scene);
  createFirmament(scene);
  createRover(scene);
}

export {
  buildBaseScene,
  bindSceneCamera,
  createMoonRocks,
  createWaypointSphere,
};
