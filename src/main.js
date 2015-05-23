(function(chrome, window) {
  var Controller = require("./controller"),
      View = require("./view"),
      idGenerator = require("./hintidgen"),
      optionParser = require("./optionparser"),
      KeyMapper = require("./keymapper");

  chrome.storage.local.get(null, function(response) {
    var options = optionParser(response),
        keyMapper = new KeyMapper(window),
        view = new View(window),
        generator = idGenerator.bind(null, options.hintCharacters),
        controller = new Controller(view, generator, options);

    keyMapper.addHandler(options.activateKey, [options.activateModifier],
                         controller.toggle.bind(controller));
    keyMapper.addHandler(27, null, controller.escape.bind(controller));
    keyMapper.addHandler(13, null, controller.activateCurrentHint.bind(controller));
    keyMapper.addDefaultNonModifierHandler(controller.addCharacter.bind(controller));
  });
}).call(null, chrome, window);
