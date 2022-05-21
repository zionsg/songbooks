# Song Books

Transcription of song books in JSON.

The purpose of this project is to store a digital copy of the songbooks, separate data from
presentation and facilitate generation of webpages/slides.

Think of it as Mail Merge in Microsoft Word using a Word template with recipients from an Excel
spreadsheet - if there are any changes, just change these 2 files and run Mail Merge again, instead
of changing 1000 manually typed out Word documents.

## Schema
- References:
    + [Understanding JSON Schema](https://json-schema.org/understanding-json-schema/index.html).
    + [JSON Schema Validator](https://www.jsonschemavalidator.net/).
- See `data/songbook.schema.json`, which is based on [JSON Schema](https://json-schema.org/).
- Sample songbook document: `data/songbook-example.json`.

## Usage
- Clone this repository or download the zip file.
- Open `html/songbook.webpage.html` in the browser. This can be run offline without Internet
  connection except that the links to play/stop the MIDI files will not work.
- Pass the name of the songbook via the `book` query param to load the songbook, e.g.
  `file:///C:/Users/Me/Downloads/songbooks/html/songbook.webpage.html?book=songbook-example`. This
  loads the JavaScript file `dist/songbook-example.js` converted from `data/songbook-example.json`
  to allow easier embedding in webpages without worrying about CORS issues, else the webpages
  must be hosted on a localhost/remote server and cannot be run offline.
- The webpage also takes in query params `css` and `js` for loading of an additional stylesheet and
  script respectively. See the top docblock in `html/songbook.webpage.html` for more details.

## Additional assets
- The files in the `assets` folder, especially `hymns.css` and `hymns.js`, are site-specific (not
  generic) and hence not put in the `html` folder. The MIDI files referenced in `hymns.js` are not
  stored in this repository.
- The `.js` files in the `dist` folder are generated from the `.json` files in the `data` folder,
  using `bin/json2js.sh`, for easier embedding in webpages without worrying about CORS.
