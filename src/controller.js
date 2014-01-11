function Controller(view, generatorFactory, options) {
  this.view = view;
  this.generatorFactory = generatorFactory;
  this.options = options;
  this.active = false;
  this.input = "";
  this.hints = {};
}

Controller.prototype.initialize = function() {
  this.addHandlers();
};

Controller.prototype.addHandlers = function() {
  var handlerMap = {
    27: this.escape.bind(this),
    13: this.activateCurrentHint.bind(this),
    fallback: this.addCharacter.bind(this)
  };
  handlerMap[this.options.activateKey] = this.toggle.bind(this);
  this.view.addKeyHandlerMap(handlerMap);
};

Controller.prototype.escape = function(e) {
  if (this.active) {
    this.deactivate();
    return true;
  }
  return false;
};

Controller.prototype.addCharacter = function(e) {
  if (this.active && !containsMods(e)) {
    var c = String.fromCharCode(e.keyCode).toLowerCase();
    if (this.options.hintCharacters.indexOf(c) >= 0) {
      this.updateSelection(c);
    }
    return true;
  }
  return false;
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
  if (this.active) {
    this.withCurrentHint(function(h){ h.activate(e); });
    this.clearInput();
    return true;
  }
  return false;
};

Controller.prototype.toggle = function(e) {
  if (this.hasActivateModifier(e)) {
    if (this.input.length > 0) {
      this.clearInput();
    } else if (this.active) {
      this.deactivate();
    } else {
      this.activate();
    }
    return true;
  }
  return this.addCharacter(e);
};

Controller.prototype.hasActivateModifier = function(e) {
  return e[this.options.activateModifier + "Key"];
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
