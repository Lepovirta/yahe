var utils = require("./utils");

var hintCharacters = "fdjkghslrueicnxmowabzpt",
    activateModifier = "ctrl",
    activateKey = 77;

function optionParser(raw) {
  return {
    activateKey: getActivateKey(raw),
    activateModifier: getActivateModifier(raw),
    hintCharacters: getHintCharacters(raw)
  };
}

function getActivateKey(raw) {
  var key = raw.activateKey;
  if (typeof key === "string") {
    return key.toUpperCase().charCodeAt(0) || activateKey;
  }
  return activateKey;
}

function getActivateModifier(raw) {
  var mod = raw.activateModifier;
  if (mod === 'alt' || mod === 'meta' || mod === 'ctrl')
    return mod;
  return activateModifier;
}

function getHintCharacters(raw) {
  var hintChars = raw.hintCharacters;
  if (typeof hintChars === "string") {
    return utils.uniqueCharacters(hintChars.toLowerCase());
  }
  return hintCharacters;
}

exports.optionParser = optionParser;
