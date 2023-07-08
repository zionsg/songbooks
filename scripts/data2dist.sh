#!/bin/sh
# sh used instead of bash for portability & maximum compatibility.

##
# Convert JSON data files to JavaScript distributable files for easy embedding in webpage without worrying about CORS.
#
# Instead of setting the JSON contents to a variable, the JavaScript file runs
# a function that will emit a `songbook.ready` event of CustomEvent type on
# the window, providing the JSON in event.detail.data. An event listener can
# be used to retrieve the JSON contents, instead of guessing whether the file
# has loaded or not.
#
# @example Run this script from the root of this repository: bin/data2dist.sh
##

# Check if in correct directory
if [ ! -d "scripts" ]; then
    echo "Please run this script from root of repo."
    exit 1
fi

# Loop thru files in data directory
for FILE_PATH in data/*.json; do
    # Skip songbook.schema.json
    if echo "${FILE_PATH}" | grep -q "schema"; then
        continue;
    fi

    # Add just 1 line before and after the JSON, to make it easy to manually copy out the JSON
    # Do NOT attempt to sanitize JSON, i.e. replace smart punctuation “”″‘’′—– with plain ASCII, as
    # it is not binary-safe & will mess up the multi-byte Unicode characters for the Chinese lyrics
    CONTENTS="(function (currentScript) { " # no \n here
    CONTENTS="${CONTENTS}window.dispatchEvent(new CustomEvent('songbook.ready', { detail: { data: // Added line\n"
    CONTENTS="${CONTENTS}$(cat ${FILE_PATH})"
    CONTENTS="${CONTENTS}\n}})); })(document.currentScript); // Added line" # don't add \n cos echo will add \n

    FILENAME_WITH_EXT="${FILE_PATH##*/}"
    FILENAME="${FILENAME_WITH_EXT%.json}"
    echo "${CONTENTS}" > "dist/${FILENAME}.js"
done

echo "Generated dist/*.js from data/*.json."
