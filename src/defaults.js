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
