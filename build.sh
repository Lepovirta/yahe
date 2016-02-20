#!/bin/sh

YAHE_CH="yahe.js"
YAHE_GM="yahe.user.js"

## Greasemonkey

cat <<EOF > "$YAHE_GM"
// ==UserScript==
// @name          YAHE
// @namespace     https://github.com/jkpl/yahe
// @description   Yet Another Hints Extension
// @grant         GM_addStyle
// @grant         GM_openInTab
// ==/UserScript==
EOF
echo -n "GM_addStyle(\"" >> "$YAHE_GM"
cat yahe.css | tr -d '\n' >> "$YAHE_GM"
echo "\");" >> "$YAHE_GM"
browserify src/gm_main.js >> "$YAHE_GM"


## Chrome

browserify src/chrome_main.js > "$YAHE_CH"
