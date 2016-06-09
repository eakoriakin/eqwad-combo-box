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
    source: {
        css: '*.less',
        js: '*.ts'
    },
    build: {
        root: 'build',
        css: 'build',
        js: 'build'
    }
};

var build = function() {
    runSequence('clean', ['check-js', 'copy-js', 'copy-css']);
};

gulp.task('clean', function() {
    del.sync([paths.build.root + '/**', '!' + paths.build.root]);
});

gulp.task('copy-js', function() {
    // Create JS files TS declaration files.
    var tsResult = gulp.src(tsconfig.files, {
            base: './'
        })
        .pipe(sourcemaps.init())
        .pipe(typescript(tsconfig.compilerOptions));

    // Create sourcemaps.
    tsResult.js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.build.js));

    return merge([
        tsResult.dts.pipe(gulp.dest(paths.build.js)),
        tsResult.js.pipe(gulp.dest(paths.build.js))
    ]);
});

gulp.task('copy-css', function() {
    return gulp.src(paths.source.css)
        .pipe(less())
        .pipe(cleanCss())
        .pipe(gulp.dest(paths.build.css));
});

gulp.task('check-js', function() {
    return gulp.src(paths.source.js)
        .pipe(tslint())
        .pipe(tslint.report('verbose'));
});

gulp.task('build', function() {
    build();
});

gulp.task('start', ['build'], function() {
    // Watch CSS files.
    gulp.watch(paths.source.css, ['copy-css']);

    // Watch JS files.
    gulp.watch(paths.source.js).on('change', function() {
        build();
    });
});

gulp.task('default', ['start']);
