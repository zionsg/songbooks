# Song Books

Transcription of song books in JSON.

The purpose of this project is to store a digital copy of the songbooks, separate data from presentation
and facilitate generation of webpages/slides.

Think of it as Mail Merge in Microsoft Word using a Word template with recipients from an Excel spreadsheet - if there
are any changes, just change these 2 files and run Mail Merge again, instead of changing 1000 manually typed out
Word documents.

## Schema
- See `schema/songbook.schema.json`, which is based on [JSON Schema](https://json-schema.org/).
- Sample songbook document: `data/songbook.example.json`.
- Quick reference: [Understanding JSON Schema](https://json-schema.org/understanding-json-schema/index.html).
- [JSON Schema Validator](https://www.jsonschemavalidator.net/) may be used to validate a JSON document against
  the JSON schema.

## Webpage
- Run `html/songbook.webpage.html` on a localhost or remote server. This is required as it will be reading in
  a JSON file, else there will be the error "Access to XMLHttpRequest at url from origin 'null' has been blocked by
  CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.".
- Pass the path of the JSON file for the songbook via the `data` query param (do NOT use relative paths), e.g.
  `http://localhost/songbooks/html/songbook.webpage.html?data=http://localhost/songbooks/data/songbook.example.json`.
- The webpage also takes in query params `css` and `js` for loading of an additional stylesheet and script
  respectively. See the top docblock in `html/songbook.webpage.html` for more details.

## Additional assets
- The files in the `assets` folder, especially `hymns.css` and `hymns.js`, are site-specific (not generic)
  and hence not put in the `html` folder. The MIDI files referenced in `hymns.js` are not stored in this repository.
