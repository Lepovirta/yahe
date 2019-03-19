#!/usr/bin/bash
set -euo pipefail

# Check for tools
hash git
hash zip
hash python

OUTPUTDIR="./output"
WE_OUTPUTDIR="$OUTPUTDIR/webextension"
GM_OUTPUTDIR="$OUTPUTDIR/greasemonkey"

print_yahe() {
    echo '(function() {'
    cat yahe.js
    echo '}());'
}

git_version() {
    git describe --match 'v[0-9]*' --abbrev=0 HEAD | sed 's/^v//'
}

build_manifest() {
    python - "$(git_version)" "$@" <<'EOF'
import sys, json
with open(sys.argv[2]) as f:
    manifest = json.load(f)
manifest['version'] = sys.argv[1]
with open(sys.argv[3], 'w') as f:
    json.dump(manifest, f, indent=4)
EOF
}

build_webextension() {
    echo "building web extension" >&2
    mkdir -p "$WE_OUTPUTDIR"
    cp -r images/icons "$WE_OUTPUTDIR/"
    cp -r options "$WE_OUTPUTDIR/"
    cp yahe.css yahe-bg.js "$WE_OUTPUTDIR/"
    print_yahe > "$WE_OUTPUTDIR/yahe.js"
    build_manifest "manifest.json" "$WE_OUTPUTDIR/manifest.json"
    (
        cd "$WE_OUTPUTDIR"
        zip -q -r -FS ../yahe.zip .
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
    print_yahe
}

build_greasemonkey() {
    echo "building greasemonkey" >&2
    mkdir -p "$GM_OUTPUTDIR"
    greasemonkey_script > "$GM_OUTPUTDIR/yahe.user.js"
}

build_all() {
    build_webextension
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
