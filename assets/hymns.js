/**
 * Common JavaScript file for all hymnals
 *
 * @link Used with https://github.com/zionsg/songbooks/blob/master/html/songbook.webpage.html which loads js/utils.js
 */

(function () {
    /** @type {string} */
    let isMessageShown = false;

    /** @type {string[]} List of songs in Hymns of Praise with MIDI files. */
    let hpMidi = [
        1, 3, 4, 5, 6, 7, 8, 9, 11, 12, 14, 16, 17, 20, 21, 22, 23, 26, 28,
        30, 31, 32, 33, 36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
        51, 53, 55, 57, 58, 59, 60, 61, 62, 63, 65, 68,
        85, 87, 88, 93, 94, 97, 98, 100,
        146, 149, 152, 178, 185, 186,
        210, 436,
    ].map((val) => '' + val);

    /**
     * Check if song has MIDI file
     *
     * Using function cos a songbook may have MIDI files for every song except a few, or only have
     * MIDI files for a few songs.
     *
     * @private
     * @param {string} songbookPrefix
     * @param {string} songJsonKey
     * @returns {boolean}
     */
    function hasMidi(songbookPrefix, songJsonKey) {
        // Total of 582 songs in RHC (including the 2 new songs in 2006 reprint)
        // Total of 479 songs in TSMS, total of 105 songs in EHS
        if (['RHC', 'TSMS', 'EHS'].includes(songbookPrefix)) {
            return true;
        }

        if ('HP' === songbookPrefix) { // total 479 songs in HP (tentative cos have not indexed all songs)
            // HP is still being indexed, only some hymns have MIDI
            if (!utils.isNumber(songJsonKey)) { // front cover and back cover
                return true;
            }

            if (hpMidi.includes(songJsonKey)) {
                return true;
            }

            return false;
        }

        return false;
    }

    // Initialization
    (function init() {
        // Load MIDIjs - cannot host/load script locally cos it will call other scripts from MIDIjs.net
        let MIDIjs = null;
        utils.loadScript('https://www.midijs.net/lib/midi.js');

        let songbook = document.querySelector('h1[data-songbook]').getAttribute('data-songbook');
        let songRows = document.querySelectorAll('tr[data-song]');
        let midiFolder = '../assets/' + songbook.toLowerCase() + '/music/';
        let midiExtension = '.mid';

        for (let i = 0; i < songRows.length; i++) {
            let songRow = songRows[i];
            let song = songRow.getAttribute('data-song');
            let filename = songRow.getAttribute('data-filename');
            let midiPath = midiFolder + filename + midiExtension;

            // Skip if song has no MIDI file
            if (!hasMidi(songbook, song)) {
                continue;
            }

            let musicCol = songRow.querySelector('td:nth-child(3)');
            let currHtml = musicCol.innerHTML;
            let midiHtml = utils.sprintf( // "javascript:void(0);" prevents scroll to top after click, unlike href="#"
                '%sMIDI: <a %s href="%s">file</a> '
                    + '<a class="js-midi" href="#" data-action="play" data-file="%s">play</a> '
                    + '<a class="js-midi" href="#" data-action="stop">stop</a>',
                currHtml ? '<br><br>' : '',
                'target="_blank" rel="noopener"',
                midiPath,
                midiPath
            );

            musicCol.innerHTML = currHtml + midiHtml;
        }

        document.querySelectorAll('a.js-midi').forEach((link) => {
            link.addEventListener('click', (event) => {
                event.preventDefault();

                let action = link.getAttribute('data-action');
                let file = link.getAttribute('data-file');

                if ('stop' === action) {
                    window.MIDIjs.stop();
                } else if ('play' === action) {
                    if (!isMessageShown) {
                        isMessageShown = true;
                        alert(
                            'Playing of MIDI files only works when webpage is hosted on a server '
                            + 'with Internet connection. Please be patient as there may be an '
                            + 'initial delay of about 10 secs when a MIDI file is played, due to '
                            + 'loading of MIDI instruments. This message will not be shown again '
                            + 'for this session.'
                        );
                    }

                    window.MIDIjs.play(file);
                }
            });
        });
    })();
})();
