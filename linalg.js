/*global camera: true */

var linalg = (function() {

  var mul = function(a, b) {
    var result = [];
    for (var i = 0; i < a.length; i++) {
        result[i] = [];
        for (var j = 0; j < b[0].length; j++) {
            var sum = 0;
            for (var k = 0; k < a[0].length; k++) {
                sum += a[i][k] * b[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
  };

  var componentWiseOperation = function(a, b, op) {
    var result = [];
    if (typeof a[0] === 'number') {
      for (var i = 0; i < a.length; i++) {
        result[i] = op(a[i], b[i]);
      }
    }
    else {
      for (var i = 0; i < a.length; i++) {
        result[i] = [];
        for (var j = 0; j < a[0].length; j++) {
          result[i][j] = op(a[i][j], b[i][j]);
        }
      }
    }
    return result;
  };

  var transposeVector = function(a) {
    var result = [];
    if (typeof a[0] === 'number') {
      for (var i = 0; i < a.length; i++) {
        result[i] = [a[i]];
      }
      return result;
    }
    else {
      for (var i = 0; i < a.length; i++) {
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

  var projectPointFrom3dTo2d = function(point, cameraPosition, cameraDirection, viewPosition) {
    // point[3] = 1; // Homogenous coordinates.
    // var translationMatrix = [
    //   [1, 0, 0, camera.x],
    //   [0, 1, 0, camera.y],
    //   [0, 0, 1, camera.z],
    //   [0, 0, 0, 1]
    // ];
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
    // var transformationMatrix = mul(rotationMatrix, translationMatrix);
    // point = mul(transformationMatrix, transposeVector(point));
    // point = mul([
    //   [Math.cos(camera.ty)*Math.cos(camera.tz), 0, 0],
    //   [0, Math.cos(camera.tx)*Math.cos(camera.tz), 0],
    //   [0, 0, Math.cos(camera.tx)*Math.cos(camera.ty)]
    // ], transposeVector(point));
    // var aRotationMatrix = mul([
    //   [Math.cos(camera.tx), Math.sin(camera.tx), 0],
    //   [-Math.sin(camera.tx), Math.cos(camera.tx), 0],
    //   [0, 0, 1]
    // ];
    point = transposeVector(mul(rotationMatrix, transposeVector(point)));
    point = componentWiseOperation(point, [camera.x, camera.y, camera.z], function(a,b) {return a-b;});
    var w = point[2];
    return [point[0]/(w*camera.f*aspectRatio), point[1]/(w*camera.f)];
  };

  return {
    perspective: perspective,
    projectPointFrom3dTo2d: projectPointFrom3dTo2d,
    mul: mul,
    transposeVector: transposeVector,
    componentWiseOperation: componentWiseOperation
  };

}());