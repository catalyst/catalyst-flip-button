# &lt;catalyst-flip-button&gt;

[Live Demo ↗](http://catalystelements.pages.gitlab.wgtn.cat-it.co.nz/CatalystElements/#/elements/catalyst-flip-button/demos/es6-component-demo)
|
[API documentation ↗](http://catalystelements.pages.gitlab.wgtn.cat-it.co.nz/CatalystElements/#/elements/catalyst-flip-button)

`<catalyst-flip-button>` is a wrapper for a `select` element. It displays as a button and flips between different options.

Also see [catalyst-toggle-button](https://gitlab.wgtn.cat-it.co.nz/CatalystElements/catalyst-toggle-button).

## Getting Started

Import the component's definition on each page it is to be used on:

```html
<script src="dist/catalyst-flip-button.js"></script>
```

Then simply use it like any other tag:

```html
<catalyst-flip-button>
  <select>
    <option>Apples</option>
    <option>Banana</option>
    <option>Carrot</option>
    <option>Duck</option>
  </select>
</catalyst-flip-button>
```

## Browser Compatibility

See details on the wiki: [Catalyst Elements - Browser Compatibility](https://wiki.wgtn.cat-it.co.nz/wiki/Catalyst_Elements#Browser_Compatibility)

## Contributions

Contributions are most welcome.

Please read our [contribution guidelines](./CONTRIBUTING.md).

## Dependencies

Project dependencies are managed through [Yarn](https://yarnpkg.com/lang/en/docs/install/) (not npm directly).

Install dependencies with:

```sh
yarn install
```

## Building

The build process will create the following versions of the component in the distribution folder (`./dist`):

* an es6 version
* an es6 minified version
* an es5 minified version

The partials (`./src/partials/`) will be inserted into the correct place within these versions.

[Gulp](https://gulpjs.com/) is used to run the build process.  
Build script: `./gulpfile.js`

Build with:

```sh
yarn run build
```

## Coding Style

This project uses [ESLint](http://eslint.org/) to lint JavaScript and [Sass Lint](https://github.com/sasstools/sass-lint) to lint Sass.

To test if your code is compliant, run:

```sh
yarn run lint
```

## Docs

Docs are build with [Polymer](https://www.polymer-project.org/), the [Polymer Build Tool](https://github.com/Polymer/polymer-build) and the [Polymer Analyzer](https://github.com/Polymer/polymer-analyzer).

Docs will automatically be update on GitLab pages whenever a change is pushed to the master branch.

To build the docs locally, first run the analyzer which will update `./analysis.json`. The docs are then built from this file.

```sh
yarn run analyze
yarn run build-docs
```

The docs will be located under `./docs/`.

In order to view the docs in a web browser, the files need to be served from a web server (they cannot be open using the `file:///` protocall).

## Testing

Testing is done using the [web-component-tester](https://github.com/Polymer/web-component-tester).

### Running Tests On The Command Line

```sh
yarn run test
```

### Running Tests In The Browser

First start up a local server:

```sh
python -m SimpleHTTPServer 8000
```

Then visit http://0.0.0.0:8000/test/ to see the tests in action.
