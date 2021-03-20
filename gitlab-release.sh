#!/usr/bin/env sh
set -eu

RELEASE_VERSION=$(cat output/version.txt)
PACKAGE_URL="${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/generic/yahe/${RELEASE_VERSION}"

upload_file() {
    curl --header "JOB-TOKEN: ${CI_JOB_TOKEN}" \
        --upload-file "${1}" \
        "${PACKAGE_URL}/$(basename "${1}")"
}

for file in output/*.zip; do
    upload_file "$file"
done
upload_file output/sha256sums.txt
