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
    x: 0,
    y: 0,
    z: -3,
    tx: 0,
    ty: 0,
    tz: 0,
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

    // var observer = {
    //   x: world3d.observer.x,
    //   y: world3d.observer.y,
    //   z: world3d.observer.z,
    //   tx: 0,
    //   ty: 0,
    //   tz: 0,
    //   f: world3d.observer.f
    // };
    var observer = world3d.observer;

    context.beginPath();

    // parallel to x-axis
    for (z = z0; z <= z1; z += step) {
      for (y = y0; y <= y1; y += step) {
        line2d = linalg.projectLineFrom3dTo2d([[x0, y, z], [x1, y, z]], observer);
        if (line2d) {
          context.moveTo(line2d[0][0], line2d[0][1]);
          context.lineTo(line2d[1][0], line2d[1][1]);
        }
      }
    }

    // parallel to y-axis
    for (z = z0; z <= z1; z += step) {
      for (x = x0; x <= x1; x += step) {
        line2d = linalg.projectLineFrom3dTo2d([[x, y0, z], [x, y1, z]], observer);
        if (line2d) {
          context.moveTo(line2d[0][0], line2d[0][1]);
          context.lineTo(line2d[1][0], line2d[1][1]);
        }
      }
    }

    // parallel to z-axis
    for (y = y0; y <= y1; y += step) {
      for (x = x0; x <= x1; x += step) {
        line2d = linalg.projectLineFrom3dTo2d([[x, y, z0], [x, y, z1]], observer);
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
      var line2d = linalg.projectLineFrom3dTo2d([cube3d.vertices[cube3d.edges[i][0]], cube3d.vertices[cube3d.edges[i][1]]], world3d.observer);
      if (line2d) {
        context.moveTo(line2d[0][0], line2d[0][1]);
        context.lineTo(line2d[1][0], line2d[1][1]);
      }
    }
    context.strokeStyle = "#000";
    context.stroke();
  },
  render: function(context) {
    this.drawCoordinateSystem(context);
    this.drawCube(context);
  }
};


var app = {
  canvasState: new CanvasState(),
  outputObserver: document.getElementById('observer'),
  outputFps: document.getElementById('fps'),
  updateMeta: function() {
    this.outputObserver.textContent = JSON.stringify(
      world3d.observer,
      // Replacer function, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_native_JSON#The_replacer_parameter
      function(key, val) {
        if (key) {
          if (key.substr(0,1) === 't') {
            return utils.roundToOneDecimal(val/Math.PI) + 'π';
          } else {
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
    var k = 0.25;
    var t = 0.05;

    if (ui.keys['right']) world3d.observer.x  += k;
    if (ui.keys['left'])  world3d.observer.x  -= k;
    if (ui.keys['up'])    world3d.observer.y  -= k;
    if (ui.keys['down'])  world3d.observer.y  += k;

    if (ui.keys['f'])     world3d.observer.ty -= t;
    if (ui.keys['s'])     world3d.observer.ty += t;
    if (ui.keys['e'])     world3d.observer.tx -= t;
    if (ui.keys['d'])     world3d.observer.tx += t;
    if (ui.keys['w'])     world3d.observer.tz -= t;
    if (ui.keys['r'])     world3d.observer.tz += t;

    if (!ui.keys['ctrl']) {
      var xRotationMatrix = [
        [1, 0, 0],
        [0, Math.cos(-world3d.observer.tx), -Math.sin(-world3d.observer.tx)],
        [0, Math.sin(-world3d.observer.tx), Math.cos(-world3d.observer.tx)]
      ];
      var yRotationMatrix = [
        [Math.cos(-world3d.observer.ty), 0, Math.sin(-world3d.observer.ty)],
        [0, 1, 0],
        [-Math.sin(-world3d.observer.ty), 0, Math.cos(-world3d.observer.ty)],
      ];
      var zRotationMatrix = [
        [Math.cos(-world3d.observer.tz), -Math.sin(-world3d.observer.tz), 0],
        [Math.sin(-world3d.observer.tz), Math.cos(-world3d.observer.tz), 0],
        [0, 0, 1],
      ];

      var rotationMatrix = linalg.mul(linalg.mul(xRotationMatrix, yRotationMatrix), zRotationMatrix);
      var increment = linalg.mul(rotationMatrix, [[0], [0], [1]]);

      if (ui.keys['j']) {
        // world3d.observer.x += increment[0] * k;
        // world3d.observer.y += increment[1] * k;
        // world3d.observer.z += increment[2] * k;
        world3d.observer.z += k;
      }

      if (ui.keys['k']) {
        // world3d.observer.x -= increment[0] * k;
        // world3d.observer.y -= increment[1] * k;
        // world3d.observer.z -= increment[2] * k;
        world3d.observer.z -= k;
      }

      if (ui.keys['h']) {
        world3d.observer.x -= k;
      }
      if (ui.keys['l']) {
        world3d.observer.x += k;
      }

      if (ui.keys['i']) {
        world3d.observer.y -= k;
      }
      if (ui.keys[',']) {
        world3d.observer.y += k;
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
