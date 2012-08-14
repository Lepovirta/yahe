# YAHE: Yet Another Hints Extension

I wasn't fully satisfied with the hit-a-hint extensions available for Chrome in
the Chrome web store, so I made my own. These are the existing extensions that
worked as inspiration for this one:

* [Hints script in DWB][hhdwb]
* [Hit-a-Hint for Opera][hhopera] (hint code generation)
* [Keyboard Navigation by xnoreq][kbnav] (keybindings)

## Usage

1. Press Ctrl + `,` to activate the hints.
2. Type the code of the hint you want to activate.
3. Once hint is highlighted, press enter key to simulate a mouse click on the
   link. You can the key press with modifiers like Ctrl and Shift to simulate a
   click with modifiers.
4. After activating a hint, the typing buffer is cleared, so you can continue
   by typing another code.

You can deactivate the hints by pressing the escape key. Pressing Ctrl + `,`
after typing some characters, clears the typing buffer. Pressing the
combination again deactivates the hints.

## License

(2-clause BSD license)

Copyright (c) 2012, Jaakko Pallari
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
