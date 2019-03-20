#!/usr/bin/bash
set -euo pipefail

# Check for tools
hash git
hash zip
hash python

OUTPUTDIR="./output"
WE_OUTPUTDIR="$OUTPUTDIR/webextension"
CHROME_OUTPUTDIR="$OUTPUTDIR/chrome"
GM_OUTPUTDIR="$OUTPUTDIR/greasemonkey"

wrap_js() {
    echo '(function() {'
    cat "$1"
    echo '}());'
}

git_version() {
    git describe --match 'v[0-9]*' --abbrev=0 HEAD | sed 's/^v//'
}

build_manifest() {
    python - "$(git_version)" "$@" <<'EOF'
import sys, json
manifest = {}
for arg in sys.argv[3:]:
    with open(arg) as f:
        manifest.update(json.load(f))
manifest['version'] = sys.argv[1]
with open(sys.argv[2], 'w') as f:
    json.dump(manifest, f, indent=4)
EOF
}

create_common_resources() {
    local outdir=$1
    mkdir -p "$outdir"
    cp -r images/icons "$outdir/"
    cp -r options "$outdir/"
    cp yahe.css "$outdir/"
    wrap_js yahe.js > "$outdir/yahe.js"
    wrap_js yahe-bg.js > "$outdir/yahe-bg.js"
}

build_webextension() {
    echo "building web extension" >&2
    create_common_resources "$WE_OUTPUTDIR"
    build_manifest \
        "$WE_OUTPUTDIR/manifest.json" \
        "manifest.json" "manifest.webext.json"
    (
        cd "$WE_OUTPUTDIR"
        zip -q -r -FS ../yahe.webext.zip .
    )
}

build_chrome() {
    echo "building chrome" >&2
    create_common_resources "$CHROME_OUTPUTDIR"
    build_manifest \
        "$CHROME_OUTPUTDIR/manifest.json" \
        "manifest.json"
    (
        cd "$CHROME_OUTPUTDIR"
        zip -q -r -FS ../yahe.chrome.zip .
    )
}

greasemonkey_script() {
    cat <<EOF
// ==UserScript==
// @name          YAHE
// @description   Yet Another Hints Extension
// @namespace     https://github.com/Lepovirta/yahe
// @icon          https://raw.githubusercontent.com/Lepovirta/yahe/master/images/icons/icon48.png
// @homepageURL   https://github.com/Lepovirta/yahe
// @version       $(git_version)
// @grant         GM_addStyle
// @grant         GM_openInTab
// ==/UserScript==
EOF
    printf 'GM_addStyle("'
    tr -d '\n' < yahe.css
    echo '");'
    wrap_js yahe.js
}

build_greasemonkey() {
    echo "building greasemonkey" >&2
    mkdir -p "$GM_OUTPUTDIR"
    greasemonkey_script > "$GM_OUTPUTDIR/yahe.user.js"
}

build_all() {
    build_webextension
    build_chrome
    build_greasemonkey
}

clean_all() {
    rm -rv "$OUTPUTDIR"
}

main() {
    case "${1:-}" in
        clean) clean_all ;;
        *) build_all ;;
    esac
}

main "$@"
