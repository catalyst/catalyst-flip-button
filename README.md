# &lt;catalyst-flip-button&gt;

`catalyst-flip-button` is a toggle button similar to [catalyst-toggle-button](https://gitlab.wgtn.cat-it.co.nz/rebeccastevens/catalyst-toggle-button).

For compatibility reasons, this element extends HTMLElement instead of CatalystToggleButton.
Because of this a lot of code in this repository is a duplicate of code from [catalyst-toggle-button](https://gitlab.wgtn.cat-it.co.nz/rebeccastevens/catalyst-toggle-button).

## Usage

Import the script for the web component on each page it is to be used on:

```html
<script src="dist/catalyst-flip-button.js"></script>
```

Then simply use it like any other tag:

```html
<catalyst-flip-button>My Button</catalyst-flip-button>
```

## Docs ans Demos

Docs and demos are available on [gitlab pages](http://rebeccastevens.pages.gitlab.wgtn.cat-it.co.nz/catalyst-flip-button/).

## Compatibility

**Not all browser have full support for web components yet.**

[WebComponentsJS](https://github.com/webcomponents/webcomponentsjs) is a set of polyfills that help fill that gap. [ShadyCSS](https://github.com/webcomponents/shadycss) is another polyfill that some browsers may need.

Install via npm:

```sh
npm install --save @webcomponents/webcomponentsjs @webcomponents/shadycss
```

Then include on each page (before importing the component's efinition):

```html
<script src="node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
<script src="node_modules/@webcomponents/shadycss/custom-style-interface.min.js"></script>
```

### ES5

For older browser that don't support ES6 JavaScript, an ES5 transpiled versions is available (`*.es5.min.js`).

To use this version, include it's script instead of the ES6 version and make sure each page that uses the component imports these scripts (before importing the component's definition):

```html
<script src="node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js"></script>
<script src="node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
<script src="node_modules/@webcomponents/shadycss/custom-style-interface.min.js"></script>
```

## Contributing

### Dependencies

Project dependencies are managed through [Yarn](https://yarnpkg.com/lang/en/docs/install/) (not npm).  
Install dependencies with:

```sh
yarn
```

Note: [Bower](https://bower.io/) only here because [web-component-tester](https://github.com/Polymer/web-component-tester) won't run from the command line without it.

### Building

[Gulp](https://gulpjs.com/) is used to build the source files (```./src```) into the distribution files (```./dist```).  
Build with:

```sh
npm run build
```

### Docs

Docs are build with [Polymer](https://www.polymer-project.org/), the [Polymer Build Tool](https://github.com/Polymer/polymer-build) and the [Polymer Analyzer](https://github.com/Polymer/polymer-analyzer).

Docs will automatically be update on gitlab pages according to the ```analysis.json``` file whenever a change is made to the master branch.
(Ideally the update should only happen when ```analysis.json``` is changed. [See here for details on this issue](https://gitlab.com/gitlab-org/gitlab-ce/issues/19232))

To update ```analysis.json``` run:

```sh
npm run analyze
```

Please note that current the demo files are not automatically included in ```analysis.json``` and the different builds of the component will also be analyzed. Manually edit ```analysis.json``` to add the demos and remove the extra information on the different builds.  (This should be automatic in the future.)

To build the docs manually:

```sh
npm run build-docs
```

## Testing

Testing is done using the [web-component-tester](https://github.com/Polymer/web-component-tester).

### Running Tests

#### On The Command Line

```sh
npm run tests
```

#### In The Browser

First start up a local server:

```sh
python -m SimpleHTTPServer 8000
```

Then visit http://0.0.0.0:8000/test/ to see the tests in action.
