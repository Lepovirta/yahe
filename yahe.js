;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function Controller(view, generatorFactory, options) {
  this.view = view;
  this.generatorFactory = generatorFactory;
  this.options = options;
  this.active = false;
  this.input = "";
  this.hints = {};
}

Controller.prototype.initialize = function() {
  this.addHandlers();
};

Controller.prototype.addHandlers = function() {
  var handlerMap = {
    27: this.escape.bind(this),
    13: this.activateCurrentHint.bind(this),
    fallback: this.addCharacter.bind(this)
  };
  handlerMap[this.options.activateKey] = this.toggle.bind(this);
  this.view.addKeyHandlerMap(handlerMap);
};

Controller.prototype.escape = function(e) {
  if (this.active) {
    this.deactivate();
    return true;
  }
  return false;
};

Controller.prototype.addCharacter = function(e) {
  if (this.active && !containsMods(e)) {
    var c = String.fromCharCode(e.keyCode).toLowerCase();
    if (this.options.hintCharacters.indexOf(c) >= 0) {
      this.updateSelection(c);
    }
    return true;
  }
  return false;
};

Controller.prototype.updateSelection = function(s) {
  this.withCurrentHint(function(h) { h.dehilight(); });
  this.input += s;
  this.withCurrentHint(function(h) { h.hilight(); });
};

Controller.prototype.withCurrentHint = function(f) {
  var hint = this.currentHint();
  if (hint) {
    f(hint);
  }
};

Controller.prototype.activateCurrentHint = function(e) {
  if (this.active) {
    this.withCurrentHint(function(h){ h.activate(e); });
    this.clearInput();
    return true;
  }
  return false;
};

Controller.prototype.toggle = function(e) {
  if (this.hasActivateModifier(e)) {
    if (this.input.length > 0) {
      this.clearInput();
    } else if (this.active) {
      this.deactivate();
    } else {
      this.activate();
    }
    return true;
  }
  return this.addCharacter(e);
};

Controller.prototype.hasActivateModifier = function(e) {
  return e[this.options.activateModifier + "Key"];
};

Controller.prototype.activate = function() {
  this.active = true;
  this.newHints();
  this.view.showHints();
};

Controller.prototype.newHints = function() {
  this.hints = this.view.generateHints(this.generatorFactory());
};

Controller.prototype.deactivate = function() {
  this.active = false;
  this.clearInput();
  this.view.clearHints();
};

Controller.prototype.clearInput = function() {
  var hint = this.currentHint();
  if (hint) {
    hint.dehilight();
  }
  this.input = "";
};

Controller.prototype.currentHint = function() {
  return this.hints[this.input.toLowerCase()];
};

function containsMods(e) {
  return (e.ctrlKey || e.altKey || e.metaKey);
}

exports.Controller = Controller;

},{}],2:[function(require,module,exports){
var defaultOptions = {
  // What hint characters to use in order of appearance.
  hintCharacters: "fdjkghslrueicnxmowabzpt",

  // Modifier key for activate key
  activateModifier: "ctrl",

  // Activation key code
  activateKey: 77
};

exports.defaultOptions = defaultOptions;

},{}],3:[function(require,module,exports){
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

exports.hintIdGenerator = hintIdGenerator;

},{}],4:[function(require,module,exports){
(function(chrome, window) {
  var Controller = require("./controller").Controller,
      View = require("./view").View,
      idGeneratorFactory = require("./hintidgen").hintIdGenerator,
      optionParser = require("./optionparser").optionParser;

  chrome.extension.sendRequest({method: "getOptions"}, function(response) {
    var options = optionParser(response),
        view = new View(window),
        generator = idGeneratorFactory.bind(null, options.hintCharacters),
        controller = new Controller(view, generator, options);

    controller.initialize();
  });
}).call(null, chrome, window);

},{"./controller":1,"./hintidgen":3,"./optionparser":5,"./view":7}],5:[function(require,module,exports){
var utils = require("./utils"),
    defaults = require("./defaults").defaultOptions;

function optionParser(raw) {
  return {
    activateKey: getActivateKey(raw) || defaults.activateKey,
    activateModifier: getActivateModifier(raw) || defaults.activateModifier,
    hintCharacters: getHintCharacters(raw) || defaults.hintCharacters
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
  return (mod === 'alt' || mod === 'meta' || mod === 'ctrl')
    ? mod
    : null;
}

function getHintCharacters(raw) {
  var hintChars = raw.hintCharacters;
  return typeof hintChars === "string"
    ? utils.uniqueCharacters(hintChars.toLowerCase())
    : null;
}

exports.optionParser = optionParser;

},{"./defaults":2,"./utils":6}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
var utils = require('./utils');

var hintableSelectors = 'a, input:not([type=hidden]), textarea, select, ' +
      'button, [onclick], [onmousedown]',
    inputTypes = ['text', 'password', 'search', 'tel', 'url', 'email',
                  'number', 'datetime', 'datetime-local'],
    containerId = "yahe-hint-container",
    hintClass = "yahe-hint-node",
    hintHilightClass = "yahe-hint-hilight";

function View(window) {
  this.window = window;
  this.container = createHintsContainer(window);
  appendToDocument(window, this.container);
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

View.prototype.addKeyHandlerMap = function(handlerMap) {
  window.document.addEventListener(
    'keydown', handlerForHandlerMap(handlerMap), true);
};

function handlerForHandlerMap(handlerMap) {
  return function(e) {
    var handler = handlerMap[e.keyCode] || handlerMap.fallback;
    if (handler(e)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
}

View.prototype.clearHints = function() {
  this.container.innerHTML = "";
  this.hideHints();
};

View.prototype.showHints = function() {
  this.container.style.display = "block";
};

View.prototype.hideHints = function() {
  this.container.style.display = "none";
};

View.prototype.generateHints = function(idGenerator) {
  var nodes = getHintableNodes(this.window),
      hints = {},
      that = this,
      fragment = window.document.createDocumentFragment();

  utils.forEach(nodes, function(node) {
    if (inViewPort(node)) {
      var hintId = idGenerator(),
          hint = new Hint(window, hintId, node);
      fragment.appendChild(hint.hintNode);
      hints[hintId] = hint;
    }
  });

  this.container.appendChild(fragment);

  return hints;
};

function getHintableNodes(window) {
  return window.document.querySelectorAll(hintableSelectors);
}

function inViewPort(link) {
  var cr = link.getBoundingClientRect();
  return (cr.bottom > 0 && cr.right > 0 &&
          cr.width > 0 && cr.height > 0);
};

function Hint(window, hintId, hintable) {
  this.hintId = hintId;
  this.hintable = hintable;
  this.hintNode = createHintNode(window, hintId, hintable);
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

Hint.prototype.hilight = function() {
  this.hintNode.className += " " + hintHilightClass;
};

Hint.prototype.dehilight = function() {
  var re = new RegExp("(\\s|^)" + hintHilightClass + "(\\s|$)");
  this.hintNode.className = this.hintNode.className.replace(re, '');
};

Hint.prototype.activate = function(modifiers) {
  if (this.shouldFocus()) {
    this.hintable.focus();
  } else {
    mouseclick(window, this.hintable, modifiers);
  }
};

Hint.prototype.shouldFocus = function() {
  var el = this.hintable;
  return ((el.tagName === 'INPUT' && hasInputType(el)) ||
          el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');
};

function hasInputType(element) {
  return inputTypes.some(function(t) { return element.type === t; });
}

var mouseclick = function(window, target, mods) {
  var ev = window.document.createEvent('MouseEvent');
  ev.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0,
                    mods.ctrlKey, mods.altKey, mods.shiftKey,
                    mods.metaKey, 0, null);
  target.dispatchEvent(ev);
};

exports.View = View;

},{"./utils":6}]},{},[4])
;