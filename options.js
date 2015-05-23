var defaults = {
  activateModifier: 'ctrl',
  hintCharacters: 'fdjkghslrueicnxmowabzpt',
  activateKey: 'm'
};

function getElements() {
  return {
    hintCharacters: document.getElementById('hintcharacters'),
    activateKey: document.getElementById('activate_key'),
    modifiers: {
      ctrl: document.getElementById('mod_ctrl'),
      alt: document.getElementById('mod_alt'),
      meta: document.getElementById('mod_meta')
    }
  };
}

function selectedModifier(modifiers) {
  if (modifiers.ctrl.checked) return 'ctrl';
  if (modifiers.alt.checked) return 'alt';
  if (modifiers.meta.checked) return 'meta';
  return defaults.modifier;
}

function saveOptions() {
  var elements = getElements();
  var options = {
    hintCharacters: elements.hintCharacters.value || defaults.hintCharacters,
    activateKey: elements.activateKey.value || defaults.activateKey,
    activateModifier: selectedModifier(elements.modifiers)
  };
  chrome.storage.local.set(options, function() {
    showStatus('Options saved');
  });
}

function restoreOptions() {
  var elements = getElements();
  chrome.storage.local.get(defaults, function(options) {
    var mod = options.activateModifier;
    elements.hintCharacters.value = options.hintCharacters;
    elements.activateKey.value = options.activateKey;
    elements.modifiers.ctrl.checked = mod === 'ctrl';
    elements.modifiers.alt.checked = mod === 'alt';
    elements.modifiers.meta.checked = mod === 'meta';
  });
}

function showStatus(text) {
  var status = document.getElementById('status');
  status.textContent = text;
  window.setTimeout(function() {
    status.textContent = '';
  }, 750, false);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
