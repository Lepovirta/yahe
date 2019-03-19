const isChrome = typeof chrome !== 'undefined' && typeof browser === 'undefined';

const defaults = {
  focusOnNewTab: false,
}

function combinedOptions(options) {
  return Object.assign(Object.assign({}, defaults), options);
}

function openLink({ focusOnNewTab }, { url }) {
  const params = { url: url, active: focusOnNewTab };
  if (isChrome) {
    chrome.tabs.create(params);
  } else {
    browser.tabs.create(params);
  }
};

function isValidMessage(message) {
  return typeof message.url === 'string';
}

function loadStorage(f) {
  if (isChrome) {
    chrome.storage.local.get(null, f);
  } else {
    browser.storage.local.get().then(f);
  }
}

function messageHandler(message) {
  if (isValidMessage(message)) {
    loadStorage(
      options => openLink(combinedOptions(options), message)
    );
  }
}

if (isChrome) {
  chrome.runtime.onMessage.addListener(messageHandler);
} else {
  browser.runtime.onMessage.addListener(messageHandler);
}
