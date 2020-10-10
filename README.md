# ![YAHE logo](images/icons/icon32.png) Yet Another Hints Extension (YAHE)

Yet Another Hints Extension is a browser extension that allows you to click elements without using your mouse.

## Usage

1. Press the hint key to activate the hints. The default hint key is `ctrl-m`.
2. Type the code of the hint you want to activate.
3. Once hint is highlighted, press enter key to simulate a mouse click on the
   link. You can the key press with modifiers like Ctrl and Shift to simulate a
   click with modifiers.
4. After activating a hint, the typing buffer is cleared, so you can continue
   by typing another code.

You can deactivate the hints by pressing the escape key. Pressing the hint key
after typing some characters clears the typing buffer, and pressing it again
deactivates the hints.

In Chrome, you can customize the hint key and hint characters in the extension's options page.

## Installation

### Chrome

Install from [Chrome Web Store][cws].

### Firefox

Install from [Firefox Add-ons][ffao]

## Hacking

All the code for YAHE is located in the `yahe.js` and `yahe-bg.js` files.
The first file is loaded in each browser tab to show and control hints,
and the second one as a background process for opening links in new tabs.

If you want to build the extension packages yourself,
you need the following tools installed:

* [Bash][]
* [Python][]
* [Zip][]
* [Git][]

Use the build script to build all components:

    $ ./build.sh

The Chrome extension can be loaded from the build output by following these steps:

1. Fire up Chrome/Chromium, and go to the extensions settings.
2. Enable the developer mode from the top-right corner.
3. Click the "Load unpacked" button.
4. Select the `output/chrome/` directory from the directory where you cloned this repository to.

The Firefox extension can be loaded from the build output by following these steps:

1. Fire up Firefox, and go to this page: `about:debugging`.
2. Check the "Enable add-on debugging" box.
3. Click the "Load Temporary Add-on..." button.
4. Select the `output/webextension/` directory from the directory where you cloned this repository to.

If you want to change the default settings for the script,
change the values in `yahe.js` source file.
Remember to rebuild after changing the values.

You can also check the code for lint errors using [NPM][] and [ESLint][]:

    $ npm install
    $ npm run lint

## Inspiration

I wouldn't have created this extension,
if it wasn't for the existing hit-a-hint extensions that were already out there.
These are the browsers and extensions that worked as an inspiration for YAHE:

* Hints script in [DWB][]
* [Hit-a-Hint for Opera][hhopera] (hint code generation)

## License

2-clause BSD license. See [LICENSE](LICENSE) for more details.

[cws]: https://chrome.google.com/webstore/detail/eimkmfhfckmajkednnnhkacajflcjinm
[ffao]: https://addons.mozilla.org/en-US/firefox/addon/yet-another-hints-extension/
[bash]: https://www.gnu.org/software/bash/
[python]: https://www.python.org/
[git]: https://git-scm.com/
[zip]: http://www.info-zip.org/Zip.html
[hhopera]: https://github.com/hogelog/hit-a-hint-opera
[dwb]: https://portix.bitbucket.io/dwb/
[npm]: https://www.npmjs.com/get-npm
[eslint]: https://eslint.org/
