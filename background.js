(function(chrome, window) {
  var ls = window.localStorage;
  chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.method === "getOptions")
      sendResponse(ls);
    else
      sendResponse({});
  });
}).call(null, chrome, window);