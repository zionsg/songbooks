/**
 * Common utility functions wrapped using Module pattern
 *
 * Functions ordered in alphabetical order, public before private.
 * No support for Internet Explorer.
 *
 * For consistency, functions using record and key arguments should always
 * place the record as the 1st argument, e.g. getSongPrefix(data, key). This
 * makes it easier to add optional arguments - compare fn(data, key, optional)
 * versus fn(key, data, optional). This also applies to inline scripts in webpages.
 */
const utils = (function () {
    /**
     * Self reference - all public vars/methods will be stored in here and returned as public interface
     *
     * @public This is considered public as it will be returned as the public interface at the end.
     * @type {object}
     */
    const self = {
        // Common constants enumerated here, names to be all in caps, listed alphabetically
        COMMENTS: '//',
        LANG_EN: 'en',
        LANG_CN: 'cn',
        LANGUAGES: ['en', 'cn'],
    };

    /**
     * Parsed query params
     *
     * @private
     * @type {object} Key-value pairs.
     */
    let queryParams = null;

    /**
     * Capitalize first letter
     *
     * @public
     * @param {string} text
     * @returns {string}
     */
    self.capitalizeFirstLetter = function (text) {
        return (text ? (text[0].toUpperCase() + text.slice(1)) : '');
    };

    /**
     * Combine all language versions of title for section/song
     *
     * @public
     * @param {object} titles - Value for "titles" key in section/song, e.g. { "en":"A", "cn":"甲" }.
     * @param {string} jsonKey - JSON key for section/song. This is used for the English title if latter not set.
     * @param {string} separator - Separator between different language titless
     * @returns {string}
     */
    self.getCombinedTitle = function (titles, jsonKey, separator = ' ') {
        titles = titles || {};

        let result = titles[utils.LANG_EN] || jsonKey || '';
        self.LANGUAGES.forEach(function (lang) {
            if (self.LANG_EN === lang) {
                return;
            }

            let langTitle = titles[lang] || '';
            result += (langTitle ? separator + langTitle : '');
        });

        return result;
    };

    /**
     * Get language-specific title for section/song
     *
     * @public
     * @param {object} titles - Value for "titles" key in section/song, e.g. { "en":"A", "cn":"甲" }.
     * @param {string} jsonKey - JSON key for section/song. This is used for the English title if latter not set.
     * @param {string} language
     * @returns {string} Defaults to English title if language-specific title does not exist.
     */
    self.getLanguageTitle = function (titles, jsonKey, language) {
        titles = titles || {};

        let result = titles[utils.LANG_EN] || jsonKey || '';
        self.LANGUAGES.forEach(function (lang) {
            if (self.LANG_EN === lang || lang !== language) {
                return;
            }

            let langTitle = titles[lang] || '';
            if (langTitle) {
                result = langTitle;
            }
        });

        return result;
    };

    /**
     * Get transcribed language lyrics for a song
     *
     * @public
     * @param {object} song - Song data.
     * @returns {(null|object)} Indexed by languages. Other lyrics info like authors are omitted.
     */
    self.getLanguageLyrics = function (song) {
        let lyrics = (song && song.lyrics) || null;
        if (!lyrics) {
            return null;
        }

        let result = {};
        utils.LANGUAGES.forEach(function (lang) {
            if (lyrics[lang]) {
                result[lang] = lyrics[lang];
            }
        });

        return utils.isEmpty(result) ? null : result;
    };

    /*
     * Get value of query string param
     *
     * @public
     * @param {string} paramName - Name of querystring param.
     * @param {*} defaultValue - Value to use if param is not found.
     * @returns {*} Single value will be returned if param only has 1 value. Array will be returned
     *              if the param has multiple values, e.g. "?a=1&a=2" returns [1, 2] for param "a".
     */
    self.getQueryParam = function (paramName, defaultValue) {
        if (null === queryParams) { // parse just once
            queryParams = {};
            window.location.search.substr(1).split('&').forEach(function (item) {
                let pair = item.split('=');
                let key = pair[0];
                let value = pair[1] && decodeURIComponent(pair[1]); // null-coalescing/short-circuit

                // ignore empty params
                if (value !== '') {
                    (queryParams[key] = queryParams[key] || []).push(value); // null-coalescing/short-circuit
                }
            });
        }

        let result = queryParams[paramName];
        if (undefined === result) {
            return defaultValue;
        }

        // All the values are stored as arrays. If array only has 1 value, return that.
        return (1 === result.length) ? result[0] : result;
    };

    /**
     * Get filename for song
     *
     * @public
     * @example Given book prefix "ABC", key "31" returns "abc031", key "test" returns "abc-test".
     * @param {object} data - Songbook data.
     * @param {string} key - JSON key for song.
     * @returns {string}
     */
    self.getSongFilename = function (data, key) {
        let filename = data.bookPrefix || '';

        if (isNumber(key)) {
            filename += padNum(key);
        } else {
            filename += (filename ? '-' : '') + self.textToVariableName(key);
        }

        return filename.toLowerCase();
    };

    /**
     * Get song prefix
     *
     * @public
     * @example Given book prefix "ABC", key "31" returns "ABC031", key "test" returns book prefix "ABC".
     * @param {object} data - Songbook data.
     * @param {string} key - JSON key for song.
     * @returns {string}
     */
    self.getSongPrefix = function (data, key) {
        let bookPrefix = data.bookPrefix || '';
        let songPrefix = isNumber(key) ? (bookPrefix + padNum(key)) : '';

        return (songPrefix || bookPrefix);
    };

    /**
     * Get order of stanzas
     *
     * If not specified in song data, defaults to alternating btw stanza and chorus.
     *
     * @public
     * @param {object} song - Song data.
     * @returns {object} { lastStanzaKey: "2", order: ["1", "chorus", "2", "chorus"] }.
     */
    self.getStanzaOrder = function (song) {
        let lyrics = (song && song.lyrics) || null;
        let stanzaOrder = (lyrics && lyrics.stanzaOrder) || [];
        let lastStanzaKey = '';

        if (!self.isEmpty(stanzaOrder)) {
            for (let i = stanzaOrder.length - 1; i >= 0; i--) {
                if (!self.isChorus(stanzaOrder[i])) {
                    lastStanzaKey = stanzaOrder[i];
                    break;
                }
            }

            return {
                lastStanzaKey: lastStanzaKey,
                order: stanzaOrder
            };
        }

        let isDone = false;
        utils.LANGUAGES.forEach(function (lang) {
            let langLyrics = lyrics[lang] || null;
            if (isDone || self.isEmpty(langLyrics)) {
                return;
            }

            // List stanza keys, find chorus key
            let chorusJsonKey = '';
            let stanzaKeys = [];
            Object.keys(langLyrics).forEach(function (stanzaJsonKey) {
                if (!utils.isChorus(stanzaJsonKey)) {
                    stanzaKeys.push(stanzaJsonKey);
                    return;
                }

                // Find chorus. Only the 1st chorus is used, grand chorus is not catered for.
                if (!chorusJsonKey) {
                    chorusJsonKey = stanzaJsonKey;
                }
            });

            // Alternate between stanza and chorus
            lastStanzaKey = stanzaKeys[stanzaKeys.length - 1];
            stanzaKeys.forEach(function (stanzaJsonKey) {
                stanzaOrder.push(stanzaJsonKey);
                if (chorusJsonKey) { // not all songs have a chorus
                    stanzaOrder.push(chorusJsonKey);
                }
            });

            // Resolve stanza order based on stanzas for 1st language version found, assumes all languages are the same
            isDone = true;
        });

        return {
            lastStanzaKey: lastStanzaKey,
            order: stanzaOrder
        }
    };

    /**
     * Check if a stanza is a chorus
     *
     * @param {string} stanzaJsonKey - The JSON key for the stanza.
     * @returns {boolean} True if not a number.
     */
    self.isChorus = function (stanzaJsonKey) {
        return (isNumber(stanzaJsonKey) ? false : true); // Number.isInteger() doesn't seem to work well here
    };

    /**
     * Check if value is empty
     *
     * @public
     * @link https://github.com/zionsg/javascript/blob/master/isEmpty/isEmpty.js
     * @param {mixed} value
     * @returns {boolean}
     */
    self.isEmpty = function (value) {
        // (null == value) checks for both (null === value) and (undefined === value)
        // ('null' === value) is to cater for null in JSON cast to string "null"
        if (!value || null == value || 'null' === value) {
            return true;
        }

        // [] not considered empty, hence check length. Note that arrays are specialized objects.
        if (value instanceof Array) {
            return (0 === value.length);
        }

        // {} not considered empty, hence check number of keys
        if (value instanceof Object) {
            return (0 === Object.keys(value).length);
        }

        return false; // considered non-empty if cannot resolve
    };

    /**
     * Load external script at end of <bodu>
     *
     * @public
     * @param {string} path - Path to script.
     * @returns {void}
     */
    self.loadScript = function (path) {
        if (!path) {
            return;
        }

        let scriptElement = document.createElement('script');
        scriptElement.setAttribute('type', 'text/javascript');
        scriptElement.src = path;

        document.body.appendChild(scriptElement);
    };

    /**
     * Load external stylesheet at end of <head>
     *
     * @public
     * @param {string} path - Path to stylesheet.
     * @returns {void}
     */
    self.loadStylesheet = function (path) {
        if (!path) {
            return;
        }

        let linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'stylesheet');
        linkElement.href = path;

        document.querySelector('head').appendChild(linkElement);
    };

    /**
     * Read JSON file
     *
     * This must be run from a local/remote server due to CORS, i.e. the webpage using this function
     * is accessed via http:// or https:// but not file://.
     *
     * @public
     * @param {string} path - Path to JSON file. This must be a valid URL and not a relative path.
     * @param (function(object): void) callback - Callback to receive parsed JSON object from file or null.
     * @returns {void}
     */
    self.readJsonFile = function (path, callback) {
        let url = null;
        try {
            url = new URL(path);
        } catch (e) {
            console.log('Invalid url (do not use relative paths): ' + path);
            callback(null);
            return;
        }

        let req = new XMLHttpRequest();
        req.overrideMimeType('application/json');
        req.open('GET', url.href, true);
        req.onreadystatechange = function () {
            if (XMLHttpRequest.DONE === req.readyState && 200 === req.status) {
                let json = null;
                try {
                    json = JSON.parse(req.responseText);
                } catch (e) {
                    json = null;
                }

                callback(json);
            }
        }

        req.send(null);
    };

    /**
     * Simple string replacement function
     *
     * @public
     * @example sprintf('<img src="%s" class="%s" />', 'a.png', 'beta') => <img src="a.png" class="beta" />
     * @link https://github.com/zionsg/javascript/blob/master/sprintf/sprintf.js
     * @param {string} format - Use "%s" as placeholder.
     * @param {...string} arguments - Add as many arguments as there are %s after the format.
     * @returns {string}
     */
    self.sprintf = function (format) {
        format = format || '';

        for (var i = 1; i < arguments.length; i++) {
            format = format.replace(/%s/, arguments[i]);
        }

        return format;
    };

    /**
     * Convert text to variable name
     *
     * @public
     * @example " Hello World, 1-2_3. " => hello-world-1-2_3
     * @param {string} text
     * @returns {string}
     */
    self.textToVariableName = function (text) {
        return (text || '').toLowerCase().replace(/[^a-z0-9_\-\s]/gi, '').trim().replace(/\s/g, '-');
    };

    /**
     * Check if text is a number
     *
     * @private
     * @param {string} text
     * @returns {boolean} True for "123" and "123a" but false for "test".
     */
    function isNumber(text) {
        if (!text) { // ''.match() does not work
            return false;
        }

        return (text.match(/^\d+/) ? true : false); // check only the beginning
    }

    /**
     * Pad number
     *
     * @private
     * @param {string} num
     * @returns {string} 12 becomes "012", 1a becomes "001a", "test" remains as "test".
     */
    function padNum(num) {
        num = num.toString();
        let prefix = parseInt(num) + '';
        let suffix = num.substring(prefix.length);

        return prefix.padStart(3, '0') + suffix;
    }

    // Return public interface
    return self;
})();
