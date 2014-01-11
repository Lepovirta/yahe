function KeyMapper(window) {
  this.window = window;
}

KeyMapper.prototype.addHandler = function(keyCode, modifiers, handler) {
  addKeyDownHandler(window, handler, function(e) {
    return e.keyCode === keyCode && modifiersMatch(modifiers, e);
  });
};

function modifiersMatch(modifiers, e) {
  return modifiers === null || modifiers.every(function(mod) {
    return e[mod + "Key"];
  });
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

KeyMapper.prototype.addDefaultNonModifierHandler = function(handler) {
  addKeyDownHandler(window, handler, function(e) {
    return noModifiers(e);
  });
};

function noModifiers(e) {
  return !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey;
}

exports.KeyMapper = KeyMapper;
