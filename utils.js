var utils = {
  roundToOneDecimal: function(val) {
    return +(Math.round(val+"e+1")+"e-1");
  }
};
