const isChrome = typeof chrome !== 'undefined' && typeof browser === 'undefined';

const defaults = {
  activateModifier: 'ctrl',
  hintCharacters: 'fdjkghslrueicnxmowabzpt',
  activateKey: 'm',
  deactivateAfterHit: false,
  focusOnNewTab: false,
};

function opt(id) {
  return document.getElementById(id);
}

function optValue(id, alternative) {
  return opt(id).value || alternative;
}

function getChecked(name) {
  return document.querySelector(`input[name=${name}]:checked`).value
}

function selectedModifier() {
  return getChecked('mod') || defaults.activateModifier;
}

function selectedDeactivate() {
  const v = getChecked('deactivate');
  if (v === 'normal') return false;
  if (v === 'always') return true;
  else return defaults.deactivateAfterHit;
}

function saveOptions(e) {
  e.preventDefault();
  const options = {
    hintCharacters: optValue('hintcharacters', defaults.hintCharacters),
    activateKey: optValue('activate_key', defaults.activateKey),
    activateModifier: selectedModifier(),
    deactivateAfterHit: selectedDeactivate(),
    focusOnNewTab: opt('focus_on_newtab').checked || defaults.focusOnNewTab,
  };
  if (isChrome) {
    chrome.storage.local.set(options, () => showStatus());
  } else {
    browser.storage.local.set(options).then(() => showStatus());
  }
}

function restoreOptions() {
  function restore(foundOpts) {
    const options = Object.assign(Object.assign({}, defaults), foundOpts);
    const mod = options.activateModifier;
    opt('hintcharacters').value = options.hintCharacters;
    opt('activate_key').value = options.activateKey;
    opt('mod_ctrl').checked = mod === 'ctrl';
    opt('mod_alt').checked = mod === 'alt';
    opt('mod_meta').checked = mod === 'meta';
    opt('deactivate_normal').checked = !options.deactivateAfterHit;
    opt('deactivate_always').checked = options.deactivateAfterHit;
    opt('focus_on_newtab').checked = options.focusOnNewTab;
  }

  if (isChrome) {
    chrome.storage.local.get(null, restore);
  } else {
    browser.storage.local.get().then(restore);
  }
}

function showStatus() {
  var status = document.getElementById('status');
  status.textContent = 'Options saved';
  window.setTimeout(() => {
    status.textContent = '';
  }, 750, false);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
