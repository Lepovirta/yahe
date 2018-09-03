const availableModifiers = ['ctrl', 'alt', 'meta', 'shift'];

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
    let expected = modifierMap[modifier] || false;
    let actual = e[`${modifier}Key`] || false;
    return expected === actual;
  }

  return modifierMap === null || availableModifiers.every(modMatch);
}

function noModifiers({shiftKey, ctrlKey, metaKey, altKey}) {
  return !shiftKey && !ctrlKey && !metaKey && !altKey;
}

export default class KeyMapper {
  constructor({document}) {
    this.document = document;
  }

  _addKeyDownHandler(handler, predicate) {
    let h = (e) => {
      if (predicate(e) && handler(e)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    this.document.addEventListener('keydown', h, true);
  }

  addHandler(keyCode, modifiers, handler) {
    let modifierMap = createModifierMap(modifiers);
    let p = (e) => e.keyCode === keyCode && modifiersMatch(modifierMap, e);
    this._addKeyDownHandler(handler, p);
  }

  addDefaultNonModifierHandler(handler) {
    this._addKeyDownHandler(handler, noModifiers);
  }
}
