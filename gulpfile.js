/* eslint-env node */

const gulp = require('gulp');
const buildProcess = require('@catalyst-elements/build-process');

const buildConfig = buildProcess.getConfig({
  componenet: {
    name: 'catalyst-flip-button'
  },

  publish: {
    masterBranch: 'master',
    prereleaseBranchRegex: /^external-build-process$/g
  },

  src: {
    entrypoint: 'element.mjs',
    template: {
      markup: 'markup.html',
      style: 'style.scss'
    }
  }
});

for (const [taskName, taskFunction] of Object.entries(buildProcess.tasks)) {
  gulp.task(taskName, taskFunction(taskName, buildConfig));
}
