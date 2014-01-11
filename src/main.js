(function(chrome, window) {
  var Controller = require("./controller").Controller,
      View = require("./view").View,
      idGeneratorFactory = require("./hintidgen").hintIdGenerator,
      optionParser = require("./optionparser").optionParser,
      KeyMapper = require("./keymapper").KeyMapper;

  chrome.extension.sendRequest({method: "getOptions"}, function(response) {
    var options = optionParser(response),
        keyMapper = new KeyMapper(window),
        view = new View(window),
        generator = idGeneratorFactory.bind(null, options.hintCharacters),
        controller = new Controller(view, generator, options);

    keyMapper.addHandler(options.activateKey, [options.activateModifier],
                         controller.toggle.bind(controller));
    keyMapper.addHandler(27, null, controller.escape.bind(controller));
    keyMapper.addHandler(13, null, controller.activateCurrentHint.bind(controller));
    keyMapper.addDefaultNonModifierHandler(controller.addCharacter.bind(controller));
  });
}).call(null, chrome, window);
