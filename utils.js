var utils = {
  roundToOneDecimal: function(val) {
    // No decimal if first decimal rounds to zero, returns a float.
    return +(Math.round(val+"e+1")+"e-1") || 0;
    // Always one decimal, returns a string.
    // return val.toFixed(1);
  }
};
