const gulp = require('gulp'),
    merge = require('merge2'),
    runSequence = require('run-sequence'),
    del = require('del'),
    typescript = require('gulp-typescript'),
    tsconfig = require('./tsconfig.json'),
    sourcemaps = require('gulp-sourcemaps'),
    tslint = require('gulp-tslint'),
    less = require('gulp-less'),
    cleanCss = require('gulp-clean-css');

const paths = {
    root: '',
    css: '*.less',
    ts: ['*.ts', '!*.d.ts']
};

var build = function(complete) {
    var tasks = ['check-ts', 'copy-ts', 'copy-css'];

    if (complete) {
        runSequence(tasks, complete);
    } else {
        runSequence(tasks);
    }
};

gulp.task('copy-ts', function() {
    // Create TS declaration files.
    var tsResult = gulp.src(tsconfig.files, {
            base: './'
        })
        .pipe(sourcemaps.init())
        .pipe(typescript(tsconfig.compilerOptions));

    // Create sourcemaps.
    tsResult.js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.root));

    return merge([
        tsResult.dts.pipe(gulp.dest(paths.root)),
        tsResult.js.pipe(gulp.dest(paths.root))
    ]);
});

gulp.task('copy-css', function() {
    return gulp.src(paths.css)
        .pipe(less())
        .pipe(cleanCss())
        .pipe(gulp.dest(paths.root));
});

gulp.task('check-ts', function() {
    return gulp.src(paths.ts)
        .pipe(tslint())
        .pipe(tslint.report('verbose'));
});

gulp.task('build', function() {
    build();
});

gulp.task('start', function() {
    build(function() {
        // Watch CSS files.
        gulp.watch(paths.css, ['copy-css']);

        // Watch TS files.
        gulp.watch(paths.ts).on('change', function() {
            build();
        });
    });
});

gulp.task('default', ['start']);
