// Load config.
const wctConfig = require('../wct.conf');

// Libraries.
const gulp = require('gulp');
const wct = require('web-component-tester').test;

// Test the built component.
gulp.task('test', () => {
  return wct(wctConfig);
});
