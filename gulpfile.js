var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var paths = {
  scripts: ['src/*'],
};

gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del(['build'], cb);
});

//gulp.task('scripts', ['clean'], function() {
gulp.task('scripts', [], function() {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src(paths.scripts)
  //.pipe(sourcemaps.init())
  .pipe(concat('phaser-tiled-extras.js'))
  .pipe(gulp.dest('build'))
  .pipe(uglify())
  .pipe(concat('phaser-tiled-extras.min.js'))
  //.pipe(sourcemaps.write())
  .pipe(gulp.dest('build'));
});

gulp.task('default', ['scripts']);
