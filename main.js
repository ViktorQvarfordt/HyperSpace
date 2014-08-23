/*global linalg: true, ui: true, utils: true */

var vertices3 = [
  [-1, -1, -1], // 0
  [ 1, -1, -1], // 1
  [ 1,  1, -1], // 2
  [-1,  1, -1], // 3
  [-1, -1,  1], // 4
  [ 1, -1,  1], // 5
  [ 1,  1,  1], // 6
  [-1,  1,  1]  // 7
];

var edges3 = [
  [0, 1], // 0
  [1, 2], // 1
  [2, 3], // 2
  [3, 0], // 3
  [4, 5], // 4
  [5, 6], // 5
  [6, 7], // 6
  [7, 4], // 7
  [0, 4], // 8
  [1, 5], // 9
  [2, 6], // 10
  [3, 7]  // 11
];

var vertices2 = [
  [-1, -1], // 0
  [ 1, -1], // 1
  [ 1,  1], // 2
  [-1,  1]  // 3
];

var edges2 = [
  [0, 1], // 0
  [1, 2], // 1
  [2, 3], // 2
  [3, 0]  // 3
];

// General canvas and context setup.
var cnv = document.getElementById('canvas');
var ctx = cnv.getContext('2d');
ctx.clear = function() {
  ctx.clearRect(0, 0, cnv.width, cnv.height);
};
ctx.strokeStyle = 'black';

// Misc. setup
var metadataOutput = document.getElementById('metadata');

// Deal with time and refresh rate.
var timePrevious = Date.now() / 1000;
var timeNow = timePrevious;
var dt = 0;
var fps = 0;

// Geometry
var scale = 2;
var aspectRatio = cnv.width / cnv.height;
var fieldOfView = Math.PI * 0.25;

function metaCalc() {
  timePrevious = timeNow;
  timeNow = Date.now() / 1000;
  dt = timeNow - timePrevious;
  fps = 1 / dt;
  // console.log('dt = ', dt);
  // console.log('fps = ', fps);
}

var camera = {
  x: 0,
  y: 0,
  z: -3,
  tx: 0,
  ty: 0,
  tz: 0,
  f: 1
};

function onLoop() {
  var k = 0.25;
  var t = 0.05;

  if (ui.keys['right']) camera.x  += k;
  if (ui.keys['left'])  camera.x  -= k;
  if (ui.keys['up'])    camera.y  -= k;
  if (ui.keys['down'])  camera.y  += k;

  if (ui.keys['f'])     camera.ty -= t;
  if (ui.keys['s'])     camera.ty += t;
  if (ui.keys['e'])     camera.tx -= t;
  if (ui.keys['d'])     camera.tx += t;
  if (ui.keys['w'])     camera.tz -= t;
  if (ui.keys['r'])     camera.tz += t;

  if (!ui.keys['ctrl']) {
    if (ui.keys['j'])     camera.z  += k;
    if (ui.keys['k'])     camera.z  -= k;
  }

  if (ui.keys['ctrl']) {
    if (ui.keys['j']) camera.f += k/10;
    if (ui.keys['k']) camera.f -= k/10;
  }

  metadataOutput.textContent = JSON.stringify(
    camera,
    // Replacer function, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_native_JSON#The_replacer_parameter
    function(key, val) {
      return key ? utils.roundToOneDecimal(val) : val;
    },
    2);
  metadataOutput.textContent += ',\nfps: ' + Math.round(fps);
}

document.addEventListener('mousewheel', function(event) {
  camera.f += event.wheelDelta/1000;
});

function loop() {
  metaCalc();

  onLoop(dt, timeNow);

  ctx.clear();
  ctx.save();
  ctx.translate(cnv.width / 2, cnv.height / 2);
  ctx.scale(cnv.width / scale, cnv.height / scale);
  ctx.lineWidth = scale / cnv.width;
  render();
  ctx.restore();

  window.requestAnimationFrame(loop);
}

function render() {
  ctx.beginPath();

  // ctx.moveTo(0.5*(-1+Math.cos(timeNow*3)), 0.5*(-1+Math.sin(timeNow*3)));
  // ctx.lineTo(0.5*(1+Math.cos(timeNow*2)), 0.5*(1+Math.sin(timeNow*2)));
  // ctx.lineTo(200 + 100*Math.cos(timeNow*5), 100 + 20*Math.sin(timeNow*6));
  // ctx.moveTo(50 + 50*Math.cos(timeNow*3), 50 + 50*Math.sin(timeNow*10));
  // ctx.lineTo(100, 200);

  // Draw each edge in 2d graph.
  // for (var i = 0; i < edges2.length; i++) {
  //   var p0 = vertices2[edges2[i][0]];
  //   var p1 = vertices2[edges2[i][1]];
  //   ctx.moveTo(p0[0], p0[1]);
  //   ctx.lineTo(p1[0], p1[1]);
  // }

  // Draw each edge of simple 2d projection of 3d graph.
  for (var i = 0; i < edges3.length; i++) {
    var p0 = linalg.projectPointFrom3dTo2d(vertices3[edges3[i][0]]);
    var p1 = linalg.projectPointFrom3dTo2d(vertices3[edges3[i][1]]);
    ctx.moveTo(p0[0], p0[1]);
    ctx.lineTo(p1[0], p1[1]);
  }

  ctx.stroke();
}


loop();
ui.preventDefaultFor('right left up down f s e d w r j k ctrl+j ctrl+k');
