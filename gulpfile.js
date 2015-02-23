// My first try at Gulp, just a bunch och copy-paste-stuff that seems to work...

var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var paths = {
  scripts: ['src/*'],
  triggers: ['src/triggers-plugin/*','src/triggers.js']
};

gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del(['build'], cb);
});

//gulp.task('scripts', ['clean'], function() {
gulp.task('tiled-extras-plugin', [], function() {
  // Minify and copy all JavaScript
  return gulp.src(paths.scripts)
  .pipe(concat('phaser-tiled-extras.js'))
  .pipe(gulp.dest('build'))
  .pipe(uglify())
  .pipe(concat('phaser-tiled-extras.min.js'))
  .pipe(gulp.dest('build'));
});

gulp.task('triggers-plugin', [], function() {
    // Minify and copy all JavaScript
    return gulp.src(paths.triggers)
    .pipe(concat('phaser-tiled-extras-triggers.js'))
    .pipe(gulp.dest('build'))
    .pipe(uglify())
    .pipe(concat('phaser-tiled-extras-triggers.min.js'))
    .pipe(gulp.dest('build'));
});

gulp.task('default', ['tiled-extras-plugin', 'triggers-plugin']);
