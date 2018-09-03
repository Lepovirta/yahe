export const defaults = {
  // What hint characters to use in order of appearance.
  hintCharacters: 'fdjkghslrueicnxmowabzpt',

  // Modifier key for activate key
  activateModifier: 'ctrl',

  // Activation key code
  activateKey: 77,

  // Whether the hints should always be hidden after hint activation
  // (by default, they are only hidden after hitting something
  // that should be focused rather than followed, i.e. a form input).
  deactivateAfterHit: false,
};

export default function optionParser(raw) {
  let raw_ = raw || {};
  return {
    activateKey: getActivateKey(raw_) || defaults.activateKey,
    activateModifier: getActivateModifier(raw_) || defaults.activateModifier,
    hintCharacters: getHintCharacters(raw_) || defaults.hintCharacters,
    deactivateAfterHit: (typeof raw_.deactivateAfterHit === 'boolean')
    ? raw_.deactivateAfterHit : defaults.deactivateAfterHit,
  };
}

function getActivateKey({activateKey}) {
  let key = activateKey;
  return typeof key === 'string'
  ? key.toUpperCase().charCodeAt(0)
  : null;
}

function getActivateModifier({activateModifier}) {
  let mod = activateModifier;
  let isValidMod = (mod === 'alt' || mod === 'meta' || mod === 'ctrl');
  return isValidMod ? mod : null;
}

function getHintCharacters({hintCharacters}) {
  let hintChars = hintCharacters;
  return typeof hintChars === 'string'
  ? uniqueCharacters(hintChars.toLowerCase())
  : null;
}

function uniqueCharacters(s) {
  let buffer = [];
  let seen = {};

  for (let c of s) {
    if (!seen[c]) {
      buffer.push(c);
      seen[c] = true;
    }
  }

  return buffer.join('');
}
