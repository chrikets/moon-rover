import { StackPanel } from "@babylonjs/gui/2D/controls/stackPanel";
import { AdvancedDynamicTexture, InputText } from "@babylonjs/gui/2D";
import { Control, TextBlock } from "@babylonjs/gui/2D/controls";
import { Button } from "@babylonjs/gui";
import { parseCli } from "./cli";

function generateGui(scene) {
  let ui = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

  let topPanel = new StackPanel();
  topPanel.name = "topPanel";
  topPanel.height = "250px";
  topPanel.width = "900px";
  topPanel.paddingBottom = "20px";
  topPanel.isVertical = true;
  topPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  topPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  topPanel.layerMask = 0;

  ui.addControl(topPanel);

  let cliFeed = new TextBlock();
  cliFeed.name = "cliFeed";
  cliFeed.height = "70px";
  cliFeed.width = "900px";
  cliFeed.backgroundColor = "white";
  cliFeed.background = "white";
  cliFeed.textColor = "white";
  cliFeed.color = "white";
  cliFeed.text = "white";
  cliFeed.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  cliFeed.textsize = 8;
  cliFeed.paddingLeft = 1;

  topPanel.addControl(cliFeed);

  cliFeed.text = ">";

  let input = new InputText();
  input.name = "input";
  input.paddingLeft = 2;
  input.width = "450px";
  input.maxWidth = "455px";
  input.height = "25px";
  input.text = "";
  input.textsize = 10;
  input.color = "white";
  input.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  input.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  input.background = "green";
  input.layerMask = 1;
  ui.addControl(input);

  let btnSubmitConsole = Button.CreateSimpleButton("submitCmdBtn", "Run");
  btnSubmitConsole.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  btnSubmitConsole.width = "40px";
  btnSubmitConsole.height = "40px";
  btnSubmitConsole.color = "white";
  btnSubmitConsole.background = "green";
  btnSubmitConsole.paddingLeft = 2;
  topPanel.addControl(btnSubmitConsole);

  btnSubmitConsole.onPointerDownObservable.add(function () {
    cliFeed.textColor = "white";
    const textout = parseCli(input.text, scene);
    console.log(textout);
    cliFeed.text = textout;
    input.text = "";
  });

  let bottomPanel = new StackPanel();
  bottomPanel.name = "bottomPanel";
  bottomPanel.height = "100px";
  bottomPanel.paddingBottom = "20px";
  bottomPanel.isVertical = true;
  bottomPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  bottomPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
  bottomPanel.fontSize = 16;
  ui.addControl(bottomPanel);

  let footerDesc = new TextBlock("footerDesc");
  let footerX = new TextBlock("footerX");
  let footerY = new TextBlock("footerY");
  let footerZ = new TextBlock("footerZ");
  footerDesc.height = "20px";
  footerDesc.color = "white";
  footerDesc.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  footerX.color = "white";
  footerX.height = "20px";
  footerX.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  footerY.color = "white";
  footerY.height = "20px";
  footerY.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  footerZ.color = "white";
  footerZ.height = "20px";
  footerZ.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;

  bottomPanel.addControl(footerDesc);
  bottomPanel.addControl(footerX);
  bottomPanel.addControl(footerY);
  bottomPanel.addControl(footerZ);
}

function updateGui(scene, roverPositionDict) {
  const _uiElements = scene.textures
    .find((element) => element.name == "UI")
    ._rootContainer._children.find((element) => element.name == "bottomPanel")
    ._children;

  Object.keys(roverPositionDict).forEach(
    (key) =>
      (_uiElements.find(
        (element) => element.name == `footer${key}`
      ).text = `${key}: ${Number.parseFloat(roverPositionDict[key]).toPrecision(
        2
      )}`)
  );
}

export { generateGui, updateGui };
