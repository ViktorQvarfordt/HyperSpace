/*jslint browser:true */

var m = ThreeDMath;
window.onload = main;

function main() {
  var cubeVertices = [
    -1, -1, -1,
     1, -1, -1,
     1,  1, -1,
    -1,  1, -1,
    -1, -1,  1,
     1, -1,  1,
     1,  1,  1,
    -1,  1,  1,
  ];
  var indices = [
    0, 1,
    1, 2,
    2, 3,
    3, 0,
    4, 5,
    5, 6,
    6, 7,
    7, 4,
    0, 4,
    1, 5,
    2, 6,
    3, 7,
  ];

  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var clock = 0;
  var then = Date.now() * 0.001;

  function render() {
    var now = Date.now() * 0.001;
    clock += now - then;
    then = now;

    var scale = 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(canvas.width / scale, canvas.height / scale);
    ctx.lineWidth = scale / canvas.width;
    ctx.strokeStyle = "black";

    var fieldOfView = Math.PI * 0.25;
    var aspect = canvas.width / canvas.height;
    var projection = m.perspective(fieldOfView, aspect, 1, 500);
    var radius = 5;
    var eye = [
        Math.sin(clock) * radius,
        1,
        Math.cos(clock) * radius];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    var view = m.lookAt(eye, target, up);

    var worldViewProjection = m.multiplyMatrix(view, projection);

    drawLines(cubeVertices, indices, worldViewProjection);
    ctx.restore();
    requestAnimationFrame(render);
  }
  render();

  function drawLines(cubeVertices, indices, worldViewProjection) {
    ctx.beginPath();
    // transform points
    var points = [];
    for (var ii = 0; ii < cubeVertices.length; ii += 3) {
      points.push(m.transformPoint(
        worldViewProjection,
        [cubeVertices[ii + 0], cubeVertices[ii + 1], cubeVertices[ii + 2]]));
    }
    for (var ii = 0; ii < indices.length; ii += 2) {
      var p0 = points[indices[ii + 0]];
      var p1 = points[indices[ii + 1]];
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
    }
    ctx.stroke();
  }
}
