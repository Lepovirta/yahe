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
