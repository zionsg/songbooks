/**
 * Common Javascript file for all hymnals
 *
 * @link Used with https://github.com/zionsg/songbooks/blob/master/html/songbook.webpage.html
 */

(function () {
    /** @type {string} */
    let isMessageShown = false;

    /**
     * Init
     *
     * @private
     * @returns {void}
     */
    function init() {
        // Load MIDIjs - cannot save script locally cos it will call other scripts from MIDIjs.net
        utils.loadScript('//www.midijs.net/lib/midi.js');

        // Tack on method in loaded utils.js
        utils.play = function (path) {
            if (!isMessageShown) {
                isMessageShown = true;
                alert(
                    'Please be patient as there may be an initial delay of about 10 secs when a MIDI file is played, '
                    + 'due to loading of MIDI instruments. This message will not be shown again for this session.'
                );
            }

            MIDIjs.play(path);
        };

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
                    + '<a href="javascript:void(0);" onclick="utils.play(\'%s\');">play</a> '
                    + '<a href="javascript:void(0);" onclick="MIDIjs.stop();">stop</a>',
                currHtml ? '<br><br>' : '',
                'target="_blank" rel="noopener"',
                midiPath,
                midiPath
            );

            musicCol.innerHTML = currHtml + midiHtml;
        }
    }

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
        if (['TSMS', 'EHS'].includes(songbookPrefix)) { // total 479 songs in TSMS, total 105 songs in EHS
            return true;
        }

        if ('HP' === songbookPrefix) { // total 479 songs in HP (tentative cos have not indexed all songs)
            // HP is still being indexed, only 1 hymn with MIDI
            if (['31'].includes(songJsonKey)) {
                return true;
            }

            return false;
        }

        if ('RHC' === songbookPrefix) { // total 582 songs in RHC (including the 2 new songs in 2006 reprint)
            // RHC has MIDI for all songs except RHC030a and RHC432a as these are new songs in the February 2006 reprint
            if (['30a', '432a'].includes(songJsonKey)) {
                return false;
            }

            return true;
        }

        return false;
    }

    // Run init
    init();
})();
