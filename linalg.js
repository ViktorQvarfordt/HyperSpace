var linalg = (function() {

  // Matrix multiplication
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

  // Scalar multiplication
  var sMul = function(A, k) {
    var result = [];
    // Vector
    if (typeof(A[0]) === 'number') {
      for (var i = 0; i < A.length; i++) {
        result[i] = A[i] * k;
      }
    }
    // Matrix
    else {
      for (var i = 0; i < A.length; i++) {
        result[i] = [];
        for (var j = 0; j < A[0].length; j++) {
          result[i][j] = A[i][j] * k;
        }
      }
    }
    return result;
  };

  var add = function(a, b) {
    var result = [];
    // vectors
    if (typeof(a[0]) === 'number') {
      for (var i = 0; i < a.length; i++) {
        result[i] = a[i] + b[i];
      }
    }
    return result;
  }

  var sub = function(a, b) {
    return add(a, sMul(b, -1));
  }

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
      [0, Math.cos(camera.a[0]), -Math.sin(camera.a[0])],
      [0, Math.sin(camera.a[0]), Math.cos(camera.a[0])]
    ];
    var yRotationMatrix = [
      [Math.cos(camera.a[1]), 0, Math.sin(camera.a[1])],
      [0, 1, 0],
      [-Math.sin(camera.a[1]), 0, Math.cos(camera.a[1])],
    ];
    var zRotationMatrix = [
      [Math.cos(camera.a[2]), -Math.sin(camera.a[2]), 0],
      [Math.sin(camera.a[2]), Math.cos(camera.a[2]), 0],
      [0, 0, 1],
    ];
    var rotationMatrix = mul(mul(xRotationMatrix, yRotationMatrix), zRotationMatrix);

    // var translationMatrix = [
    //   [1, 0, 0, camera.p[0]],
    //   [0, 1, 0, camera.p[1]],
    //   [0, 0, 1, camera.p[2]],
    //   [0, 0, 0, 1]
    // ];
    // point[3] = 1; // Homogenous coordinates.
    // var transformationMatrix = mul(rotationMatrix, translationMatrix);
    // point = mul(transformationMatrix, transposeVector(point));

    // Translate point relative to camera.
    point = [point[0] - camera.p[0], point[1] - camera.p[1], point[2] - camera.p[2]];

    // Rotate
    point = transposeVector(mul(rotationMatrix, transposeVector(point)));

    // Documentation: Pinhole camera
    // TODO: The focal point should be *in front of* the projection plane! http://taishimizu.com/pictures/3d-considered-harmful/stereoscopic-projection-diagram

    // Project the 3-point onto the camera plane.
    /*
      Let $\vec{p}=\pmatrix{x \\ y \\ z}$ be any point in space. Our task is
      to project this point onto the two-dimensional plane that represents is
      the screen. Let the projection plane be $z=0$ and the focal point be
      $\pmatrix{0\\0\\-f}$. The ray between the focal point and $\vec{p}$
      is given by
      \[ \pmatrix{0\\0\\-f} + t\left(\pmatrix{x\\y\\z} - \pmatrix{0\\0\\-f}\right) \]
      This ray intersects the projection plane when the $z$-coordinate is 0,
      that is when $t=\frac{f}{z+f}$. Thus the projected point is given by
      \[ \tilde{p} = \frac{f}{z+f}\pmatrix{x\\y} \]
    */
    var t = camera.f / (point[2] + camera.f);
    var projectedPoint = [t * point[0], t * point[1]];
    return projectedPoint;
  };

  var projectLineFrom3dTo2d = function(line3d, camera, eyeOffset) {
    var xRotationMatrix = [
      [1, 0, 0],
      [0, Math.cos(camera.a[0]), -Math.sin(camera.a[0])],
      [0, Math.sin(camera.a[0]), Math.cos(camera.a[0])]
    ];
    var yRotationMatrix = [
      [Math.cos(camera.a[1]), 0, Math.sin(camera.a[1])],
      [0, 1, 0],
      [-Math.sin(camera.a[1]), 0, Math.cos(camera.a[1])],
    ];
    var zRotationMatrix = [
      [Math.cos(camera.a[2]), -Math.sin(camera.a[2]), 0],
      [Math.sin(camera.a[2]), Math.cos(camera.a[2]), 0],
      [0, 0, 1],
    ];
    var rotationMatrix = mul(mul(xRotationMatrix, yRotationMatrix), zRotationMatrix);

    // Translate point relative to camera.
    line3d = [
      [line3d[0][0] - camera.p[0] + eyeOffset, line3d[0][1] - camera.p[1], line3d[0][2] - camera.p[2]],
      [line3d[1][0] - camera.p[0] + eyeOffset, line3d[1][1] - camera.p[1], line3d[1][2] - camera.p[2]]
    ];

    // Rotate
    line3d = [
      transposeVector(mul(rotationMatrix, transposeVector(line3d[0]))),
      transposeVector(mul(rotationMatrix, transposeVector(line3d[1])))
    ];

    if (line3d[0][2] < 0 && line3d[1][2] < 0) {
      return false;
    }

    if (line3d[0][2] < 0) {
      line3d[0][2] = 0;
    }
    if (line3d[1][2] < 0) {
      line3d[1][2] = 0;
    }

    // Project the endpoints of the line onto the camera plane.
    /*
      Let $\vec{p}=\pmatrix{x \\ y \\ z}$ be any point in space. Our task is
      to project this point onto the two-dimensional plane that represents is
      the screen. Let the projection plane be $z=0$ and the focal point be
      $\pmatrix{0\\0\\-f}$. The ray between the focal point and $\vec{p}$
      is given by
      \[ \pmatrix{0\\0\\-f} + t\left(\pmatrix{x\\y\\z} - \pmatrix{0\\0\\-f}\right) \]
      This ray intersects the projection plane when the $z$-coordinate is 0,
      that is when $t=\frac{f}{z+f}$. Thus the projected point is given by
      \[ \tilde{p} = \frac{f}{z+f}\pmatrix{x\\y} \]
    */
    var t0 = camera.f / (line3d[0][2] + camera.f);
    var t1 = camera.f / (line3d[1][2] + camera.f);
    var projectedLine = [
                          [t0 * line3d[0][0], t0 * line3d[0][1]],
                          [t1 * line3d[1][0], t1 * line3d[1][1]]
                        ];
    return projectedLine;
  };

  return {
    perspective: perspective,
    projectPointFrom3dTo2d: projectPointFrom3dTo2d,
    projectLineFrom3dTo2d: projectLineFrom3dTo2d,
    add: add,
    mul: mul,
    sMul: sMul,
    sub: sub,
    transposeVector: transposeVector,
    componentWiseOperation: componentWiseOperation
  };

}());
