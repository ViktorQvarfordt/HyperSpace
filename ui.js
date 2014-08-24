// ui.keys['a'] is true if the key 'a' is being pressed.


var ui = (function() {

  var ui = {
    keys: {}
  };

  var keyCodeMap = {
    '16': 'shift',
    '17': 'ctrl',
    '18': 'alt',
    '225': 'altgr',

    '37': 'left',
    '38': 'up',
    '39': 'right',
    '40': 'down',

    '48': '0',
    '49': '1',
    '50': '2',
    '51': '3',
    '52': '4',
    '53': '5',
    '54': '6',
    '55': '7',
    '56': '8',
    '57': '9',
    '65': 'a',
    '66': 'b',
    '67': 'c',
    '68': 'd',
    '69': 'e',
    '70': 'f',
    '71': 'g',
    '72': 'h',
    '73': 'i',
    '74': 'j',
    '75': 'k',
    '76': 'l',
    '77': 'm',
    '78': 'n',
    '79': 'o',
    '80': 'p',
    '81': 'q',
    '82': 'r',
    '83': 's',
    '84': 't',
    '85': 'u',
    '86': 'v',
    '87': 'w',
    '88': 'x',
    '89': 'y',
    '90': 'z',

    '112': 'f1',
    '113': 'f2',
    '114': 'f3',
    '115': 'f4',
    '116': 'f5',
    '117': 'f6',
    '118': 'f7',
    '119': 'f8',
    '120': 'f9',
    '121': 'f10',
    '122': 'f11',
    '123': 'f12',

    '186': ';',
    '188': ',',
    '190': '.'
  };

  var keysStr = '';

  function updateKeyMap(event) {
    if ((event.type == 'keydown')) {
      ui.keys[keyCodeMap[event.keyCode]] = true;
    } else {
      delete ui.keys[keyCodeMap[event.keyCode]];
    }
    keysStr = Object.keys(ui.keys).join('+');
    if (shouldPreventDefault())
      event.preventDefault();
  }

  var keyCombinationsToPreventDefaultFor = [];

  ui.preventDefaultFor = function(string) {
    keyCombinationsToPreventDefaultFor = string.split(' ');
  };

  function shouldPreventDefault() {
    return keyCombinationsToPreventDefaultFor.some(function(keyComb) {
      return keyComb === keysStr;
    });
  }

  document.addEventListener('keydown', updateKeyMap);
  document.addEventListener('keyup', updateKeyMap);
  window.addEventListener('blur', function() {ui.keys = {};});

  return ui;

})();


// MOUSE: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
