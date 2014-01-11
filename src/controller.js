function Controller(view, generatorFactory, options) {
  this.view = view;
  this.generatorFactory = generatorFactory;
  this.options = options;
  this.active = false;
  this.input = "";
  this.hints = {};
}

Controller.prototype.escape = function(e) {
  var that = this;
  return this.whenActive(function() {
    that.deactivate();
  });
};

Controller.prototype.whenActive = function(f) {
  if (this.active) {
    f();
    return true;
  }
  return false;
};

Controller.prototype.addCharacter = function(e) {
  var that = this;
  return this.whenActive(function() {
    var c = String.fromCharCode(e.keyCode).toLowerCase();
    if (that.options.hintCharacters.indexOf(c) >= 0) {
      that.updateSelection(c);
    }
  });
};

Controller.prototype.updateSelection = function(s) {
  this.withCurrentHint(function(h) { h.dehilight(); });
  this.input += s;
  this.withCurrentHint(function(h) { h.hilight(); });
};

Controller.prototype.withCurrentHint = function(f) {
  var hint = this.currentHint();
  if (hint) {
    f(hint);
  }
};

Controller.prototype.activateCurrentHint = function(e) {
  var that = this;
  return this.whenActive(function() {
    that.withCurrentHint(function(h){
      h.activate(e);
      if (h.shouldFocus()) {
        that.deactivate();
      }
    });
    that.clearInput();
  });
};

Controller.prototype.toggle = function(e) {
  if (this.input.length > 0) {
    this.clearInput();
  } else if (this.active) {
    this.deactivate();
  } else {
    this.activate();
  }
  return true;
};

Controller.prototype.activate = function() {
  this.active = true;
  this.newHints();
  this.view.showHints();
};

Controller.prototype.newHints = function() {
  this.hints = this.view.generateHints(this.generatorFactory());
};

Controller.prototype.deactivate = function() {
  this.active = false;
  this.clearInput();
  this.view.clearHints();
};

Controller.prototype.clearInput = function() {
  var hint = this.currentHint();
  if (hint) {
    hint.dehilight();
  }
  this.input = "";
};

Controller.prototype.currentHint = function() {
  return this.hints[this.input.toLowerCase()];
};

function containsMods(e) {
  return (e.ctrlKey || e.altKey || e.metaKey);
}

exports.Controller = Controller;
