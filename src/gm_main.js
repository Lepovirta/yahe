/* global GM_openInTab:true */
/* eslint new-cap: ["error", { "capIsNewExceptions": ["GM_openInTab"] }] */

import defaults from './optionparser';
import boot from './core';

const env = {
  createClicker: function createClicker(window) {
    function isUrl(url) {
      return typeof url === 'string'
      && url !== ''
      && !url.endsWith('/#');
    }

    function isOpenNewTabClick(window, {metaKey, ctrlKey}) {
      return isMac(window) && metaKey || ctrlKey;
    }

    function isMac({navigator}) {
      return navigator.appVersion.includes('Mac');
    }

    function simulateClick(target, {ctrlKey, altKey, shiftKey, metaKey}) {
      let ev = window.document.createEvent('MouseEvent');
      ev.initMouseEvent(
          'click', true, true, window, 0, 0, 0, 0, 0,
          ctrlKey, altKey, shiftKey,
          metaKey, 0, null
      );
      target.dispatchEvent(ev);
    }

    return (target, mods) => {
      let url = target.href;
      if (isUrl(url) && isOpenNewTabClick(window, mods)) {
        GM_openInTab(target.href);
      } else {
        simulateClick(target, mods);
      }
    };
  },
};

boot(window, defaults, env);
