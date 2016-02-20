#!/bin/sh

YAHE_CH="yahe.js"
YAHE_GM="yahe.user.js"
GHID="Lepovirta/yahe"
NAMESPACE="https://github.com/$GHID"
RESOURCES="https://raw.githubusercontent.com/$GHID/master"

## Greasemonkey

build_gm() {
    cat <<EOF
// ==UserScript==
// @name          YAHE
// @namespace     $NAMESPACE
// @description   Yet Another Hints Extension
// @icon          $RESOURCES/icon48.png
// @grant         GM_addStyle
// @grant         GM_openInTab
// ==/UserScript==
EOF
    printf "GM_addStyle(\""
    tr -d '\n' < yahe.css
    echo "\");"
    browserify src/gm_main.js
}

build_gm > "$YAHE_GM"

## Chrome

browserify src/chrome_main.js > "$YAHE_CH"
