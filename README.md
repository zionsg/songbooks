# Song Books

Transcription of song books in JSON.

The purpose of this project is to store a digital copy of the songbooks, separate data from presentation
and facilitate generation of webpages/slides.

## Schema
- See `schema/songbook.schema.json`, which is based on [JSON Schema](https://json-schema.org/).
- Sample songbook document: `data/songbook.example.json`.
- Quick reference: [Understanding JSON Schema](https://json-schema.org/understanding-json-schema/index.html).
- [JSON Schema Validator](https://www.jsonschemavalidator.net/) may be used to validate a JSON document against
  the JSON schema.

## Webpage
- Run `html/songbook.webpage.html` on a localhost or remote server. This is required as it will be reading in
  a JSON file.
- Pass the path of the JSON file for the songbook via the `data` query param,
  e.g. `http://localhost/songbooks/html/songbook.webpage.html?data=../data/songbook.example.json`.
