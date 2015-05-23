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
