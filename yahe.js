/*
YAHE: Yet Another Hints Extension
*/

// Chrome and Web Extensions APIs should be compatible
// enough for this extension to allow using chrome object
// in place of the browser object.
if (typeof chrome !== 'undefined') {
  browser = chrome;
}

// Default options used in YAHE.
// GREASEMONKEY: Tune these settings to get a different configuration.
const defaultOptions = {
  // The hint characters to use in order of appearance.
  hintCharacters: 'fdjkghslrueicnxmowabzpt',

  // Modifier key for activate key
  activateModifier: 'ctrl',

  // Activation key code
  activateKey: 77, // 77 = m

  // Whether the hints should always be hidden after hint activation or not.
  // By default, they are only hidden after hitting something
  // that should be focused rather than followed, i.e. a form input.
  deactivateAfterHit: false
};

// Boot is the entrypoint for all browser versions of YAHE
// Window is your browser window object, options include options seen above,
// and the env provides browser specific features.
function boot(window, options, env) {
  const keyMapper = new KeyMapper(window);
  const view = new View(window, env);
  const generator = hintIdGenerator.bind(null, options.hintCharacters);
  const controller = new Controller(view, generator, options);
  const toggle = controller.toggle.bind(controller);
  const esc = controller.escape.bind(controller);
  const activate = controller.activateCurrentHint.bind(controller);
  const addChar = controller.addCharacter.bind(controller);
  const deactivate = controller.deactivate.bind(controller);

  keyMapper.addHandler(options.activateKey, [options.activateModifier], toggle);
  keyMapper.addHandler(27, null, esc);
  keyMapper.addHandler(13, null, activate);
  keyMapper.addDefaultNonModifierHandler(addChar);
  window.addEventListener('beforeunload', deactivate, true);
}

// Option parser parses options from given JS object.
// If an option is missing or it's invalid,
// a default option will be used (see `defaultOptions` above).
const optionParser = (() => {
  function optionParser(raw) {
    const raw_ = raw || {};
    return {
      activateKey: getActivateKey(raw_) || defaultOptions.activateKey,
      activateModifier: getActivateModifier(raw_) || defaultOptions.activateModifier,
      hintCharacters: getHintCharacters(raw_) || defaultOptions.hintCharacters,
      deactivateAfterHit: (typeof raw_.deactivateAfterHit === 'boolean') ?
        raw_.deactivateAfterHit : defaultOptions.deactivateAfterHit
    };
  }

  function getActivateKey({ activateKey }) {
    return typeof activateKey === 'string'
      ? activateKey.toUpperCase().charCodeAt(0)
      : null;
  }

  function getActivateModifier({ activateModifier }) {
    const mod = activateModifier;
    const isValidMod = (mod === 'alt' || mod === 'meta' || mod === 'ctrl');
    return isValidMod ? mod : null;
  }

  function uniqueCharacters(s) {
    const buffer = [];
    const seen = {};
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (!seen[c]) {
        buffer.push(c);
        seen[c] = true;
      }

    }
    return buffer.join('');
  }

  function getHintCharacters({ hintCharacters }) {
    return typeof hintCharacters === 'string'
      ? uniqueCharacters(hintCharacters.toLowerCase())
      : null;
  }

  return optionParser;
})();

// Controller handles the user input logic,
// and modifies the UI (View) accordingly.
function Controller(view, hintGenerator, { hintCharacters, deactivateAfterHit }) {
  const self = this;
  let active = false;
  let input = '';
  let hints = {};

  self.escape = e => whenActive(self.deactivate);

  function whenActive(f) {
    if (active) {
      f();
      return true;
    }
    return false;
  }

  self.addCharacter = ({ keyCode }) => whenActive(() => {
    const c = String.fromCharCode(keyCode).toLowerCase();
    if (hintCharacters.includes(c)) {
      updateSelection(c);
    }
  });

  function updateSelection(s) {
    withCurrentHint(h => { h.dehilight(); });
    input += s;
    withCurrentHint(h => { h.hilight(); });
  }

  function withCurrentHint(f) {
    const hint = currentHint();
    if (hint) {
      f(hint);
    }
  }

  self.activateCurrentHint = e => whenActive(() => {
    withCurrentHint(h => {
      h.activate(e);
      if (h.shouldFocus() || deactivateAfterHit) {
        self.deactivate();
      }
    });
    clearInput();
  });

  self.toggle = e => {
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

  self.deactivate = () => {
    active = false;
    clearInput();
    view.clearHints();
  };

  function clearInput() {
    const hint = currentHint();
    if (hint) {
      hint.dehilight();
    }
    input = '';
  }

  function currentHint() {
    return hints[input.toLowerCase()];
  }
}

// Hint ID generator creates a function that generates
// hints based on the given set of characters,
// one hint per each function call.
function hintIdGenerator(hintCharacters) {
  let counter = 0;
  const len = hintCharacters.length;

  return () => {
    let num = counter;
    let iter = 0;
    let text = '';
    let n;
    while (num >= 0) {
      n = num;
      num -= len ** (1 + iter);
      iter++;
    }
    for (let i = 0; i < iter; i++) {
      text = hintCharacters[n % len] + text;
      n = Math.floor(n / len);
    }
    counter++;
    return text;
  };
}

// KeyMapper is used for mapping key presses to various function calls
var KeyMapper = (() => {
  const possibleModifiers = ['ctrl', 'alt', 'meta', 'shift'];

  function KeyMapper(window) {
    const self = this;

    self.addHandler = (keyCode, modifiers, handler) => {
      const modifierMap = createModifierMap(modifiers);
      addKeyDownHandler(window, handler, e => e.keyCode === keyCode && modifiersMatch(modifierMap, e));
    };

    self.addDefaultNonModifierHandler = handler => {
      addKeyDownHandler(window, handler, e => noModifiers(e));
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
      const expected = modifierMap[modifier] || false;
      const actual = e[`${modifier}Key`] || false;
      return expected === actual;
    }

    return modifierMap === null || possibleModifiers.every(modMatch);
  }

  function addKeyDownHandler({ document }, handler, predicate) {
    const h = e => {
      if (predicate(e) && handler(e)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', h, true);
  }

  function noModifiers({ shiftKey, ctrlKey, metaKey, altKey }) {
    return !shiftKey && !ctrlKey && !metaKey && !altKey;
  }

  return KeyMapper;
})();

// View renders the given hints on the browser DOM
var View = (() => {
  const hintableSelectorsArr = [
    'a',
    'input:not([type=hidden])',
    'textarea',
    'select',
    'button',
    '[onclick]',
    '[onmousedown]'
  ];

  const inputTypes = [
    'text', 'password', 'search', 'tel', 'url', 'email',
    'number', 'datetime', 'datetime-local'
  ];

  const hintableSelectors = hintableSelectorsArr.join(', ');
  const containerId = 'yahe-hint-container';
  const hintClass = 'yahe-hint-node';
  const hintHilightClass = 'yahe-hint-hilight';

  function View(window, env) {
    const self = this;
    const clicker = env.createClicker(window);
    const container = createHintsContainer(window);
    appendToDocument(window, container);

    self.clearHints = () => {
      container.innerHTML = '';
      self.hideHints();
    };

    self.showHints = () => {
      container.style.display = 'block';
    };

    self.hideHints = () => {
      container.style.display = 'none';
    };

    self.generateHints = idGenerator => {
      const nodes = getHintableNodes(window);
      const hints = {};
      const fragment = window.document.createDocumentFragment();

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (inViewPort(node)) {
          const hintId = idGenerator();
          const hint = new Hint(window, clicker, hintId, node);
          fragment.appendChild(hint.hintNode);
          hints[hintId] = hint;
        }
      }

      container.appendChild(fragment);

      return hints;
    };
  }

  function createHintsContainer({ document }) {
    const container = document.createElement('div');
    container.id = containerId;
    container.style.display = 'none';
    return container;
  }

  function appendToDocument({ document }, element) {
    document.documentElement.appendChild(element);
  }

  function getHintableNodes({ document }) {
    return document.querySelectorAll(hintableSelectors);
  }

  function inViewPort(link) {
    const cr = link.getBoundingClientRect();
    return (cr.bottom > 0 && cr.right > 0 &&
      cr.width > 0 && cr.height > 0);
  }

  function Hint(window, clicker, hintId, hintable) {
    const self = this;
    self.hintId = hintId;
    self.hintable = hintable;
    self.hintNode = createHintNode(window, hintId, hintable);

    self.hilight = () => {
      self.hintNode.className += ` ${hintHilightClass}`;
    };

    self.dehilight = () => {
      const re = new RegExp(`(\\s|^)${hintHilightClass}(\\s|$)`);
      self.hintNode.className = self.hintNode.className.replace(re, '');
    };

    self.activate = modifiers => {
      if (self.shouldFocus()) {
        self.hintable.focus();
      } else {
        click(modifiers);
      }
    };

    self.shouldFocus = () => {
      const el = self.hintable;
      return ((el.tagName === 'INPUT' && hasInputType(el)) ||
        el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');
    };

    function click(modifiers) {
      clicker(self.hintable, modifiers);
    }
  }

  function createHintNode({ document, pageYOffset, pageXOffset }, hintId, hintable) {
    const cr = hintable.getBoundingClientRect();
    const span = document.createElement('span');
    const span_top = pageYOffset + (cr.top > 0 ? cr.top : 0);
    const span_left = pageXOffset + (cr.left > 0 ? cr.left : 0) - span.offsetWidth;

    span.textContent = hintId;
    span.className = hintClass;
    span.style.top = `${span_top}px`;
    span.style.left = `${span_left}px`;
    return span;
  }

  function hasInputType({ type }) {
    return inputTypes.some(t => type === t);
  }

  return View;
})();

// Simulate a mouse click on a DOM element
function simulateClick(window, element, { ctrlKey, altKey, shiftKey, metaKey }) {
  const event = new MouseEvent('click', {
    ctrlKey: ctrlKey,
    altKey: altKey,
    shiftKey: shiftKey,
    metaKey: metaKey,
    relatedTarget: element,
  });
  element.dispatchEvent(event);
}

// Checks if the given target should be opened in a new tab
function shouldOpenInNewTab({navigator}, {href}, { metaKey, ctrlKey }) {
  const isUrl = (
    typeof href === 'string' && href !== '' && !href.endsWith('/#')
  );
  const isMac = navigator.appVersion.includes('Mac');
  const isOpenNewTabClick = isMac && metaKey || ctrlKey;
  return isUrl && isOpenNewTabClick
}

/// Browser envs ///
//
// These functions are used for generating browser specific
// collections of functionality that are called here "environments".
//
// Each environment includes the following functionalities:
//   * createClicker: function that creates a click event simulator
//

function webExtEnv() {
  const env = {};
  env.createClicker = window => (target, mods) => {
    if (shouldOpenInNewTab(window, target, mods)) {
      browser.runtime.sendMessage(null, {url: target.href});
    } else {
      simulateClick(window, target, mods);
    }
  };
  return env
}

// Greasemonkey / UserScript env
function gmEnv() {
  const env = {};
  env.createClicker = window => (target, mods) => {
    if (shouldOpenInNewTab(window, target, mods)) {
      GM_openInTab(target.href);
    } else {
      simulateClick(window, target, mods);
    }
  };
  return env;
}

// Check which browser is running, load the appropriate environment,
// and boot up YAHE!
if (typeof browser !== 'undefined') {
  // Web extension
  browser.storage.local.get(null).then(response => {
    boot(window, optionParser(response), webExtEnv());
  });
} else if (typeof GM_openInTab !== 'undefined') {
  // GreaseMonkey / Userscript
  boot(window, defaultOptions, gmEnv());
} else {
  alert('unknown browser!');
}
