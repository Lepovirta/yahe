if (typeof chrome !== 'undefined') {
    browser = chrome;
}

function openLink(message, sender) {
    if (typeof message.url === 'string') {
        browser.tabs.create({url: message.url, active: false});
    }
}

browser.runtime.onMessage.addListener(openLink);
