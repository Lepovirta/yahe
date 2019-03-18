#!/usr/bin/bash
set -euo pipefail

# Check for tools
hash git
hash zip
hash python

OUTPUTDIR="./output"
CHROME_OUTPUTDIR="$OUTPUTDIR/chrome"
GM_OUTPUTDIR="$OUTPUTDIR/greasemonkey"

print_yahe() {
    echo '(function() {'
    cat yahe.js
    echo '}());'
}

git_version() {
    git describe --match 'v[0-9]*' --abbrev=0 HEAD | sed 's/^v//'
}

build_chrome_manifest() {
    python - "$@" <<'EOF'
import sys, json
with open(sys.argv[2]) as f:
    manifest = json.load(f)
manifest['version'] = sys.argv[1]
with open(sys.argv[3], 'w') as f:
    json.dump(manifest, f, indent=4)
EOF
}

build_chrome() {
    echo "building chrome" >&2
    mkdir -p "$CHROME_OUTPUTDIR"
    cp images/icons/* "$CHROME_OUTPUTDIR/"
    cp chrome/options* "$CHROME_OUTPUTDIR/"
    cp yahe.css "$CHROME_OUTPUTDIR/"
    print_yahe > "$CHROME_OUTPUTDIR/yahe.js"
    build_chrome_manifest "$(git_version)" "chrome/manifest.json" "$CHROME_OUTPUTDIR/manifest.json"
    (
        cd "$CHROME_OUTPUTDIR"
        zip -q yahe.crx *
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
