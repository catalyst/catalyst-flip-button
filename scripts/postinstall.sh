#!/bin/bash
gulp=node_modules/gulp/bin/gulp.js

# Only run if not in node_modules.
if [ \"${PWD##*/}\" != node_modules ]
then
  # Fix dependency tree
  node $gulp fix-dependency-tree

  # Create bower_components symlink.
  ln -sf ./node_modules/@bower_components ./bower_components
fi
