// Load config.
const config = require('./config.js');

// Libraries.
const gulp = require('gulp');
const Builder = require('polymer-build').PolymerProject;
const foreach = require('gulp-foreach');
const inject = require('gulp-inject');
const mergeStream = require('merge-stream');
const modifyFile = require('gulp-modify-file');
const named = require('vinyl-named');
const path = require('path');
const rename = require('gulp-rename');
const webpack = require('webpack');
const WebpackClosureCompilerPlugin = require('webpack-closure-compiler');
const webpackStream = require('webpack-stream');

// Clone all the dependencies needed for docs.
gulp.task(
  'docs-clone-dependencies',
  gulp.series(
    () => {
      // Clone all the modules.
      return gulp
        .src('./node_modules/**', { follow: true })
        .pipe(
          gulp.dest(`./${config.temp.path}/${config.docs.nodeModulesPath}`)
        );
    },
    () => {
      // Copy the docs index page - make sure it is named index.
      return gulp
        .src(`./${config.docs.indexPage}`)
        .pipe(
          rename({
            basename: 'index'
          })
        )
        .pipe(gulp.dest(`./${config.temp.path}`));
    },
    () => {
      // Copy over other dependencies.
      return gulp
        .src([
          `./${config.docs.importsImporterFilename}`,
          `./${config.docs.importsFilename}`,
          `./${config.docs.analysisFilename}`
        ])
        .pipe(gulp.dest(`./${config.temp.path}`));
    },
    () => {
      // Copy everything in dist
      return gulp
        .src(`./${config.dist.path}/**`)
        .pipe(
          gulp.dest(
            `./${config.temp.path}/${config.docs.nodeModulesPath}/${
              config.package.name
            }/`
          )
        );
    },
    () => {
      // Copy over the demos.
      return gulp
        .src(`./${config.demos.path}/**`, {
          base: './'
        })
        .pipe(
          gulp.dest(
            `./${config.temp.path}/${config.docs.nodeModulesPath}/${
              config.package.name
            }/`
          )
        );
    }
  )
);

// Update analysis.
gulp.task(
  'docs-update-analysis',
  gulp.series(() => {
    return gulp
      .src(`./${config.temp.path}/${config.docs.analysisFilename}`, {
        base: './'
      })
      .pipe(
        modifyFile(content => {
          const analysis = JSON.parse(content);
          if (analysis.elements) {
            for (let i = 0; i < analysis.elements.length; i++) {
              if (analysis.elements[i].demos) {
                for (let j = 0; j < analysis.elements[i].demos.length; j++) {
                  analysis.elements[i].demos[j].url = `${
                    config.docs.nodeModulesPath
                  }/${config.package.name}/${
                    analysis.elements[i].demos[j].url
                  }`;
                }
              }
            }
          }
          return JSON.stringify(analysis);
        })
      )
      .pipe(gulp.dest('./'));
  })
);

// Build the docs index.
gulp.task(
  'docs-build-index',
  gulp.series(
    () => {
      return (
        gulp
          .src(`./${config.temp.path}/index.html`, { base: './' })

          // The file specified here don't matter but exactly one is needed.
          .pipe(
            inject(gulp.src('./gulpfile.js', { base: './', read: false }), {
              starttag: '<!-- [[inject:custom-elements-es5-adapter]] -->',
              endtag: '<!-- [[endinject]] -->',
              removeTags: true,
              transform: () =>
                '<script src="../../@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js"></script>'
            })
          )
          .pipe(gulp.dest('./'))
      );
    },
    () => {
      return gulp
        .src(`./${config.temp.path}/index.html`, { base: './' })
        .pipe(
          modifyFile(content => {
            let moddedContent = content;
            moddedContent = moddedContent.replace(
              /\.\.\/\.\.\//g,
              `./${config.docs.nodeModulesPath}/`
            );
            return moddedContent.replace(/<script type="module"/g, '<script');
          })
        )
        .pipe(gulp.dest('./'));
    }
  )
);

// Build the docs imports.
gulp.task(
  'docs-build-imports',
  gulp.series(
    () => {
      return gulp
        .src(`./${config.temp.path}/${config.docs.importsFilename}`, {
          base: './'
        })
        .pipe(
          modifyFile(content => {
            return content.replace(
              /\.\.\/\.\.\//g,
              `./${config.docs.nodeModulesPath}/`
            );
          })
        )
        .pipe(gulp.dest('./'));
    },
    () => {
      const docsImportsBaseName = path.basename(
        config.docs.importsFilename,
        '.js'
      );

      return gulp
        .src(`./${config.temp.path}/${config.docs.importsImporterFilename}`, {
          base: config.temp.path
        })
        .pipe(named())
        .pipe(
          webpackStream(
            {
              target: 'web',
              mode: 'none',
              output: {
                chunkFilename: `${docsImportsBaseName}.[id].js`,
                filename: `${config.docs.importsImporterFilename}`
              },
              plugins: [
                new WebpackClosureCompilerPlugin({
                  compiler: {
                    language_in: 'ECMASCRIPT_NEXT',
                    language_out: 'ECMASCRIPT5',
                    compilation_level: 'SIMPLE',
                    assume_function_wrapper: true,
                    output_wrapper: '(function(){%output%}).call(this)'
                  }
                })
              ]
            },
            webpack
          )
        )
        .pipe(
          foreach((stream, file) => {
            return stream
              .pipe(
                modifyFile(content => {
                  return content.replace(/\\\\\$/g, '$');
                })
              )
              .pipe(
                rename({
                  basename: path.basename(file.path, '.js')
                })
              )
              .pipe(gulp.dest(`./${config.temp.path}`));
          })
        );
    }
  )
);

// Build the demos.
gulp.task(
  'docs-build-demos',
  gulp.series(
    () => {
      return gulp
        .src(
          `./${config.temp.path}/${config.docs.nodeModulesPath}/${
            config.package.name
          }/${config.demos.path}/**/*.html`,
          { base: './' }
        )
        .pipe(
          foreach((stream, file) => {
            const relPath = path.relative(
              path.join(file.cwd, file.base),
              file.path
            );
            const dir = path.dirname(relPath);

            const es5AdapterSrc = path.relative(
              dir,
              `./${config.temp.path}/${
                config.docs.nodeModulesPath
              }/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js`
            );
            return (
              stream

                // The file specified here don't matter but exactly one is needed.
                .pipe(
                  inject(
                    gulp.src('./gulpfile.js', { base: './', read: false }),
                    {
                      starttag:
                        '<!-- [[inject:custom-elements-es5-adapter]] -->',
                      endtag: '<!-- [[endinject]] -->',
                      removeTags: true,
                      transform: () =>
                        `<script src="${es5AdapterSrc}"></script>`
                    }
                  )
                )
                .pipe(gulp.dest('./'))
            );
          })
        );
    },
    () => {
      return gulp
        .src(
          `./${config.temp.path}/${config.docs.nodeModulesPath}/${
            config.package.name
          }/${config.demos.path}/*.html`,
          { base: './' }
        )
        .pipe(
          modifyFile(content => {
            return content.replace(/<script type="module"/g, '<script');
          })
        )
        .pipe(gulp.dest('./'));
    },
    () => {
      return gulp
        .src(
          `./${config.temp.path}/${config.docs.nodeModulesPath}/${
            config.package.name
          }/${config.demos.path}/*.js`,
          { base: './' }
        )
        .pipe(
          modifyFile(content => {
            return content.replace(
              new RegExp(
                `${config.element.tag}/${config.dist.path}/${
                  config.element.tag
                }.js`,
                'g'
              ),
              `${config.element.tag}/${config.element.tag}.js`
            );
          })
        )
        .pipe(gulp.dest('./'));
    }
  )
);

// Build the imports for each demo.
gulp.task('docs-build-demo-imports', () => {
  const demoImportsBaseName = path.basename(
    config.demos.importsFilename,
    '.js'
  );

  return gulp
    .src(
      `${config.temp.path}/${config.docs.nodeModulesPath}/${
        config.element.scope
      }/*/${config.demos.path}/${config.demos.importsImporterFilename}`
    )
    .pipe(
      foreach((importerStream, importerFile) => {
        const output = path.dirname(importerFile.path);
        return importerStream
          .pipe(
            webpackStream(
              {
                target: 'web',
                mode: 'none',
                output: {
                  chunkFilename: `${demoImportsBaseName}.[id].js`,
                  filename: `${config.demos.importsImporterFilename}`
                },
                plugins: [
                  new WebpackClosureCompilerPlugin({
                    compiler: {
                      language_in: 'ECMASCRIPT_NEXT',
                      language_out: 'ECMASCRIPT5',
                      compilation_level: 'SIMPLE',
                      assume_function_wrapper: true,
                      output_wrapper: '(function(){%output%}).call(this)'
                    }
                  })
                ]
              },
              webpack
            )
          )
          .pipe(
            foreach((wpStream, wpFile) => {
              return wpStream
                .pipe(
                  modifyFile(content => {
                    return content.replace(/\\\\\$/g, '$');
                  })
                )
                .pipe(
                  rename({
                    basename: path.basename(wpFile.path, '.js')
                  })
                )
                .pipe(gulp.dest(output));
            })
          );
      })
    );
});

// Generate the docs.
gulp.task('docs-generate', () => {
  const docsImportsBaseName = path.basename(config.docs.importsFilename, '.js');

  const buildConfig = {
    root: `${config.temp.path}/`,
    entrypoint: 'index.html',
    fragments: [],
    sources: [`${config.docs.nodeModulesPath}/${config.element.scope}/**`],
    extraDependencies: [
      `${
        config.docs.nodeModulesPath
      }/@webcomponents/webcomponentsjs/[!gulpfile]*.js`,
      `${config.docs.nodeModulesPath}/@webcomponents/shadycss/[!gulpfile]*.js`,
      `${config.docs.importsImporterFilename}`,
      `${docsImportsBaseName}.*.js`,
      `${config.docs.analysisFilename}`
    ],
    builds: [
      {
        name: 'docs',

        // Disable these settings as they are either not wanted or handled elsewhere.
        bundle: false,
        js: { compile: false, minify: false },
        css: { minify: false },
        html: { minify: false },
        addServiceWorker: false,
        addPushManifest: false,
        insertPrefetchLinks: false
      }
    ]
  };

  const docBuilder = new Builder(buildConfig);

  return mergeStream(docBuilder.sources(), docBuilder.dependencies())
    .pipe(
      rename(filepath => {
        if (filepath.dirname === config.temp.path) {
          filepath.dirname = './';
        } else {
          const prefix = path.normalize(`${config.temp.path}/`);
          if (filepath.dirname.indexOf(prefix) === 0) {
            filepath.dirname = filepath.dirname.substring(prefix.length);
          }
        }
      })
    )
    .pipe(gulp.dest(`./${config.docs.path}`));
});

// Build the docs.
gulp.task(
  'build-docs',
  gulp.series(
    'clean-docs',
    'docs-clone-dependencies',
    'docs-update-analysis',
    'docs-build-index',
    'docs-build-imports',
    'docs-build-demos',
    'docs-build-demo-imports',
    'docs-generate',
    'clean-tmp'
  )
);
