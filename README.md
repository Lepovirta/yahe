# Yet Another Hints Extension (YAHE)

I wasn't fully satisfied with the hit-a-hint extensions available for Chrome and Firefox, so I made my own.
These are the existing extensions that worked as inspiration for this one:

* [Hints script in DWB][hhdwb]
* [Hit-a-Hint for Opera][hhopera] (hint code generation)
* [Keyboard Navigation by xnoreq][kbnav]

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

### Greasemonkey script in Firefox

1. Install [Greasemonkey][] addon for Firefox.
2. Follow the steps described in the "Building from source" section below.

## Building from source

If you want to edit the source code, install the following tools:

* [Node.JS][nodejs]
* [NPM][] (usually ships with Node.JS)

Use NPM to build the code:

    $ npm run build

The Chrome extension can be loaded from the build output by following these steps:

1. Fire up Chrome/Chromium, and go to the extensions settings.
2. Enable the developer mode from the top-right corner.
3. Click the "Load unpacked" button.
4. Select the `dist/chrome/` directory from the directory where you cloned this repository to.

The Greasemonkey script can be loaded by opening the `dist/greasemonkey/yahe.user.js` file
from the directory where you cloned this repository to in Firefox.

If you want to change the default settings for the script,
change the values in `src/optionparser.js` source file.
Remember to rebuild after changing the values.

## Hacking

* All the code for YAHE is located in the `src/` directory.
* Rollup is used for bundling the source code to a single source file.
* Gulp is used for piecing all the build steps together.
* ESLint is used for style checking. Run `npm run lint` to check the source code.

## License

(2-clause BSD license)

Copyright (c) 2012-2014, Jaakko Pallari
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice,
this list of conditions and the following disclaimer in the documentation
and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

[hhopera]: https://github.com/hogelog/hit-a-hint-opera
[hhdwb]: https://bitbucket.org/portix/dwb/src/0583e44d0164/scripts/hints.js
[kbnav]: https://chrome.google.com/webstore/detail/abcekjakjehkpheoaadhkjfcdodpjbgk
[cws]: https://chrome.google.com/webstore/detail/eimkmfhfckmajkednnnhkacajflcjinm
[greasemonkey]: https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/
[nodejs]: http://nodejs.org/
[npm]: https://npmjs.org/
