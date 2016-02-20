// ==UserScript==
// @name          YAHE
// @namespace     https://github.com/jkpl/yahe
// @description   Yet Another Hints Extension
// @grant         GM_addStyle
// @grant         GM_openInTab
// ==/UserScript==
GM_addStyle(".yahe-hint-node {  font-family: sans-serif;  position: absolute;  color: black;  background-color: #fe5;  border: 1px solid #ea1;  padding: 2px;  margin: 0;  z-index: 2147483647;  text-transform: uppercase;  font-weight: bold;  font-size: 12px;  line-height: 12px;}.yahe-hint-hilight {  background-color: #333;  color: #fe5;}");
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Controller = require("./controller"),
    View = require("./view"),
    idGenerator = require("./hintidgen"),
    KeyMapper = require("./keymapper");

module.exports = function(window, options, env) {
  var keyMapper = new KeyMapper(window),
      view = new View(window, env),
      generator = idGenerator.bind(null, options.hintCharacters),
      controller = new Controller(view, generator, options);

  var toggle = controller.toggle.bind(controller),
      esc = controller.escape.bind(controller),
      activate = controller.activateCurrentHint.bind(controller),
      addChar = controller.addCharacter.bind(controller),
      deactivate = controller.deactivate.bind(controller);

  keyMapper.addHandler(options.activateKey, [options.activateModifier], toggle);
  keyMapper.addHandler(27, null, esc);
  keyMapper.addHandler(13, null, activate);
  keyMapper.addDefaultNonModifierHandler(addChar);
  window.addEventListener('beforeunload', deactivate, true);
}

},{"./controller":2,"./hintidgen":6,"./keymapper":7,"./view":9}],2:[function(require,module,exports){
function Controller(view, hintGenerator, options) {
  var self = this;
  var active = false;
  var input = "";
  var hints = {};

  self.escape = function(e) {
    return whenActive(self.deactivate);
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
          self.deactivate();
        }
      });
      clearInput();
    });
  };

  self.toggle = function(e) {
    if (input.length > 0) {
      clearInput();
    } else if (active) {
      self.deactivate();
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

  self.deactivate = function() {
    active = false;
    clearInput();
    view.clearHints();
  };

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
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (position === undefined || position > subjectString.length) {
          position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

function createClicker(window) {
  function openUrlNewTab(link) {
    GM_openInTab(link);
  }

  function simulateClick(target, mods) {
    var ev = window.document.createEvent('MouseEvent');
    ev.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0,
                      mods.ctrlKey, mods.altKey, mods.shiftKey,
                      mods.metaKey, 0, null);
    target.dispatchEvent(ev);
  }

  return function(target, mods) {
    var url = getUrl(target);
    if (isUrl(url) && isOpenNewTabClick(window, mods)) {
      openUrlNewTab(target.href);
    } else {
      simulateClick(target, mods);
    }
  };
}

function getUrl(target) {
  return target.href;
}

function isUrl(url) {
  return typeof url === "string"
    && url !== ""
    && !url.endsWith("/#");
}

function isOpenNewTabClick(window, mods) {
  return isMac(window) && mods.metaKey || mods.ctrlKey;
}

function isMac(window) {
  return window.navigator.appVersion.indexOf("Mac") !== -1;
}

exports.createClicker = createClicker;

},{}],5:[function(require,module,exports){
var options = require('./defaults'),
    env = require('./gm_env'),
    boot = require('./boot');

boot(window, options, env);

},{"./boot":1,"./defaults":3,"./gm_env":4}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

function View(window, env) {
  var self = this;
  var clicker = env.createClicker(window);
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

  span.textContent = hintId;
  span.className = hintClass;
  span.style.top = span_top + "px";
  span.style.left = span_left + "px";
  return span;
}

function hasInputType(element) {
  return inputTypes.some(function(t) { return element.type === t; });
}

module.exports = View;

},{"./utils":8}]},{},[5]);
