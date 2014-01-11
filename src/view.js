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
