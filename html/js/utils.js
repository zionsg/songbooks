/**
 * Common utility functions wrapped using Module pattern
 *
 * Functions ordered in alphabetical order, public before private.
 * No support for Internet Explorer.
 *
 * For consistency, functions using record and key arguments should always
 * place the record as the 1st argument, e.g. getSongPrefix(data, key). This
 * makes it easier to add optional arguments - compare
 * fn(data, key1, key2, optional) versus fn(key1, key2, data, optional).
 * This also applies to inline scripts in webpages.
 */
const utils = (function () {
    /** @type {object} Self reference - all public properties/methods are stored here & returned as public interface. */
    const self = {
        // Common constants enumerated here, names to be all in caps, listed alphabetically
        COMMENTS: '//',
        LANG_EN: 'en',
        LANG_CN: 'cn',
    };

    /**
     * Parsed query params
     *
     * @private
     * @type {object} Key-value pairs.
     */
    let queryParams = null;

    /**
     * Parsed data from songbook JSON file
     *
     * @private
     * @type {object} As per readJsonFile().
     */
    let songbookData = null;

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
     * Get absolute url from relative url
     *
     * @public
     * @param {string} url - Relative url.
     * @returns {string}
     */
    self.getAbsoluteUrl = function (url) {
        // Convert url to absolute URL else `new URL()` will throw error
        // See https://stackoverflow.com/a/14781678
        let linkElement = document.createElement('a');
        linkElement.href = (url || window.location); // e.g. /api/test will be changed to https://example.com/api/test

        // # in url can cause issues hence remove them
        let fragmentPos = linkElement.href.indexOf('#');
        let href = (-1 === fragmentPos) ? linkElement.href : linkElement.href.substr(0, fragmentPos);

        return href;
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
        Object.keys(titles).forEach(function (lang) {
            if (self.LANG_EN === lang) {
                return;
            }

            let langTitle = titles[lang] || '';
            result += (langTitle ? separator + langTitle : '');
        });

        return result;
    };

    /**
     * Get transcribed language lyrics for a song
     *
     * @public
     * @param {object} song - Song data.
     * @returns {(null|object)} Lyrics indexed by languages. Other lyrics info like authors are
     *     omitted.
     */
    self.getLanguageLyrics = function (song) {
        let lyrics = (song && song.lyrics) || null;
        if (!lyrics) {
            return null;
        }

        let result = {};
        let infoKeys = [utils.COMMENTS, 'authors', 'translators', 'stanzaOrder'];
        let langKeys = Object.keys(lyrics).filter((key) => !infoKeys.includes(key));
        langKeys.forEach(function (lang) {
            if (lyrics[lang]) {
                result[lang] = lyrics[lang];
            }
        });

        return utils.isEmpty(result) ? null : result;
    };

    /**
     * Get language-specific title for section/song
     *
     * @public
     * @param {object} titles - Value for "titles" key in section/song, e.g. { "en":"A", "cn":"甲" }.
     * @param {string} jsonKey - JSON key for section/song. This is used for the English title if latter not set.
     * @param {string} language - Language as per self.LANG_* constants.
     * @returns {string} Defaults to English title if language-specific title does not exist.
     */
    self.getLanguageTitle = function (titles, jsonKey, language) {
        titles = titles || {};

        let result = titles[utils.LANG_EN] || jsonKey || '';
        Object.keys(titles).forEach(function (lang) {
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

    /*
     * Get value of query string param
     *
     * @public
     * @param {string} paramName - Name of querystring param.
     * @param {*} defaultValue - Value to use if param is not found.
     * @returns {*} Single value will be returned if param only has 1 value. Array will be returned
     *     if the param has multiple values, e.g. "?a=1&a=2" returns [1, 2] for param "a".
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
     * Get parsed data from songbook JSON file
     *
     * readJsonFile() must have been run first.
     *
     * @public
     * @returns {object} As per readJsonFile().
     */
    self.getSongbookData = function () {
        return songbookData;
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

        if (self.isNumber(key)) {
            filename += padNum(key);
        } else {
            filename += (filename ? '-' : '') + self.slugify(key);
        }

        return filename.toLowerCase();
    };

    /**
     * Get song prefix
     *
     * @public
     * @example Given book prefix "ABC", key "31" returns "ABC031",
     *     key "1a" returns "ABC001a", key "Some Example" returns "".
     * @param {object} data - Songbook data.
     * @param {string} key - JSON key for song.
     * @returns {string}
     */
    self.getSongPrefix = function (data, key) {
        let bookPrefix = data.bookPrefix || '';
        let songPrefix = self.isNumber(key) ? (bookPrefix + padNum(key)) : '';

        return songPrefix;
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
        let langLyrics = utils.getLanguageLyrics(song);
        let stanzaOrder = song?.lyrics?.stanzaOrder || [];
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
        Object.keys(langLyrics).forEach(function (lang) {
            let lyrics = langLyrics[lang] || null;
            if (isDone || self.isEmpty(lyrics)) {
                return;
            }

            // List stanza keys, find chorus key
            let chorusJsonKey = '';
            let stanzaKeys = [];
            Object.keys(lyrics).forEach(function (stanzaJsonKey) {
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
        };
    };

    /**
     * Check if a stanza is a chorus
     *
     * @param {string} stanzaJsonKey - The JSON key for the stanza.
     * @returns {boolean} True if not a number.
     */
    self.isChorus = function (stanzaJsonKey) {
        return (self.isNumber(stanzaJsonKey) ? false : true); // Number.isInteger() doesn't seem to work well here
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
     * Check if text is a number
     *
     * @public
     * @param {string} text
     * @returns {boolean} True for "123" and "123a" but false for "test".
     */
    self.isNumber = function (text) {
        if (!text) { // ''.match() does not work
            return false;
        }

        return (text.match(/^\d+/) ? true : false); // check only the beginning
    };

    /**
     * Load external script at end of <body>
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
     * Load JavaScript file for songbook based on query params and pass JSON contents to callback
     *
     * @public
     * @param {function(object,object): void} callback - Callback function that
     *     will take in (parsed query params, JSON contents for songbook) and
     *     returns void. The query params are used for all HTML webpages and
     *     are as follows (paths mentioned for properties are relative to root
     *     of repository):
     *     @property {string} book - Filename of JavaScript file (converted from JSON file) for
     *         songbook, without extension, e.g. "songbook-example" for dist/songbook-example.js.
     *         This is provided as a shortcut for data/css/js params. If specified,
     *         assets/hymns.css and assets/hymns.js will be used for the css and js params
     *         respectively.
     *     @property {string} css - Path to additional CSS file to load, before dynamic elements
     *         are rendered. If not specified, assets/hymns.css will be used.
     *     @property {string} data - Path to JavaScript file (converted from JSON file) for
     *         songbook. Must be an absolute url and not a relative path.
     *     @property {string} js - Path to additional JavaScript file to load, after dynamic
     *         elements are rendered. Must be an absolute url and not a relative path.
     *     @property {lang} lang - Language for lyrics as per self.LANG_* constants.
     *     @property {string} song - JSON key for song in songbook to use, e.g. "31", "Doxology".
     *     @property {boolean} useCurrentTimestamp - Whether to use current timestamp to millisecond
     *         precision instead of to the nearest hour when appending `version` query param to
     *         URLs for book/CSS/JS. The actual query param is `t`, using 0 for false, 1 for true.
     * @returns {void}
     */
    self.loadSongBook = function (callback) {
        let params = {
            book: utils.getQueryParam('book', ''),
            css: utils.getQueryParam('css', ''),
            data: utils.getQueryParam('data', ''),
            js: utils.getQueryParam('js', ''),
            lang: utils.getQueryParam('lang', self.LANG_EN),
            song: utils.getQueryParam('song', ''),
            useCurrentTimestamp: (1 === parseInt(utils.getQueryParam('t', '0'))),
        };
        if (params.book) {
            // Append current timestamp for cache busting
            let currTimestamp = (new Date()).toISOString();
            let version = params.useCurrentTimestamp
                ? `?ver=${currTimestamp}`
                : '?ver=' + currTimestamp.substring(0, 13) + ':00'; // nearest hour

            // Paths are relative to the webpage that embeds utils.js
            params.data = utils.getAbsoluteUrl('../dist/' + params.book + '.js' + version);
            params.css = utils.getAbsoluteUrl('../assets/hymns.css' + version);
            params.js = utils.getAbsoluteUrl('../assets/hymns.js' + version);
        }

        // Add event listener to receive contents of songbook before loading songbook file
        window.addEventListener('songbook.ready', (event) => {
            songbookData = event.detail.data;
            callback(params, event.detail.data);
        });

        // Load songbook file
        self.loadScript(params.data);
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
     * Simulate key press event
     *
     * @public
     * @param {string} key - Key to press, e.g. "e".
     * @returns {void}
     */
    self.pressKey = function (key) {
        window.dispatchEvent(new KeyboardEvent('keydown', { // "keypress" is deprecated
            key: key.toLowerCase(),
        }));
    };

    /**
     * Read JSON file for songbook
     *
     * This must be run from a local/remote server due to CORS, i.e. the webpage using this function
     * is accessed via http:// or https:// but not file://.
     *
     * The parsed JSON will be stored internally and can be retrieved via getSongbookData().
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
            console.log('Invalid url (do not use relative paths): ' + path); // eslint-disable-line no-console

            songbookData = null;
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

                songbookData = json; // save copy
                callback(json);
            }
        };

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
     * Slugify a string for use as a variable name
     *
     * @public
     * @example " Hello World, 1-2_3. " => hello-world-1-23
     * @link See https://www.ef.com/wwen/english-resources/english-grammar/hyphens-and-dashes on
     *     the difference between hyphens and dashes.
     * @param {string} string
     * @returns {string} String will be lowercased with spaces replaced by
     *     hyphens (by default), retaining only letters/digits/hyphens.
     */
    self.slugify = function (string) {
        return (string || '').toString().toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9\-]/g, '');
    };

    /**
     * Translate a string
     *
     * @public
     * @param {string} term - Term to be translated, typically in English.
     * @param {string} language - Language to translate term to, as per self.LANG_* constants.
     * @returns {string} Term will be returned with 1st letter capitalized if language is in English.
     */
    self.translate = function (term, language) {
        if (!term || language !== self.LANG_CN) {
            return self.capitalizeFirstLetter(term);
        }

        switch ((term || '').toString().toLowerCase()) {
            case 'chorus': {
                return '副歌';
            }
            case 'grand chorus': {
                return '总副歌';
            }
            case 'last': {
                return '终';
            }
            case 'stanza': {
                return '诗节'; // see https://baike.baidu.com/item/%E8%AF%97%E8%8A%82/11026733
            }
            default: {
                return term;
            }
        }
    };

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
