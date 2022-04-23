let linalg = (function() {

  let transposeVector = function(a) {
    let result = [];
    let i;
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

  // Matrix multiplication
  let mul = function(a, b) {

    let bIsArray = false;
    if (typeof(b[0]) === 'number') {
      bIsArray = true;
      b = transposeVector(b);
    }

    let result = [];
    let i;
    let j;
    let k;
    let sum;
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

    return bIsArray ? transposeVector(result) : result;

  };

  // Scalar multiplication
  let sMul = function(A, k) {
    let result = [];
    // Array
    if (typeof(A[0]) === 'number') {
      for (let i = 0; i < A.length; i++) {
        result[i] = A[i] * k;
      }
    }
    // Matrix
    else {
      for (let i = 0; i < A.length; i++) {
        result[i] = [];
        for (let j = 0; j < A[0].length; j++) {
          result[i][j] = A[i][j] * k;
        }
      }
    }
    return result;
  };

  let add = function(a, b) {
    let result = [];
    // Arrays
    if (typeof(a[0]) === 'number') {
      for (let i = 0; i < a.length; i++) {
        result[i] = a[i] + b[i];
      }
    }
    return result;
  };

  let sub = function(a, b) {
    return add(a, sMul(b, -1));
  };

  let dot = function(a, b) {
    let result = 0;
    if (typeof(a[0]) === 'number' && typeof(b[0]) === 'number') {
      for (let i = 0; i < a.length; i++) {
        result += a[i] * b[i];
      }
      return result;
    } else {
      throw 'err';
    }
  };

  let norm = function(a) {
    if (typeof(a[0]) === 'number') {
      return Math.sqrt(dot(a, a));
    } else {
      throw 'err';
    }
  };

  let componentWiseOperation = function(a, b, op) {
    let result = [];
    let i;
    let j;
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

  let perspective = function(angle, aspectRatio, near, far) {
    let f = Math.tan(Math.PI * 0.5 - 0.5 * angle);
    let rangeInv = 1.0 / (near - far);

    return [
    [f / aspectRatio, 0, 0, 0],
    [0, f, 0, 0],
    [0, 0, (near + far) * rangeInv, -1],
    [0, 0, near * far * rangeInv * 2, 0]
    ];
  };

  let getRotationMatrix = function(a) {
    let xRotationMatrix = [
      [1, 0, 0],
      [0, Math.cos(a[0]), -Math.sin(a[0])],
      [0, Math.sin(a[0]), Math.cos(a[0])]
    ];
    let yRotationMatrix = [
      [Math.cos(a[1]), 0, Math.sin(a[1])],
      [0, 1, 0],
      [-Math.sin(a[1]), 0, Math.cos(a[1])],
    ];
    let zRotationMatrix = [
      [Math.cos(a[2]), -Math.sin(a[2]), 0],
      [Math.sin(a[2]), Math.cos(a[2]), 0],
      [0, 0, 1],
    ];
    return mul(mul(xRotationMatrix, yRotationMatrix), zRotationMatrix);
  };

  let projectPointFrom3dTo2d = function(point, camera) {

    let rotationMatrix = getRotationMatrix(camera.a);

    // let translationMatrix = [
    //   [1, 0, 0, camera.p[0]],
    //   [0, 1, 0, camera.p[1]],
    //   [0, 0, 1, camera.p[2]],
    //   [0, 0, 0, 1]
    // ];
    // point[3] = 1; // Homogenous coordinates.
    // let transformationMatrix = mul(rotationMatrix, translationMatrix);
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
    let t = camera.f / (point[2] + camera.f);
    let projectedPoint = [t * point[0], t * point[1]];
    return projectedPoint;
  };

  let projectLineFrom3dTo2d = function(line3d, camera) {
    let rotationMatrix = getRotationMatrix(camera.a);

    // Translate point relative to camera.
    line3d = [
      sub(line3d[0], camera.p),
      sub(line3d[1], camera.p)
    ];

    // Rotate
    line3d = [
      mul(rotationMatrix, line3d[0]),
      mul(rotationMatrix, line3d[1])
    ];

    // if (line3d[0][2] < 0 && line3d[1][2] < 0) {
    //   return false;
    // }

    // if (line3d[0][2] < 0) {
    //   line3d[0][2] = 0;
    // }
    // if (line3d[1][2] < 0) {
    //   line3d[1][2] = 0;
    // }

    // Project the endpoints of the line onto the camera plane.

    let t0 = camera.f / line3d[0][2];
    let t1 = camera.f / line3d[1][2];

    // let projectedLine = [
    //   [t0 * line3d[0][0], t0 * line3d[0][1]],
    //   [t1 * line3d[1][0], t1 * line3d[1][1]]
    // ];

    let d = [Math.cos(camera.a[0]), Math.cos(camera.a[1]), Math.cos(camera.a[2])];
    d = sMul(d, 1/norm(d));
    // let t0 = dot(sub(camera.p, add(sMul(d, camera.f), line3d[0])), d) / dot(sub(camera.p, line3d[0]), d);
    // let t1 = dot(sub(camera.p, add(sMul(d, camera.f), line3d[1])), d) / dot(sub(camera.p, line3d[1]), d);

    let projectedLine = [
      [t0 * line3d[0][0], t0 * line3d[0][1]],
      [t1 * line3d[1][0], t1 * line3d[1][1]]
    ];

    let projectedLineOrig = [
      [line3d[0][0], line3d[0][1]],
      [line3d[1][0], line3d[1][1]]
    ];

    // Can be removed
    // if (count < 10) {
    //   console.log('---');
    //   console.log(projectedLineOrig[0], t0, t1, projectedLine[0]);
    //   count++;
    // }

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
    dot: dot,
    norm: norm,
    transposeVector: transposeVector,
    getRotationMatrix: getRotationMatrix,
    componentWiseOperation: componentWiseOperation
  };

}());
