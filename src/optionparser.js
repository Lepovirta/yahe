var utils = require("./utils"),
    defaults = require("./defaults");

function optionParser(raw) {
  var raw_ = raw || {};
  return {
    activateKey: getActivateKey(raw_) || defaults.activateKey,
    activateModifier: getActivateModifier(raw_) || defaults.activateModifier,
    hintCharacters: getHintCharacters(raw_) || defaults.hintCharacters,
    deactivateAfterHit: (typeof raw_.deactivateAfterHit === "boolean") ?
        raw_.deactivateAfterHit : defaults.deactivateAfterHit
  };
}

function getActivateKey(raw) {
  var key = raw.activateKey;
  return typeof key === "string"
    ? key.toUpperCase().charCodeAt(0)
    : null;
}

function getActivateModifier(raw) {
  var mod = raw.activateModifier;
  var isValidMod = (mod === 'alt' || mod === 'meta' || mod === 'ctrl');
  return isValidMod ? mod : null;
}

function getHintCharacters(raw) {
  var hintChars = raw.hintCharacters;
  return typeof hintChars === "string"
    ? utils.uniqueCharacters(hintChars.toLowerCase())
    : null;
}

module.exports = optionParser;
