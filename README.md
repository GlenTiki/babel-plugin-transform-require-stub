# babel-plugin-transform-require-stub

Started as a fork of babel-plugin-transform-require-ignore

Ever wanted to test Webpacked frontend code... without webpack?

Well this lets you do just that, by stubbing out required files with specified extensions in your code, to achieve creating stubs where a webpack loader would be called.

## Installation

```sh
  npm install --save-dev babel-plugin-transform-require-stub
```

## Usage

Add the plugin to your .babelrc or package.json with a config like so:

```json
{
  "plugins": [
    [
      "babel-plugin-transform-require-stub",
      {
        "extensions": [
          ".png", ".sass", ".styl"
        ],
        // this is used if there is no ".ext" property on the options object
        "defaultStub": {
          // replaces with the require path with the path supplied here to a stub, so require("./style$SOME_EXT_DEFINED_ABOVE") becomes require("$ABSOLUTE_PATH_TO_FILE")
          "file": "./fileToStub"
        },
        ".sass": {
          // replaces the require call with just the path string, so `require("./style.sass")` becomes just `"./style.sass"`
          "path": true
        },
        ".styl": {
          // value can be any valid json (string literal, number literal, boolean literal, null literal, object literal, or array literal)
          // the value is then inserted into the code where the require call is matched
          // eg require('styles.styl') would become { something: "here" }
          "value": {
            "something": "here"
          }
        }
      }
    ]
  ]
}
```

## License

MIT
