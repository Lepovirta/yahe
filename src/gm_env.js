if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (position === undefined || position > subjectString.length) {
          position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

function createClicker(window) {
  function openUrlNewTab(link) {
    GM_openInTab(link);
  }

  function simulateClick(target, mods) {
    var ev = window.document.createEvent('MouseEvent');
    ev.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0,
                      mods.ctrlKey, mods.altKey, mods.shiftKey,
                      mods.metaKey, 0, null);
    target.dispatchEvent(ev);
  }

  return function(target, mods) {
    var url = getUrl(target);
    if (isUrl(url) && isOpenNewTabClick(window, mods)) {
      openUrlNewTab(target.href);
    } else {
      simulateClick(target, mods);
    }
  };
}

function getUrl(target) {
  return target.href;
}

function isUrl(url) {
  return typeof url === "string"
    && url !== ""
    && !url.endsWith("/#");
}

function isOpenNewTabClick(window, mods) {
  return isMac(window) && mods.metaKey || mods.ctrlKey;
}

function isMac(window) {
  return window.navigator.appVersion.indexOf("Mac") !== -1;
}

exports.createClicker = createClicker;
