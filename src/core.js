import KeyMapper from './keymapper';
import View from './view';

export default function boot(window, options, env) {
  let keyMapper = new KeyMapper(window);
  let view = new View(window, env);
  let generator = hintIdGenerator.bind(null, options.hintCharacters);
  let controller = new Controller(view, generator, options);
  let toggle = controller.toggle.bind(controller);
  let esc = controller.escape.bind(controller);
  let activate = controller.activateCurrentHint.bind(controller);
  let addChar = controller.addCharacter.bind(controller);
  let deactivate = controller.deactivate.bind(controller);

  keyMapper.addHandler(options.activateKey, [options.activateModifier], toggle);
  keyMapper.addHandler(27, null, esc);
  keyMapper.addHandler(13, null, activate);
  keyMapper.addDefaultNonModifierHandler(addChar);
  window.addEventListener('beforeunload', deactivate, true);
}

// Hint logic and UI controller //

class Controller {
  constructor(view, hintGenerator, {hintCharacters, deactivateAfterHit}) {
    this._active = false;
    this._input = '';
    this._hints = {};
    this._view = view;
    this._hintGenerator = hintGenerator;
    this._hintCharacters = hintCharacters;
    this._deactivateAfterHit = deactivateAfterHit;
  }

  escape() {
    this._whenActive(this.deactivate);
  }

  _whenActive(f) {
    if (this._active) {
      f();
      return true;
    }
    return false;
  }

  addCharacter({keyCode}) {
    return this._whenActive(() => {
      let c = String.fromCharCode(keyCode).toLowerCase();
      if (this._hintCharacters.includes(c)) {
        this._updateSelection(c);
      }
    });
  }

  _updateSelection(s) {
    this._withCurrentHint((h) => {
      h.dehilight();
    });
    this._input += s;
    this._withCurrentHint((h) => {
      h.hilight();
    });
  }

  _withCurrentHint(f) {
    let hint = this._currentHint();
    if (hint) {
      f(hint);
    }
  }

  activateCurrentHint(e) {
    return this._whenActive(() => {
      this._withCurrentHint((h) => {
        h.activate(e);
        if (h.shouldFocus() || this._deactivateAfterHit) {
          this.deactivate();
        }
      });
      this._clearInput();
    });
  }

  toggle() {
    if (this._input.length > 0) {
      this._clearInput();
    } else if (this._active) {
      this.deactivate();
    } else {
      this._activate();
    }
    return true;
  }

  _activate() {
    this._active = true;
    this._newHints();
    this._view.showHints();
  }

  _newHints() {
    this._hints = this._view.generateHints(this._hintGenerator());
  }

  deactivate() {
    this._active = false;
    this._clearInput();
    this._view.clearHints();
  }

  _clearInput() {
    let hint = this._currentHint();
    if (hint) {
      hint.dehilight();
    }
    this._input = '';
  }

  _currentHint() {
    return this._hints[this._input.toLowerCase()];
  }
}

// Hint ID generator creator //

function hintIdGenerator(hintCharacters) {
  let counter = 0;
  let len = hintCharacters.length;

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
