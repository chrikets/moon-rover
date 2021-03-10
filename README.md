# moon-rover

A web-based lunar rover simulation using [Babylon.js](https://www.babylonjs.com/), [Cannon.js](https://github.com/schteppe/cannon.js), node.js, and webpack.

This markdown edited in [stackedit.io](stackedit.io).

## Installing and Running

You will need to have npm (via node.js) [installed](https://www.npmjs.com/get-npm) to grab required packages and to run locally.

Once npm is installed, clone this repo, navigate to the local repo and type `npm install` to get all specified dependencies.

Assuming your install was a success, you can now run `npx webpack-cli serve` to spin up the webpack dev server on port 8080. Webpack first needs to compile the JS, but when it's ready, navigate to `localhost:8080` in a browser to view the sim. If you'd like to run the sim on a different port, run `npx webpack-cli serve --port yourportnumber`

Note: the webpack dev server will attempt to recompile if you change the codebase as it runs. This project is only configured for development, not production ready deployment, whatever that might mean for you.

Final note: webpack is going to complain (if you have a dev console open in your browser) about the size of the entrypoint file; there's _some_ additional optimization that can be done here, but the compiled result of the Babylon.js and Cannon.js libraries I used (after limiting imports and tree-shaking) will be well over webpack's reccomended entrypoint limits so long as there are collisions to simulate and meshes to extrude. Oh well. It still performs pretty well at baseline.

It would probably make sense to put this in a Docker container, which I'll get around to eventually.

## The Simulation

I wrote this simulation over the course of a few days for my tech interview at [Astrobotic](https://www.astrobotic.com/). I hadn't used Babylon.js or Cannon.js before, but I wanted something light-weight that would do well on integrated graphics and more readily deployable than a Unity or Unreal Project.

The simulation is _rough_; it is not intended to be anything other than a tech demo.

Having said that, attempts were made to provide a reasonable degree of realism.

**The Lunar Environment**

The mesh and texture for the lunar surface are constructed from a Lunar Reconnaissance Orbiter (LRO) [height and color maps](https://svs.gsfc.nasa.gov/4720). Note, these are _not_ PDS elevation models, which are far too detailed to put into a web-rendered simulation as they are, and I didn't have the time to do any of the necessary image/data editing to support higher quality data. Instead, I used comparatively low quality CGI alternatives that I scaled _without respect to their intended proportion(s)_. This approach gives a decent approximation of the lunar surface in terms of atmosphere, pun intended.

**The Rover**
The rover model is based on an eyeballing of Astrobotic's [cube rover](https://www.astrobotic.com/planetary-mobility), but the proportions (and mass) were altered to make it more compatible with the simulated terrain. Otherwise, the rover is a suspension-less, fixed axle, 4WD drive model. Only-at-rest point-turns are explicitly supported by design. I included the ability to adjust torque to all wheels when driving forward or in reverse, but NOT when point turning. It is not logically prohibited, but _not recommended_ to attempt an in-motion skid steer.

**Physics**
Cannon.js supports MKS units, but because I have optimized rendering over physical realism, it only really makes sense to talk about mass/force/distance as general _units_. The only explicitly defined unit that would still make general sense in this simulation is acceleration due to gravity, 1.62 m/s\*s, and possibly surface friction - one (1) "unit". Lumpy gravity models not supported, but don't you dare think I didn't consider it.

**Wheel Slippage**
By happy accident, the current surface-mesh - because of my choices in the mesh subdivision scalar and general map scaling - detects collisions with the rover wheels which (to the user) _appear_ to occur very slightly beneath the regolith as the wheels are "sunk in". This is not only visually realistic, but the mesh's pitting behavior - visually obscured by the applied lunar texture - offers some degree of simulated wheel slippage! This could be readily tracked but is not currently noted in any way. After driving the rover for a short time, the grid texture on the wheels will show positional variance illustrating this phenomenon.

**The Firmament**
The firmament surrounding the map is a simple rendered sphere. Initially I used a rectangular skybox but it just didn't look right. After some experimentation, the intersection of the firmament sphere and terrain gave the illusion of horizon and curvature. No colliders exist on the firmament so should you somehow find yourself outside of it, you will see proof that the moon is flat.

Also, no stars are visible in the moon's sky. Why? Well I'm not sure if any stars _are_ actually visible on the lunar surface to an observer because of albedo and incident light pollution. Regardless, this simulation is supposed to offer a view based on data returned from instrumentation which would probably not be running long-exposure images on a regular basis.

**Moon Rocks!**
You can generate moon rocks! See the CLI section below for more information. You should probably only generate a hundred at most if you're worried about performance. I've designed the rock spawner to generate these meshes some distance away from the map's origin. The rocks are all an entirely random combination of size, polygonal type, and mass with _zero_ correlation between those parameters. They'll spawn far above the surface to avoid champagne-cork collisions with the lunar mesh which are fun, but quite silly.

**Rover Commands**
Rover commands are given via keyboard input. Basic telemetry classes are available as JS objects and are translated into JSON strings that print to browser dev consoles, but no space-worthy data standard is applied. It certainly could be, however, if you want to put in the work bit-shifting and checksum-ing.

## Known Issues and Considerations

**Rover Spawning**
Spawning the main rover mesh is, evidently, somewhat of a stochastic process. You'll see this if you refresh the page a few times. The rover is dropped into the scene to emulate the start-of-surface-operations lifecycle at the map's origin _(x, z) = (0, 0)._

The starting _y_ coordinate is based on the height of the map and was experimentally determined and hard-coded. These starting coordinates _should_ yield a right-side-up rover drop most of the time. Plan on having a bad time spawning a rover in if you alter the heightmap extrema in `scene_objects.js`.

On that note, within `scene_objects.js`: `environmentScaleVals` was created to serve as a configuration data structure of sorts but I never got around to wiring it up i.e. changing values within it won't do anything.

You may need to click on the simulation screen to ready the JS event listeners and allow movement.

**Restarting the Simulation**
To restart the simulation, reload the page. I'm sure you will need to at some point.

**Mouse Inputs**
I've had instances where mouse input while driving can cause the rover to move. This shouldn't happen, but it does occasionally. I believe this is because of the UI textures I incorporated on top of the simulation and the `mouseDown` event listener I attached to the CLI _Run_ button. Chalk that up to inexperience with Babylon.js and its layer hierarchy.

**The CLI**
You will see the CLI interface I designed with Babylon.js components in the upper right. The UI components aren't great, especially compared to the rest of the engine's functionality. I probably should've designed my own overlay using some other nice-looking npm package, but I had already hard committed to leveraging these components.

You may need to click multiple times on the green textbox to get a blinking cursor. Sometimes - I don't know why - no matter what you do you can't get a cursor and you may need to restart if you want the CLI to be usable.

After a command is entered into the textbox, you will need to _click_ the _Run_ button; mapping that button to _RETURN_ caused some other issues in the overlay and it wasn't worth it to try to figure them out at the time.

**Rover "Jerks" When I Stop Pressing Keys**
The code for halting force to the rover's motors is quite dumb (by design); when a key ceases being pressed, all force to all motors immediately is reset to zero, effectively locking the axle(s). The visual behavior of the rover mesh after the fact is surely due to the impulse effect of this zeroing and subsequent collision detection with the surface. There are absolutely better ways to handle force reductions, but that would also involve fine tuning the regolith and probably applying some FEA solutions of some sort (if physical realism is a goal).

**Scaling The Window**
Chalk this up, again, to my unfamiliarity with Babylon.js (and WebGL2 rendering) but opening and closing a dev console - for instance - will warp the extant simulation render if you have it running. I am aware, just didn't have time to look into it. I'm sure similar warping occurs on certain moves and resizes. So...don't do that, ok?

**Light Sources**

Rendered light is a simple hemispheric source. Absolutely no consideration was given to physical realism for light sources.

**Is This Hosted Online Anywhere?**
No, but I'll get around to it. Either here on .io or somewhere else.

## KB and Mouse Controls

**Camera Control**
Use the mouse to move the camera, which is locked on the rover's position and restrained in an elipsoid path in the Y +/- directions (Babylon.js uses a left handed coordinate system).

**Basic Movement**
_W, A, S, D_ for movement.

_W_: Move the rover forward
_S_: Move the rover backward
_A_: Skid-steer the rover left
_D_: Skid-steer the rover right

Forward and backward movement inputs apply a force of equal magnitude to each wheel about their axle either in the direction of the front of the rover or towards its rear, respectively. The base value of torque - five (5) "units" - can be altered by a CLI command _only for forward and reverse driving_.

The skid-steering maneuver(s) simultaneously apply force about axles in the direction of the front of the rover for wheels _on the opposite side of the desired turning direction_ while also applying force toward the rear of the rover about the axles of the wheels _on the side of the desired turning direction_.

The value of force/torques applied to wheels for point-turns is one (1) "unit" and cannot be altered via the CLI. Values greater than this base force for turns tend to flip the rover with some regularity.

The mesh of the rover wheels, for any maneuver, contacts the ground and via the force of friction - set at one (1) "unit" - is able to drag the aggregated rover meshes over lunar terrain.

## The CLI

Commands input in the CLI are dot-delimited, eg:

> ROVER.TORQUE.10

will change the scalar value of the force applied on all wheels to ten (10) "units" for forward and reverse rover movement movement.

The CLI should reject unknown, incomplete, or otherwise improperly formatted commands. The CLI is not case-sensitive, and should offer a confirmation message if it successfully carried out a command. There is no built in help function, so please use this guide instead. Many of the commands have not yet been implemented. Some commands offer verbose output in browser dev consoles.

**Top Level Commands**

- CLEAR
- CONFIRM
- ROVER
- SIMULATION

_CLEAR_: Notionally supported. Returns an ACK on the CLI Feed, but intended to purge emulated memory, command stack, or CLI in production.
_CONFIRM_: Notionally supported. Returns an ACK on the CLI Feed, but intended to force user to confirm a command designated outright as _DANGEROUS_ or _HAZARDOUS_, or otherwise classified as such based on operations outside of nominal parameters specified in equipment, instrumentation, mission, or risk standards
_ROVER_: Supported. Offers access to the sub-tree of commands specific to the rover object or its environment
_SIMULATION_: Supported. Offers access to the sub-trees of commands specific to the simulation itself

**CLEAR Command Subtree**
NOT IMPLEMENTED

**CONFIRM Command Subtree**
NOT IMPLEMENTED

**ROVER Command Subtree**

- _DANGEROUS_COMMAND_: Notionally implemented. Returns an ACK on CLI Feed. Intended to simulate a rover's response to a dangerous command from ground that can be executed only after operator override using the (unimplemented) CONFIRM trees.
- _DRIVE_: Not implemented, but intended to ingest a command packet to move the rover in some direction based on a parsed command stack using applied force or target distance, RPM, etc
- _HOLD_: Not implemented, but intended to have the rover hold its position wait for further commands from ground. This order would take precedence over an active command stack in a queue.
- _IMAGING_: Not implemented, but intended to provide surface imaging services to ground.
- _MARKLOC_: Supported. Allows the rover to mark locations of interest on the surface. Stores the coordinates in simulated rover memory.
  - _HERE_: Supported. Gets the current position of the rover mesh in the world matrix and stores the coordinates. Usage e.g.: `ROVER.MARKLOC.HERE`
  - _X.Z:_ Supported. Marks the specified (x, z) coordinate in locations of interest. Usage e.g.: `ROVER.MARKLOC.0.0`
- _PAYLOAD_: Supported. Fudges basic telemetry from a spectrometer hosted on the rover. Prints JSON to the browser dev console. Usage e.g. `ROVER.PAYLOAD`
- _REPORT_: Not implemented, but intended to send a standard status report to ground with mission-specified telemetry included.
- _ROTATE_: Not implemented, but intended to extend point-turn maneuvers via the CLI on the basis of an IMU or other (angular) localaization method
- _SAFE_: Notionally implemented, returns an ACK on the CLI feed. In production with full implementation, would force the rover into a pre-specified posture for low-level debugging
- _TORQUE_: Supported. Changes the magnitude of force applied about the axis of rotation for all wheels during subsequent button presses, but only in the forward and reverse directions. Usage e.g.: `ROVER.TORQUE.10`
- _WAYPOINT_: Supported. Generated a glowing mesh sphere above the lunar surface as a waypoint for the rover to proceed toward. In a mission situation, waypoints could be applied to objects viewed in images sent to ground. Subsequent images and feature detection from ground post-processing could allow a driver to orient themselves via dead-reckoning - or relative positional computation - to arbitrary points of interest. Usage e.g.`ROVER.WAYPOINT.0.0`

**SIMULATION Command Subtree**

- _GENERATE_ROCKS_: Supported. Generates moon rocks above the surface which will cascade towards the lunar terrain to settle. Number of rocks is a required parameter. Simulation remains performant with not more than one-hundred-fifty (150) rocks on integrated graphics. No control is offered over rock size, shape, mass, or density. Usage e.g. `SIMULATION.GENERATE_ROCKS.100`

## Do A Barrel Roll

In the CLI:

> ROVER.TORQUE.500

Click _Run_
Press _W_
See what they didn't want you to see
The truth is out there
It's really not that interesting

Dedicated to Cedric

## Other Credits, Minutiae

The [Babylon.js fourms](https://forum.babylonjs.com/) were a helpful resource when I was learning the ropes. Unfortunately their sandboxes aren't structured - at all - around node.js implementations, so quite alot of this was just trial and error (which was really fun). There are some super talented/creative developers on that board and alot of very active source-code contributors who enjoy diving into and discussing the guts of the libraries.

There was one post in particular that I can't find to credit directly, but I was having a very frustrating issue with my ground mesh collisions early on. One post in particular had a little kernel of wisdom that led to my understanding of what was going on with my height mapping attempts and their failures. To that person who helped me solve that riddle, thank you! I will credit you explicitly if I stumble upon that thread again.

I have to say, having long been a Unity and Unreal user, I am _very_ impressed with what Babylon.js offers for WebGL2. It's alot of fun to use, and it's quite intuitive if you understands the basics of the DOM, and it's really clean.

Finally, thanks to [schteppe](https://schteppe.github.io/cannon.js/) for Cannon.js. Guy is a rockstar and Babylon has a killer plug-in that makes it easy to use.
