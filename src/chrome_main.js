(function(chrome, window) {
  var optionParser = require("./optionparser"),
      env = require('./chrome_env'),
      boot = require('./boot');

  chrome.storage.local.get(null, function(response) {
    var options = optionParser(response);
    boot(window, options, env);
  });
}).call(null, chrome, window);
