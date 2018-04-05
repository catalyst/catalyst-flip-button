/* eslint-env node */

const gulp = require('gulp');
const buildProcess = require('@catalyst-elements/build-process');

buildProcess.setConfig('./package.json', {
  componenet: {
    name: 'catalyst-flip-button'
  },

  src: {
    entrypoint: 'element.mjs',
    template: {
      html: 'template.html',
      css: 'style.css'
    }
  }
});

for (const [taskName, taskFunction] of Object.entries(buildProcess.tasks)) {
  gulp.task(taskName, taskFunction(gulp));
}
