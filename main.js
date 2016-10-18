/* global linalg, ui, utils, CanvasState */

var cube3d = {
  // Each edge consits of two endpoints, being indices of vertices.
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
  ],
  // These are the actual spatial coordinates for each vertex.
  vertices: [
  [-1, -1, -1],
  [ 1, -1, -1],
  [ 1,  1, -1],
  [-1,  1, -1],
  [-1, -1,  1],
  [ 1, -1,  1],
  [ 1,  1,  1],
  [-1,  1,  1]
  ]
};


var world3d = {
  observer: {
    p: [0, 0, -3], // position [x, y, z]
    a: [0, 0, 0],  // angle relative axes [x, y, z]
    f: 1
  },
  drawCoordinateSystem: function(context) {
    var k = 10;
    var x0 = -k;
    var x1 = k;
    var y0 = -k;
    var y1 = k;
    var z0 = -k;
    var z1 = k;
    var step = 1;

    var x, y, z, line2d;

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
    for (var i = 0; i < cube3d.edges.length; i++) {
      // var p0 = linalg.projectPointFrom3dTo2d(vertices3[edges3[i][0]], camera);
      // var p1 = linalg.projectPointFrom3dTo2d(vertices3[edges3[i][1]], camera);
      // context.moveTo(p0[0], p0[1]);
      // context.lineTo(p1[0], p1[1]);

      // Do it for lines rather than points, to clip the line when it's on the wrong side of the projection plane.

      // var r = context.canvas.width / context.canvas.height / 2;
      var r = context.canvas.width / context.canvas.height / 2;
      var eyeOffset = 0.15;

      // Left eye
      var line2d = linalg.projectLineFrom3dTo2d([cube3d.vertices[cube3d.edges[i][0]], cube3d.vertices[cube3d.edges[i][1]]], this.observer, -eyeOffset);
      if (line2d) {
        context.moveTo(line2d[0][0] - r, line2d[0][1]);
        context.lineTo(line2d[1][0] - r, line2d[1][1]);
      }

      // Right eye
      var line2d = linalg.projectLineFrom3dTo2d([cube3d.vertices[cube3d.edges[i][0]], cube3d.vertices[cube3d.edges[i][1]]], this.observer, eyeOffset);
      if (line2d) {
        context.moveTo(line2d[0][0] + r, line2d[0][1]);
        context.lineTo(line2d[1][0] + r, line2d[1][1]);
      }

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
    // this.drawCoordinateSystem(context);
    this.drawCube(context);
    this.drawSeparator(context);
  }
};


var app = {
  canvasState: new CanvasState('canvas'),
  outputObserver: document.getElementById('observer'),
  outputFps: document.getElementById('fps'),
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
          if (key === 'p') {
            var valCopy = [];
            for (var i = 0; i < val.length; i++) {
              valCopy[i] = utils.roundToOneDecimal(val[i]);
            }
            return JSON.stringify(valCopy);
          } else if (key === 'a') {
            var valCopy = [];
            for (var i = 0; i < val.length; i++) {
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

    var xRotationMatrix = [
      [1, 0, 0],
      [0, Math.cos(-world3d.observer.a[0]), -Math.sin(-world3d.observer.a[0])],
      [0, Math.sin(-world3d.observer.a[0]), Math.cos(-world3d.observer.a[0])]
    ];
    var yRotationMatrix = [
      [Math.cos(-world3d.observer.a[1]), 0, Math.sin(-world3d.observer.a[1])],
      [0, 1, 0],
      [-Math.sin(-world3d.observer.a[1]), 0, Math.cos(-world3d.observer.a[1])],
    ];
    var zRotationMatrix = [
      [Math.cos(-world3d.observer.a[2]), -Math.sin(-world3d.observer.a[2]), 0],
      [Math.sin(-world3d.observer.a[2]), Math.cos(-world3d.observer.a[2]), 0],
      [0, 0, 1],
    ];
    var rotationMatrix = linalg.mul(linalg.mul(xRotationMatrix, yRotationMatrix), zRotationMatrix);

    var k = 0.25; // posiiton increment factor
    var t = 0.05; // angle increment factor

    if (ui.keys['right']) world3d.observer.x  += k;
    if (ui.keys['left'])  world3d.observer.x  -= k;
    if (ui.keys['up'])    world3d.observer.y  -= k;
    if (ui.keys['down'])  world3d.observer.y  += k;

    if (ui.keys['s']) {
      var r = [0, 1, 0];
      // var rTransformed = linalg.transposeVector(linalg.mul(rotationMatrix, linalg.transposeVector(r)));
      // world3d.observer.a = linalg.add(world3d.observer.a, linalg.sMul(rTransformed, t));
      world3d.observer.a = linalg.add(world3d.observer.a, linalg.sMul(r, t));
    }

    if (ui.keys['f']) {
      var r = [0, 1, 0];
      // var rTransformed = linalg.transposeVector(linalg.mul(rotationMatrix, linalg.transposeVector(r)));
      // world3d.observer.a = linalg.sub(world3d.observer.a, linalg.sMul(rTransformed, t));
      world3d.observer.a = linalg.sub(world3d.observer.a, linalg.sMul(r, t));
    }

    if (ui.keys['d']) {
      var r = [1, 0, 0];
      // var rTransformed = linalg.transposeVector(linalg.mul(rotationMatrix, linalg.transposeVector(r)));
      // world3d.observer.a = linalg.add(world3d.observer.a, linalg.sMul(rTransformed, t));
      world3d.observer.a = linalg.add(world3d.observer.a, linalg.sMul(r, t));
    }

    if (ui.keys['e']) {
      var r = [1, 0, 0];
      // var rTransformed = linalg.transposeVector(linalg.mul(rotationMatrix, linalg.transposeVector(r)));
      // world3d.observer.a = linalg.sub(world3d.observer.a, linalg.sMul(rTransformed, t));
      world3d.observer.a = linalg.sub(world3d.observer.a, linalg.sMul(r, t));
    }

    if (ui.keys['r']) {
      var r = [0, 0, 1];
      // var rTransformed = linalg.transposeVector(linalg.mul(rotationMatrix, linalg.transposeVector(r)));
      // world3d.observer.a = linalg.add(world3d.observer.a, linalg.sMul(rTransformed, t));
      world3d.observer.a = linalg.add(world3d.observer.a, linalg.sMul(r, t));
    }

    if (ui.keys['w']) {
      var r = [0, 0, 1];
      // var rTransformed = linalg.transposeVector(linalg.mul(rotationMatrix, linalg.transposeVector(r)));
      // world3d.observer.a = linalg.sub(world3d.observer.a, linalg.sMul(rTransformed, t));
      world3d.observer.a = linalg.sub(world3d.observer.a, linalg.sMul(r, t));
    }

    if (!ui.keys['ctrl']) {

      if (ui.keys['j']) {
        var zHat = [0, 0, 1];
        var zHatTransformed = linalg.transposeVector(linalg.mul(rotationMatrix, linalg.transposeVector(zHat)));
        world3d.observer.p = linalg.add(world3d.observer.p, linalg.sMul(zHatTransformed, k));
      }

      if (ui.keys['k']) {
        var yHat = [0, 0, 1];
        var yHatTransformed = linalg.transposeVector(linalg.mul(rotationMatrix, linalg.transposeVector(yHat)));
        world3d.observer.p = linalg.sub(world3d.observer.p, linalg.sMul(yHatTransformed, k));
      }

      if (ui.keys['l']) {
        var xHat = [1, 0, 0];
        var xHatTransformed = linalg.transposeVector(linalg.mul(rotationMatrix, linalg.transposeVector(xHat)));
        world3d.observer.p = linalg.add(world3d.observer.p, linalg.sMul(xHatTransformed, k));
      }

      if (ui.keys['h']) {
        var xHat = [1, 0, 0];
        var xHatTransformed = linalg.transposeVector(linalg.mul(rotationMatrix, linalg.transposeVector(xHat)));
        world3d.observer.p = linalg.sub(world3d.observer.p, linalg.sMul(xHatTransformed, k));
      }

      if (ui.keys[',']) {
        var yHat = [0, 1, 0];
        var yHatTransformed = linalg.transposeVector(linalg.mul(rotationMatrix, linalg.transposeVector(yHat)));
        world3d.observer.p = linalg.add(world3d.observer.p, linalg.sMul(yHatTransformed, k));
      }

      if (ui.keys['i']) {
        var yHat = [0, 1, 0];
        var yHatTransformed = linalg.transposeVector(linalg.mul(rotationMatrix, linalg.transposeVector(yHat)));
        world3d.observer.p = linalg.sub(world3d.observer.p, linalg.sMul(yHatTransformed, k));
      }

    }

    if (ui.keys['ctrl']) {
      if (ui.keys['j']) world3d.observer.f += k * world3d.observer.f;
      if (ui.keys['k']) world3d.observer.f -= k * world3d.observer.f;
    }

  },
  init: function() {
    ui.preventDefaultFor('right left up down f s e d w r j k ctrl+j ctrl+k');
    this.canvasState.fps.onUpdate = this.updateFps.bind(this);
    this.canvasState.loop(function() {
      this.reactToUserInput();
      this.updateMeta();
      world3d.render(this.canvasState.context);
    }.bind(this));
  }
};

app.init();
