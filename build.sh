#!/usr/bin/bash
set -euo pipefail

# Check for tools
hash git
hash zip

OUTPUTDIR="./output"
WE_OUTPUTDIR="$OUTPUTDIR/webextension"
CHROME_OUTPUTDIR="$OUTPUTDIR/chrome"

wrap_js() {
    echo '(function() {'
    cat "$1"
    echo '}());'
}

git_version() {
    git describe --match 'v[0-9]*' --abbrev=0 HEAD | sed 's/^v//'
}

build_manifest() {
    node build_manifest.js "$(git_version)" "$@"
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

build_all() {
    build_webextension
    build_chrome
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
