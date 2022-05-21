#!/bin/sh
# sh used instead of bash for portability & maximum compatibility.

##
# Convert JSON files to JavaScript files for easy embedding in webpage without worrying about CORS.
#
# Instead of setting the JSON contents to a variable, the JavaScript file runs
# a function that will emit a `songbook.ready` event of CustomEvent type on
# the window, providing the JSON in event.detail.data. An event listener can
# be used to retrieve the JSON contents, instead of guessing whether the file
# has loaded or not.
#
# @example Run this script from the root of this repository: bin/json2js.sh
##

# Check if in correct directory
if [ ! -d "bin" ]; then
    echo "Please run this script from root of repo."
    exit 1
fi

# Loop thru files in data directory
TIMESTAMP=$(date --utc --iso-8601=seconds) # use UTC for easier comparison
for FILE_PATH in data/*.json; do
    # Skip songbook.schema.json
    if echo "${FILE_PATH}" | grep -q "schema"; then
        continue;
    fi

    FILENAME_WITH_EXT="${FILE_PATH##*/}"
    FILENAME="${FILENAME_WITH_EXT%.json}"

    CONTENTS="// Generated at ${TIMESTAMP} - https://github.com/zionsg/songbooks"
    CONTENTS="${CONTENTS}\n(function () { window.dispatchEvent(new CustomEvent('songbook.ready', { detail: { data: "
    CONTENTS="${CONTENTS}\n$(cat ${FILE_PATH})\n}}));\n})();"
    echo "${CONTENTS}" > "dist/${FILENAME}.js"
done
