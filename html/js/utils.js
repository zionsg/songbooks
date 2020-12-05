/**
 * Common utility functions wrapped using Module pattern
 * Functions ordered in alphabetical order, public before private.
 *
 * @link https://github.com/zionsg/songbooks/blob/master/html/js/utils.js
 */
const utils = (function () {
    /**
     * Self reference - all public vars/methods will be stored in here and returned as public interface
     *
     * @public This is considered public as it will be returned as the public interface at the end.
     * @type {object}
     */
    const self = {};

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
     * @private
     * @param {string} text
     * @returns {string}
     */
    self.capitalizeFirstLetter = function (text) {
        return (text[0].toUpperCase() + text.slice(1));
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
     * Read JSON file
     *
     * This must be run from a local/remote server due to CORS, i.e. the webpage using this function
     * is accessed via http:// or https:// but not file://.
     *
     * @public
     * @param {string} path - Path to JSON file.
     * @param (function(object): void) callback - Callback to receive parsed JSON object from file or null.
     * @returns {void}
     */
    self.readJsonFile = function (path, callback) {
        let req = new XMLHttpRequest();
        req.overrideMimeType('application/json');
        req.open('GET', path, true);
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

    // Return public interface
    return self;
})();
