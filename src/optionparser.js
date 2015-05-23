var utils = require("./utils"),
    defaults = require("./defaults");

function optionParser(raw) {
  return {
    activateKey: getActivateKey(raw) || defaults.activateKey,
    activateModifier: getActivateModifier(raw) || defaults.activateModifier,
    hintCharacters: getHintCharacters(raw) || defaults.hintCharacters
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
  return (mod === 'alt' || mod === 'meta' || mod === 'ctrl')
    ? mod
    : null;
}

function getHintCharacters(raw) {
  var hintChars = raw.hintCharacters;
  return typeof hintChars === "string"
    ? utils.uniqueCharacters(hintChars.toLowerCase())
    : null;
}

module.exports = optionParser;
