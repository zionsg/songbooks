// Generated at 2022-06-05T10:20:15+00:00 - https://github.com/zionsg/songbooks
(function () { window.dispatchEvent(new CustomEvent('songbook.ready', { detail: { data: 
{
  "//": [
    "JSON consists of key-value pairs. Keys are always strings. Values can be strings/arrays/objects. Don't mix types.",
    "Keys using // are treated as comments. The value is an array of 1 or more strings.",
    "If a key can have 1 or more values, the value will be of array type for consistency's sake.",
    "Keys may be omitted for sake of brevity.",
    "bookPrefix is short prefix used for referring to songs in book, e.g if prefix is ABC, ABC001 refers to 1st song.",
    "Titles and lyrics use en and cn keys to store English and Chinese language versions respectively.",
    "Try to cap line lengths to 100 characters (120 for comments) as much as possible to reduce horizontal scrolling."
  ],
  "json": {
    "source": "https://github.com/zionsg/songbooks/blob/master/data/songbook-example.json",
    "schema": "https://github.com/zionsg/songbooks/blob/master/data/songbook.schema.json"
  },
  "bookPrefix": "ABC",
  "title": {
    "en": "SongBook Title",
    "cn": "歌本书名"
  },
  "copyright": "Copyright for songbook",
  "sections": {
    "//": [
      "A section contains a title and a song list.",
      "A section can contain subsections which in turn have their own titles and song lists.",
      "If the title for a section is not specified for a language or is empty, eg. for en key, its JSON key is used.",
      "A song list consists of arrays of songs. If an array contains exactly 2 values, it means from song1 to song2.",
      "If an array in the song list contains 3 or more values, it means song1, song2, song3, etc. If 1 value, song1.",
      "Note that JSON keys of sections/songs are case-sensitive."
    ],
    "Front Cover": {
      "title": {
        "cn": "封面"
      },
      "songList": [
        [
          "songOnFrontCover01",
          "songOnFrontCover02",
          "songOnFrontCover03"
        ]
      ]
    },
    "Broad Category 01": {
      "title": {
        "cn": "大类一"
      },
      "subsections": {
        "Topic A": {
          "title": {
            "cn": "甲主题"
          },
          "songList": [
            [
              "1",
              "10"
            ],
            [
              "songOnBackCover01"
            ]
          ]
        }
      }
    }
  },
  "songs": {
    "//": [
      "Songs are indexed by the number alone, to make it easier to reference in song lists.",
      "The exceptions are those songs without numbers, typically those on the front and back covers of the songbook.",
      "Note that JSON keys of songs are case-sensitive.",
      "If the title for a song is not specified for a language or is empty, eg. for en key, its JSON key is used.",
      "If a song has 2 versions (e.g. Tune 1 & Tune 2), use letter suffixes for JSON key, (26a & 26b, not 26-1 & 26-2.",
      "If a song is replaced in a reprint, use letter suffixes for JSON key, e.g. 26 (original) & 26a (new).",
      "Key/time signatures are arrays as some songs may switch halfway.",
      "Lyrics contain language-specific versions.",
      "Each language-specific version of the lyrics contains stanzas and/or choruses (treated as a type of stanza).",
      "Each stanza/chorus is an array of strings, each string is a sentence, typically ended by an ending punctuation.",
      "Order in which stanzas are sung can be specified by lyrics.stanzaOrder, especially if there is a grand chorus.",
      "If stanzaOrder is not specified, it alternates btw stanza and chorus, e.g. [1, chorus, 2, chorus, etc.].",
      "Assume each stanza/chorus is to fit in 1 presentation slide, at 30pt/40px font size, viewed from 10m away."
    ],
    "songOnFrontCover01": {
      "title": {
        "en": "Theme Song"
      },
      "music": {
        "keySignature": [
          "Db",
          "E"
        ],
        "timeSignature": [
          "4/4",
          "6/8"
        ]
      },
      "lyrics": {
        "en": {
          "1": [
            "Hello World!",
            "Sentence capped at 100 chars line length w/indent fits 1920x1080 screen at 40px Arial."
          ]
        }
      }
    },
    "1": {
      "title": {
        "en": "Song 01",
        "cn": "歌曲一"
      },
      "music": {
        "composers": [
          "Composer A"
        ],
        "arrangers": [
          "Arranger B"
        ],
        "tune": "Lullaby",
        "keySignature": [
          "C"
        ],
        "timeSignature": [
          "4/4"
        ]
      },
      "lyrics": {
        "authors": [
          "Author C"
        ],
        "translators": [
          "Translator D"
        ],
        "stanzaOrder": [
          "chorus",
          "1"
        ],
        "en": {
          "1": [
            "Sentence 01",
            "Sentence 02"
          ],
          "chorus": [
            "Refrain line 01",
            "Refrain line 02"
          ]
        },
        "cn": {
          "1": [
            "第一句",
            "第二句"
          ],
          "chorus": [
            "副歌第一行",
            "副歌第而行"
          ]
        }
      },
      "notes": [
        "Same tune: ABC025, DEF001."
      ]
    }
  }
}
}}));
})();
