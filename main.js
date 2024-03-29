/* global linalg, ui, utils, CanvasState */

let cube3d = {
  // Spatial coordinates for each vertex.
  vertices: [
    [-1, -1, -1],
    [ 1, -1, -1],
    [ 1,  1, -1],
    [-1,  1, -1],
    [-1, -1,  1],
    [ 1, -1,  1],
    [ 1,  1,  1],
    [-1,  1,  1]
  ],
  // Each edge consits of two endpoints, vertex indices.
  edges: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7]
  ]
};


let world3d = {
  observer: {
    p: [0, 0, -5], // position [x1, x2, x3]
    a: [0, 0, 0],  // angle relative to the axes [x1, x2, x3]
    f: 1,
    eyeOffset: 0.15
  },
  drawUnitVectors: function(context) {

    function drawArrow(x0, y0, x1, y1){
        var arrowHeadLength = 0.04;
        var angle = Math.atan2(y1 - y0, x1 - x0);
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.lineTo(x1 - arrowHeadLength * Math.cos(angle - Math.PI / 8), y1 - arrowHeadLength * Math.sin(angle - Math.PI / 8));
        context.moveTo(x1, y1);
        context.lineTo(x1 - arrowHeadLength * Math.cos(angle + Math.PI / 8), y1 - arrowHeadLength * Math.sin(angle + Math.PI / 8));
    }

    line2d = linalg.projectLineFrom3dTo2d([[0, 0, 0], [1, 0, 0]], this.observer);
    context.beginPath();
    drawArrow(line2d[0][0], line2d[0][1], line2d[1][0], line2d[1][1]);
    context.strokeStyle = "#f00";
    context.stroke();

    line2d = linalg.projectLineFrom3dTo2d([[0, 0, 0], [0, 1, 0]], this.observer);
    context.beginPath();
    drawArrow(line2d[0][0], line2d[0][1], line2d[1][0], line2d[1][1]);
    context.strokeStyle = "#0f0";
    context.stroke();

    line2d = linalg.projectLineFrom3dTo2d([[0, 0, 0], [0, 0, 1]], this.observer);
    context.beginPath();
    drawArrow(line2d[0][0], line2d[0][1], line2d[1][0], line2d[1][1]);
    context.strokeStyle = "#00f";
    context.stroke();

  },
  drawCoordinateSystem: function(context) {
    let k = 10;
    let x0 = -k;
    let x1 = k;
    let y0 = -k;
    let y1 = k;
    let z0 = -k;
    let z1 = k;
    let step = 1;

    let x, y, z, line2d;

    context.beginPath();

    // parallel to x-axis
    for (z = z0; z <= z1; z += step) {
      for (y = y0; y <= y1; y += step) {
        line2d = linalg.projectLineFrom3dTo2d([[x0, y, z], [x1, y, z]], this.observer);
        if (line2d) {
          context.moveTo(line2d[0][0], line2d[0][1]);
          context.lineTo(line2d[1][0], line2d[1][1]);
        }
      }
    }

    // parallel to y-axis
    for (z = z0; z <= z1; z += step) {
      for (x = x0; x <= x1; x += step) {
        line2d = linalg.projectLineFrom3dTo2d([[x, y0, z], [x, y1, z]], this.observer);
        if (line2d) {
          context.moveTo(line2d[0][0], line2d[0][1]);
          context.lineTo(line2d[1][0], line2d[1][1]);
        }
      }
    }

    // parallel to z-axis
    for (y = y0; y <= y1; y += step) {
      for (x = x0; x <= x1; x += step) {
        line2d = linalg.projectLineFrom3dTo2d([[x, y, z0], [x, y, z1]], this.observer);
        if (line2d) {
          context.moveTo(line2d[0][0], line2d[0][1]);
          context.lineTo(line2d[1][0], line2d[1][1]);
        }
      }
    }

    // Draw
    context.strokeStyle = "#efefef";
    context.stroke();
  },
  drawCube: function(context) {
    context.beginPath();
    // Draw each edge of 2d projection of 3d graph.
    for (let i = 0; i < cube3d.edges.length; i++) {
      // let p0 = linalg.projectPointFrom3dTo2d(vertices3[edges3[i][0]], camera);
      // let p1 = linalg.projectPointFrom3dTo2d(vertices3[edges3[i][1]], camera);
      // context.moveTo(p0[0], p0[1]);
      // context.lineTo(p1[0], p1[1]);

      // Do it for lines rather than points, to clip the line when it's on the wrong side of the projection plane.
      let r = context.canvas.width / context.canvas.height / 2;
      let eyeOffset = 0.15;
      let line2d;

      // Left eye
      this.observer.p[0] -= eyeOffset;
      line2d = linalg.projectLineFrom3dTo2d([cube3d.vertices[cube3d.edges[i][0]], cube3d.vertices[cube3d.edges[i][1]]], this.observer);
      if (line2d) {
        context.moveTo(line2d[0][0] - r, line2d[0][1]);
        context.lineTo(line2d[1][0] - r, line2d[1][1]);
      }

      // Right eye
      this.observer.p[0] += 2*eyeOffset;
      line2d = linalg.projectLineFrom3dTo2d([cube3d.vertices[cube3d.edges[i][0]], cube3d.vertices[cube3d.edges[i][1]]], this.observer);
      if (line2d) {
        context.moveTo(line2d[0][0] + r, line2d[0][1]);
        context.lineTo(line2d[1][0] + r, line2d[1][1]);
      }

      // Reset camera
      this.observer.p[0] -= eyeOffset;


    }
    context.strokeStyle = "#000";
    context.stroke();
  },
  drawSeparator: function(context) {
    context.beginPath();
    context.moveTo(0, -1);
    context.lineTo(0, 1);
    context.strokeStyle = "#000";
    context.stroke();
  },
  render: function(context) {
    let r = context.canvas.width / context.canvas.height / 2;
    let eyeOffset = 0.15;

    // this.drawCoordinateSystem(context);
    context.save();
    context.translate(r, 0);
    this.drawUnitVectors(context);
    context.translate(-2*r, 0);
    this.drawUnitVectors(context);
    context.restore();
    this.drawCube(context);
    this.drawSeparator(context);
  }
};


let app = {
  updateMeta: function() {
    this.outputObserver.textContent = JSON.stringify(
      world3d.observer,
      // Replacer function, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_native_JSON#The_replacer_parameter
      function(key, val) {
        if (key) {
          // if (typeof(val) === 'object') {
          //   return JSON.stringify(val);
          // }
          // return val;
          let valCopy = [];
          if (key === 'p') {
            for (let i = 0; i < val.length; i++) {
              valCopy[i] = utils.roundToOneDecimal(val[i]);
            }
            return JSON.stringify(valCopy);
          } else if (key === 'a') {
            for (let i = 0; i < val.length; i++) {
              valCopy[i] = utils.roundToOneDecimal(val[i] / Math.PI);
            }
            return JSON.stringify(valCopy) + 'π';
          } else if (key === 'f') {
            return utils.roundToOneDecimal(val);
          }
        } else {
          return val;
        }
      },
      2).replace(/"/g, '');
  },
  updateFps: function(fps) {
    this.outputFps.textContent = "fps: " + fps;
  },
  reactToUserInput: function() {

    let a = utils.clone(world3d.observer.a);
    a = linalg.sMul(a, -1);
    let rotationMatrix = linalg.getRotationMatrix(a);

    let pInc = 0.25; // position increment
    let aInc = 0.05; // angle increment

    if (ui.keys.right) world3d.observer.p  += pInc;
    if (ui.keys.left)  world3d.observer.p  -= pInc;
    if (ui.keys.up)    world3d.observer.y  -= pInc;
    if (ui.keys.down)  world3d.observer.y  += pInc;

    if (ui.keys.s) {
      let r = [0, 1, 0];
      // let rTransformed = linalg.mul(rotationMatrix, r);
      // world3d.observer.a = linalg.add(world3d.observer.a, linalg.sMul(rTransformed, aInc));
      world3d.observer.a = linalg.add(world3d.observer.a, linalg.sMul(r, aInc));
    }

    if (ui.keys.f) {
      let r = [0, 1, 0];
      // let rTransformed = linalg.mul(rotationMatrix, r);
      // world3d.observer.a = linalg.sub(world3d.observer.a, linalg.sMul(rTransformed, aInc));
      world3d.observer.a = linalg.sub(world3d.observer.a, linalg.sMul(r, aInc));
    }

    if (ui.keys.d) {
      let r = [1, 0, 0];
      // let rTransformed = linalg.mul(rotationMatrix, r);
      // world3d.observer.a = linalg.add(world3d.observer.a, linalg.sMul(rTransformed, aInc));
      world3d.observer.a = linalg.add(world3d.observer.a, linalg.sMul(r, aInc));
    }

    if (ui.keys.e) {
      let r = [1, 0, 0];
      // let rTransformed = linalg.mul(rotationMatrix, r);
      // world3d.observer.a = linalg.sub(world3d.observer.a, linalg.sMul(rTransformed, aInc));
      world3d.observer.a = linalg.sub(world3d.observer.a, linalg.sMul(r, aInc));
    }

    if (ui.keys.r) {
      let r = [0, 0, 1];
      // let rTransformed = linalg.mul(rotationMatrix, r);
      // world3d.observer.a = linalg.add(world3d.observer.a, linalg.sMul(rTransformed, aInc));
      world3d.observer.a = linalg.add(world3d.observer.a, linalg.sMul(r, aInc));
    }

    if (ui.keys.w) {
      let r = [0, 0, 1];
      r = linalg.mul(rotationMatrix, r);
      world3d.observer.a = linalg.sub(world3d.observer.a, linalg.sMul(r, aInc));
    }

    if (!ui.keys.ctrl) {

      if (ui.keys.j) {
        let r = [0, 0, 1];
        r = linalg.mul(rotationMatrix, r);
        world3d.observer.p = linalg.add(world3d.observer.p, linalg.sMul(r, pInc));
      }

      if (ui.keys.k) {
        let r = [0, 0, 1];
        r = linalg.mul(rotationMatrix, r);
        world3d.observer.p = linalg.sub(world3d.observer.p, linalg.sMul(r, pInc));
      }

      if (ui.keys.l) {
        let xHat = [1, 0, 0];
        let xHatTransformed = linalg.mul(rotationMatrix, xHat);
        world3d.observer.p = linalg.add(world3d.observer.p, linalg.sMul(xHatTransformed, pInc));
      }

      if (ui.keys.h) {
        let xHat = [1, 0, 0];
        let xHatTransformed = linalg.mul(rotationMatrix, xHat);
        world3d.observer.p = linalg.sub(world3d.observer.p, linalg.sMul(xHatTransformed, pInc));
      }

      if (ui.keys[',']) {
        let yHat = [0, 1, 0];
        let yHatTransformed = linalg.mul(rotationMatrix, yHat);
        world3d.observer.p = linalg.add(world3d.observer.p, linalg.sMul(yHatTransformed, pInc));
      }

      if (ui.keys.i) {
        let yHat = [0, 1, 0];
        let yHatTransformed = linalg.mul(rotationMatrix, yHat);
        world3d.observer.p = linalg.sub(world3d.observer.p, linalg.sMul(yHatTransformed, pInc));
      }

    }

    if (ui.keys.ctrl) {
      if (ui.keys.j) world3d.observer.f += pInc * world3d.observer.f;
      if (ui.keys.k) world3d.observer.f -= pInc * world3d.observer.f;
    }

  },
  init: function() {
    this.outputObserver = document.getElementById('observer');
    this.outputFps = document.getElementById('fps');

    this.cs = new CanvasState('canvas');
    ui.preventDefaultFor('right left up down f s e d w r j k ctrl+j ctrl+k');
    this.cs.fps.onUpdate = this.updateFps.bind(this);
    this.cs.loop(function() {
      this.reactToUserInput();
      this.updateMeta();
      world3d.render(this.cs.context);
    }.bind(this));
  }
};

app.init();

count = 0;
