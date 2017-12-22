#!/bin/bash
gulp=node_modules/gulp/bin/gulp.js

# Only fix dependency tree if not in node_modules.
if [ \"${PWD##*/}\" != node_modules ]
then
  node $gulp fix-dependency-tree
fi
