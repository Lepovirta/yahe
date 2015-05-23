var possibleModifiers = ["ctrl", "alt", "meta", "shift"];

function KeyMapper(window) {
  var self = this;

  self.addHandler = function(keyCode, modifiers, handler) {
    var modifierMap = createModifierMap(modifiers);
    addKeyDownHandler(window, handler, function(e) {
      return e.keyCode === keyCode && modifiersMatch(modifierMap, e);
    });
  };

  self.addDefaultNonModifierHandler = function(handler) {
    addKeyDownHandler(window, handler, function(e) {
      return noModifiers(e);
    });
  };
}

function createModifierMap(modifiers) {
  function addModifier(o, mod) {
    o[mod] = true;
    return o;
  }
  return modifiers === null
    ? null
    : modifiers.reduce(addModifier, {});
}

function modifiersMatch(modifierMap, e) {
  function modMatch(modifier) {
    var expected = modifierMap[modifier] || false;
    var actual = e[modifier + "Key"] || false;
    return expected === actual;
  }

  return modifierMap === null || possibleModifiers.every(modMatch);
}

function addKeyDownHandler(window, handler, predicate) {
  var h = function(e) {
    if (predicate(e) && handler(e)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  window.document.addEventListener('keydown', h, true);
}

function noModifiers(e) {
  return !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey;
}

module.exports = KeyMapper;
