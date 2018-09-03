const hintableSelectorsArr = [
  'a',
  'input:not([type=hidden])',
  'textarea',
  'select',
  'button',
  '[onclick]',
  '[onmousedown]',
];

const inputTypes = [
  'text', 'password', 'search', 'tel', 'url', 'email',
  'number', 'datetime', 'datetime-local',
];

const hintableSelectors = hintableSelectorsArr.join(', ');
const containerId = 'yahe-hint-container';
const hintClass = 'yahe-hint-node';
const hintHilightClass = 'yahe-hint-hilight';

function createHintsContainer({document}) {
  let container = document.createElement('div');
  container.id = containerId;
  container.style.display = 'none';
  return container;
}

function appendToDocument({document}, element) {
  document.documentElement.appendChild(element);
}

function getHintableNodes({document}) {
  return document.querySelectorAll(hintableSelectors);
}

function inViewPort(link) {
  let cr = link.getBoundingClientRect();
  return (
    cr.bottom > 0 && cr.right > 0 &&
    cr.width > 0 && cr.height > 0
  );
}

class Hint {
  constructor(window, clicker, hintId, hintable) {
    this._window = window;
    this._clicker = clicker;
    this.hintId = hintId;
    this.hintable = hintable;
    this.hintNode = createHintNode(this._window, this.hintId, this.hintable);
  }

  hilight() {
    this.hintNode.className += ` ${hintHilightClass}`;
  }

  dehilight() {
    let re = new RegExp(`(\\s|^)${hintHilightClass}(\\s|$)`);
    this.hintNode.className = this.hintNode.className.replace(re, '');
  }

  activate(modifiers) {
    if (this.shouldFocus()) {
      this.hintable.focus();
    } else {
      this._click(modifiers);
    }
  }

  shouldFocus() {
    let el = this.hintable;
    return ((el.tagName === 'INPUT' && hasInputType(el)) ||
    el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');
  }

  _click(modifiers) {
    this._clicker(this.hintable, modifiers);
  }
}

function createHintNode(
    {document, pageYOffset, pageXOffset},
    hintId, hintable
) {
  let cr = hintable.getBoundingClientRect();
  let span = document.createElement('span');
  let spanTop = pageYOffset + (cr.top > 0 ? cr.top : 0);
  let spanLeft = pageXOffset + (cr.left > 0 ? cr.left : 0) - span.offsetWidth;

  span.textContent = hintId;
  span.className = hintClass;
  span.style.top = `${spanTop}px`;
  span.style.left = `${spanLeft}px`;
  return span;
}

function hasInputType({type}) {
  return inputTypes.some((t) => type === t);
}

export default class View {
  constructor(window, env) {
    this._window = window;
    this._clicker = env.createClicker(this._window);
    this._container = createHintsContainer(window);
    appendToDocument(this._window, this._container);
  }

  clearHints() {
    this._container.innerHTML = '';
    this.hideHints();
  }

  showHints() {
    this._container.style.display = 'block';
  }

  hideHints() {
    this._container.style.display = 'none';
  }

  _createHint(hintId, node) {
    return new Hint(this._window, this._clicker, hintId, node);
  }

  generateHints(idGenerator) {
    let nodes = getHintableNodes(this._window);
    let hints = {};
    let fragment = this._window.document.createDocumentFragment();

    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      if (inViewPort(node)) {
        let hintId = idGenerator();
        let hint = this._createHint(hintId, node);
        fragment.appendChild(hint.hintNode);
        hints[hintId] = hint;
      }
    }

    this._container.appendChild(fragment);

    return hints;
  }
}
