/* global chrome:true */

import optionParser from './optionparser';
import boot from './core';

const env = {
  createClicker(window) {
    return (element, {ctrlKey, altKey, shiftKey, metaKey}) => {
      const ev = window.document.createEvent('MouseEvent');
      ev.initMouseEvent(
          'click', true, true, window, 0, 0, 0, 0, 0,
          ctrlKey, altKey, shiftKey,
          metaKey, 0, null
      );
      element.dispatchEvent(ev);
    };
  },
};

chrome.storage.local.get(null, (response) => {
  const options = optionParser(response);
  boot(window, options, env);
});
