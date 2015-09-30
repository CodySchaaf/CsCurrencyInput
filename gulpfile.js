var gulp   = require('gulp');
var tsc    = require('gulp-tsc');
var shell  = require('gulp-shell');
var runseq = require('run-sequence');
var tslint = require('gulp-tslint');
var concat = require('gulp-concat');
var rename = require('gulp-rename');

var runSequence = require('run-sequence');


var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var annotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');

var paths = {
  tscripts : { src : ['typings/tsd.d.ts', 'app/src/**/*.ts'],
    dest : 'app/build' }
};

gulp.task('default', ['lint', 'buildrun']);

gulp.task('clean', function (done) {
  require('del')([
    paths.tscripts.dest,
  ], done);
});

// ** Running ** //

gulp.task('run', shell.task([
  'node app/build/index.js'
]));

gulp.task('buildrun', function (cb) {
  runseq('build', 'run', cb);
});

// ** Watching ** //

gulp.task('watch', function () {
  gulp.watch(paths.tscripts.src, ['compile:typescript']);
});

gulp.task('watchrun', function () {
  gulp.watch(paths.tscripts.src, runseq('compile:typescript', 'run'));
});

// ** Compilation ** //

gulp.task('build', ['clean', 'compile:typescript']);
gulp.task('compile:typescript', function () {
  return gulp
    .src(paths.tscripts.src)
    .pipe(tsc({
      module: "commonjs",
      emitError: false
    }))
    .pipe(concat('index.js'))
    .pipe(gulp.dest(paths.tscripts.dest));
});

gulp.task('deploy', function (done) {
  runSequence('build', 'browserify', done)
});

gulp.task('browserify', function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './app/build/index.js',
    debug: true,
    // defining transforms here will avoid crashing your stream
    transform: []
  });
  //var bundler = browserify('./app/build/index.js');

  return b.bundle()
    .pipe(source('app/build/index.js'))
    .pipe(buffer())
    // Add transformation tasks to the pipeline here.
    .pipe(annotate())
    .pipe(uglify())
    .pipe(rename(function(path){ path.extname = ".min.js"}))
    .pipe(gulp.dest('.'));
});

// ** Linting ** //

gulp.task('lint', ['lint:default']);
gulp.task('lint:default', function(){
  return gulp.src(paths.tscripts.src)
    .pipe(tslint())
    .pipe(tslint.report('prose', {
      emitError: false
    }));
});
