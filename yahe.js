(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function createClicker(window) {
  return function(element, mods) {
    var ev = window.document.createEvent('MouseEvent');
    ev.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0,
                      mods.ctrlKey, mods.altKey, mods.shiftKey,
                      mods.metaKey, 0, null);
    element.dispatchEvent(ev);
  };
}

module.exports = createClicker;

},{}],2:[function(require,module,exports){
function Controller(view, hintGenerator, options) {
  var self = this;
  var active = false;
  var input = "";
  var hints = {};

  self.escape = function(e) {
    return whenActive(deactivate);
  };

  function whenActive(f) {
    if (active) {
      f();
      return true;
    }
    return false;
  }

  self.addCharacter = function(e) {
    return whenActive(function() {
      var c = String.fromCharCode(e.keyCode).toLowerCase();
      if (options.hintCharacters.indexOf(c) >= 0) {
        updateSelection(c);
      }
    });
  };

  function updateSelection(s) {
    withCurrentHint(function(h) { h.dehilight(); });
    input += s;
    withCurrentHint(function(h) { h.hilight(); });
  }

  function withCurrentHint(f) {
    var hint = currentHint();
    if (hint) {
      f(hint);
    }
  }

  self.activateCurrentHint = function(e) {
    return whenActive(function() {
      withCurrentHint(function(h){
        h.activate(e);
        if (h.shouldFocus() || options.deactivateAfterHit) {
          deactivate();
        }
      });
      clearInput();
    });
  };

  self.toggle = function(e) {
    if (input.length > 0) {
      clearInput();
    } else if (active) {
      deactivate();
    } else {
      activate();
    }
    return true;
  };

  function activate() {
    active = true;
    newHints();
    view.showHints();
  }

  function newHints() {
    hints = view.generateHints(hintGenerator());
  }

  function deactivate() {
    active = false;
    clearInput();
    view.clearHints();
  }

  function clearInput() {
    var hint = currentHint();
    if (hint) {
      hint.dehilight();
    }
    input = "";
  }

  function currentHint() {
    return hints[input.toLowerCase()];
  }
}

module.exports = Controller;

},{}],3:[function(require,module,exports){
var defaults = {
  // What hint characters to use in order of appearance.
  hintCharacters: "fdjkghslrueicnxmowabzpt",

  // Modifier key for activate key
  activateModifier: "ctrl",

  // Activation key code
  activateKey: 77,

  // Whether the hints should always be hidden after hint activation
  // (by default, they are only hidden after hitting something
  // that should be focused rather than followed, i.e. a form input).
  deactivateAfterHit: false
};

module.exports = defaults;

},{}],4:[function(require,module,exports){
function hintIdGenerator(hintCharacters) {
  var counter = 0, len = hintCharacters.length;

  return function() {
    var num = counter, iter = 0, text = '', n;
    while (num >= 0) {
      n = num;
      num -= Math.pow(len, 1 + iter);
      iter++;
    }
    for (var i = 0; i < iter; i++) {
      text = hintCharacters[n % len] + text;
      n = Math.floor(n / len);
    }
    counter++;
    return text;
  };
}

module.exports = hintIdGenerator;

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
(function(chrome, window) {
  var Controller = require("./controller"),
      View = require("./view"),
      idGenerator = require("./hintidgen"),
      optionParser = require("./optionparser"),
      KeyMapper = require("./keymapper");

  chrome.storage.local.get(null, function(response) {
    var options = optionParser(response),
        keyMapper = new KeyMapper(window),
        view = new View(window),
        generator = idGenerator.bind(null, options.hintCharacters),
        controller = new Controller(view, generator, options);

    keyMapper.addHandler(options.activateKey, [options.activateModifier],
                         controller.toggle.bind(controller));
    keyMapper.addHandler(27, null, controller.escape.bind(controller));
    keyMapper.addHandler(13, null, controller.activateCurrentHint.bind(controller));
    keyMapper.addDefaultNonModifierHandler(controller.addCharacter.bind(controller));
  });
}).call(null, chrome, window);

},{"./controller":2,"./hintidgen":4,"./keymapper":5,"./optionparser":7,"./view":9}],7:[function(require,module,exports){
var utils = require("./utils"),
    defaults = require("./defaults");

function optionParser(raw) {
  var raw_ = raw || {};
  return {
    activateKey: getActivateKey(raw_) || defaults.activateKey,
    activateModifier: getActivateModifier(raw_) || defaults.activateModifier,
    hintCharacters: getHintCharacters(raw_) || defaults.hintCharacters,
    deactivateAfterHit: (typeof raw_.deactivateAfterHit === "boolean") ?
        raw_.deactivateAfterHit : defaults.deactivateAfterHit
  };
}

function getActivateKey(raw) {
  var key = raw.activateKey;
  return typeof key === "string"
    ? key.toUpperCase().charCodeAt(0)
    : null;
}

function getActivateModifier(raw) {
  var mod = raw.activateModifier;
  var isValidMod = (mod === 'alt' || mod === 'meta' || mod === 'ctrl');
  return isValidMod ? mod : null;
}

function getHintCharacters(raw) {
  var hintChars = raw.hintCharacters;
  return typeof hintChars === "string"
    ? utils.uniqueCharacters(hintChars.toLowerCase())
    : null;
}

module.exports = optionParser;

},{"./defaults":3,"./utils":8}],8:[function(require,module,exports){
function forEach(coll, f) {
  for (var i = 0; i < coll.length; i++) {
    f(coll[i], i);
  }
}

function uniqueCharacters(s) {
  var buffer = [], seen = {};
  forEach(s, function(c) {
    if (!seen[c]) {
      buffer.push(c);
      seen[c] = true;
    }
  });
  return buffer.join('');
}

exports.forEach = forEach;
exports.uniqueCharacters = uniqueCharacters;

},{}],9:[function(require,module,exports){
var utils = require('./utils');
var createClicker = require('./clicker');

var hintableSelectorsArr = [
  'a',
  'input:not([type=hidden])',
  'textarea',
  'select',
  'button',
  '[onclick]',
  '[onmousedown]'
]

var inputTypes = [
  'text', 'password', 'search', 'tel', 'url', 'email',
  'number', 'datetime', 'datetime-local'
];

var hintableSelectors = hintableSelectorsArr.join(', ');
var containerId = "yahe-hint-container";
var hintClass = "yahe-hint-node";
var hintHilightClass = "yahe-hint-hilight";

function View(window) {
  var self = this;
  var clicker = createClicker(window);
  var container = createHintsContainer(window);
  appendToDocument(window, container);

  self.clearHints = function() {
    container.innerHTML = "";
    self.hideHints();
  };

  self.showHints = function() {
    container.style.display = "block";
  };

  self.hideHints = function() {
    container.style.display = "none";
  };

  self.generateHints = function(idGenerator) {
    var nodes = getHintableNodes(window),
        hints = {},
        fragment = window.document.createDocumentFragment();

    utils.forEach(nodes, function(node) {
      if (inViewPort(node)) {
        var hintId = idGenerator(),
            hint = new Hint(window, clicker, hintId, node);
        fragment.appendChild(hint.hintNode);
        hints[hintId] = hint;
      }
    });

    container.appendChild(fragment);

    return hints;
  };
}

function createHintsContainer(window) {
  var container = window.document.createElement('div');
  container.id = containerId;
  container.style.display = "none";
  return container;
}

function appendToDocument(window, element) {
  window.document.documentElement.appendChild(element);
}

function getHintableNodes(window) {
  return window.document.querySelectorAll(hintableSelectors);
}

function inViewPort(link) {
  var cr = link.getBoundingClientRect();
  return (cr.bottom > 0 && cr.right > 0 &&
          cr.width > 0 && cr.height > 0);
};

function Hint(window, clicker, hintId, hintable) {
  var self = this;
  self.hintId = hintId;
  self.hintable = hintable;
  self.hintNode = createHintNode(window, hintId, hintable);

  self.hilight = function() {
    self.hintNode.className += " " + hintHilightClass;
  };

  self.dehilight = function() {
    var re = new RegExp("(\\s|^)" + hintHilightClass + "(\\s|$)");
    self.hintNode.className = self.hintNode.className.replace(re, '');
  };

  self.activate = function(modifiers) {
    if (self.shouldFocus()) {
      self.hintable.focus();
    } else {
      click(modifiers);
    }
  };

  self.shouldFocus = function() {
    var el = self.hintable;
    return ((el.tagName === 'INPUT' && hasInputType(el)) ||
            el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');
  };

  function click(modifiers) {
    clicker(self.hintable, modifiers);
  }
}

function createHintNode(window, hintId, hintable) {
  var cr = hintable.getBoundingClientRect(),
      span = window.document.createElement('span'),
      span_top = window.pageYOffset + (cr.top > 0 ? cr.top : 0),
      span_left = window.pageXOffset + (cr.left > 0 ? cr.left : 0) - span.offsetWidth;

  span.innerText = hintId;
  span.className = hintClass;
  span.style.top = span_top + "px";
  span.style.left = span_left + "px";
  return span;
}

function hasInputType(element) {
  return inputTypes.some(function(t) { return element.type === t; });
}

module.exports = View;

},{"./clicker":1,"./utils":8}]},{},[6]);
