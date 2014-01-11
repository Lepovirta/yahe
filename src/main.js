(function(chrome, window) {
  var Controller = require("./controller").Controller,
      View = require("./view").View,
      idGeneratorFactory = require("./hintidgen").hintIdGenerator,
      optionParser = require("./optionparser").optionParser;

  chrome.extension.sendRequest({method: "getOptions"}, function(response) {
    var options = optionParser(response),
        view = new View(window),
        generator = idGeneratorFactory.bind(null, options.hintCharacters),
        controller = new Controller(view, generator, options);

    controller.initialize();
  });
}).call(null, chrome, window);
