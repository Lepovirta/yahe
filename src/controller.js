function Controller(view, hintGenerator, options) {
  var self = this;
  var active = false;
  var input = "";
  var hints = {};

  self.escape = function(e) {
    return whenActive(deactivate);
  };

  function whenActive(f) {
    if (active) {
      f();
      return true;
    }
    return false;
  }

  self.addCharacter = function(e) {
    return whenActive(function() {
      var c = String.fromCharCode(e.keyCode).toLowerCase();
      if (options.hintCharacters.indexOf(c) >= 0) {
        updateSelection(c);
      }
    });
  };

  function updateSelection(s) {
    withCurrentHint(function(h) { h.dehilight(); });
    input += s;
    withCurrentHint(function(h) { h.hilight(); });
  }

  function withCurrentHint(f) {
    var hint = currentHint();
    if (hint) {
      f(hint);
    }
  }

  self.activateCurrentHint = function(e) {
    return whenActive(function() {
      withCurrentHint(function(h){
        h.activate(e);
        if (h.shouldFocus()) {
          deactivate();
        }
      });
      clearInput();
    });
  };

  self.toggle = function(e) {
    if (input.length > 0) {
      clearInput();
    } else if (active) {
      deactivate();
    } else {
      activate();
    }
    return true;
  };

  function activate() {
    active = true;
    newHints();
    view.showHints();
  }

  function newHints() {
    hints = view.generateHints(hintGenerator());
  }

  function deactivate() {
    active = false;
    clearInput();
    view.clearHints();
  }

  function clearInput() {
    var hint = currentHint();
    if (hint) {
      hint.dehilight();
    }
    input = "";
  }

  function currentHint() {
    return hints[input.toLowerCase()];
  }
}

module.exports = Controller;
