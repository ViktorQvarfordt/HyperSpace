var linalg = (function() {

  var mul = function(a, b) {
    var result = [];
    var i;
    var j;
    var k;
    var sum;
    for (i = 0; i < a.length; i++) {
      result[i] = [];
      for (j = 0; j < b[0].length; j++) {
        sum = 0;
        for (k = 0; k < a[0].length; k++) {
          sum += a[i][k] * b[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  };

  var componentWiseOperation = function(a, b, op) {
    var result = [];
    var i;
    var j;
    if (typeof a[0] === 'number') {
      for (i = 0; i < a.length; i++) {
        result[i] = op(a[i], b[i]);
      }
    }
    else {
      for (i = 0; i < a.length; i++) {
        result[i] = [];
        for (j = 0; j < a[0].length; j++) {
          result[i][j] = op(a[i][j], b[i][j]);
        }
      }
    }
    return result;
  };

  var transposeVector = function(a) {
    var result = [];
    var i;
    // column to row
    if (typeof a[0] === 'number') {
      for (i = 0; i < a.length; i++) {
        result[i] = [a[i]];
      }
      return result;
    }
    // row to column
    else {
      for (i = 0; i < a.length; i++) {
        result[i] = a[i][0];
      }
      return result;
    }
  };

  var perspective = function(angle, aspectRatio, near, far) {
    var f = Math.tan(Math.PI * 0.5 - 0.5 * angle);
    var rangeInv = 1.0 / (near - far);

    return [
    [f / aspectRatio, 0, 0, 0],
    [0, f, 0, 0],
    [0, 0, (near + far) * rangeInv, -1],
    [0, 0, near * far * rangeInv * 2, 0]
    ];
  };

  var projectPointFrom3dTo2d = function(point, camera) {
    var xRotationMatrix = [
    [1, 0, 0],
    [0, Math.cos(camera.tx), -Math.sin(camera.tx)],
    [0, Math.sin(camera.tx), Math.cos(camera.tx)]
    ];
    var yRotationMatrix = [
    [Math.cos(camera.ty), 0, Math.sin(camera.ty)],
    [0, 1, 0],
    [-Math.sin(camera.ty), 0, Math.cos(camera.ty)],
    ];
    var zRotationMatrix = [
    [Math.cos(camera.tz), -Math.sin(camera.tz), 0],
    [Math.sin(camera.tz), Math.cos(camera.tz), 0],
    [0, 0, 1],
    ];
    var rotationMatrix = mul(mul(xRotationMatrix, yRotationMatrix), zRotationMatrix);

    // var translationMatrix = [
    //   [1, 0, 0, camera.x],
    //   [0, 1, 0, camera.y],
    //   [0, 0, 1, camera.z],
    //   [0, 0, 0, 1]
    // ];
    // point[3] = 1; // Homogenous coordinates.
    // var transformationMatrix = mul(rotationMatrix, translationMatrix);
    // point = mul(transformationMatrix, transposeVector(point));

    // translate point relative camera
    point = [point[0] - camera.x, point[1] - camera.y, point[2] - camera.z];

    // rotate
    point = transposeVector(mul(rotationMatrix, transposeVector(point)));

    // Project the 3-point onto the camera plane.
    /*
      Let $\vec{p}=\pmatrix{x \\ y \\ z}$ be any point in space. Our task is
      to project this point onto the two-dimensional plane that represents is
      the screen. Let the projection plane be $z=0$ and the focal point be
      $\pmatrix{0 \\ 0 \\ -f}$. The ray between the focal point and $\vec{p}$ is
      given by
      \[ \pmatrix{0\\0\\-f} + t\left(\pmatrix{x\\y\\z} - \pmatrix{0\\0\\-f}\right) \]
      This ray intersects the projection plane when the $z$-coordinate is 0,
      that is when $t=\frac{f}{z+f}$. Thus the projected point is given by
      \[ \tilde{p} = \frac{f}{z+f}\pmatrix{x\\y} \]
    */
    var t = camera.f / (point[2] + camera.f);
    return [t * point[0], t * point[1]];
  };

  return {
    perspective: perspective,
    projectPointFrom3dTo2d: projectPointFrom3dTo2d,
    mul: mul,
    transposeVector: transposeVector,
    componentWiseOperation: componentWiseOperation
  };

}());