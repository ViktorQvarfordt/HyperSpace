// This is a continuation of my old world.js and simul.js

function Fps() {
  this.frameCount = 0;
  this.prevCheck = Date.now();
  this.delay = 500;
  this.onUpdate = function() {};
}

Fps.prototype.step = function() {
  this.frameCount++;
  // Calculate FPS as a running average over this.delay.
  if ((Date.now() - this.prevCheck) > this.delay) {
    let currentFps = this.frameCount * 1000 / (Date.now() - this.prevCheck) || 0;
    this.prevCheck = Date.now();
    this.frameCount = 0;
    this.onUpdate(currentFps.toFixed(1));
  }
};

function CanvasState(id) {
  this.canvas = document.getElementById(id);
  this.context = this.canvas.getContext('2d');
  this.context.strokeStyle = 'black';
  this.fps = new Fps();
  this.resize();
  window.addEventListener('resize', this.resize.bind(this));
}

CanvasState.prototype.resize = function() {
  // Make canvas fit screen
  console.log("Resizing canvas dimensions,", window.innerWidth, "×", window.innerHeight,"px.");
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;

  // Normalize geometry by
  // 1) Centering canvas origin
  this.context.translate(this.canvas.width / 2, this.canvas.height / 2);
  // 2) Normalizing canvas length units
  let scaleFactor = this.canvas.height / 2;
  // let scaleFactor = this.canvas.width / 8;
  this.context.scale(scaleFactor, scaleFactor);
  this.context.lineWidth = 1 / scaleFactor; // Normalize line width accordingly
};

CanvasState.prototype.clear = function() {
  // this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.context.clearRect(-this.canvas.width*5, -this.canvas.height*5,  this.canvas.width*10, this.canvas.height*10);
  // this.context.clearRect(0-@transX, 0-@transY, @canvas.width, @canvas.height)
};

CanvasState.prototype.loop = function(callback) {
  let timePrev;
  let mainLoop = function() {
    window.requestAnimationFrame(mainLoop);
    let dt = (Date.now() - timePrev)/1000 || 0; // 0 in the case of timePrev being undefined.
    timePrev = Date.now();
    this.fps.step();
    // Clear the context so that we provide a fresh context to the callback.
    this.clear();
    callback(dt);
  }.bind(this);
  window.requestAnimationFrame(mainLoop);

  //// Old code that I'm not sure I have no need for.
  // this.canvasState.clear();
  // context.save();
  // origo at center of canvas
  // context.translate(canvas.width / 2, canvas.height / 2);
  // normalize length unit to height of canvas
  // let scaleFactor = canvas.height * scale;
  // context.scale(scaleFactor, scaleFactor);
  // but don't scale line thickness
  // context.restore();
  // window.requestAnimationFrame(loop);

};
