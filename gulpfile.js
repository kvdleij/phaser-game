const gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefix = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    sasslint = require('gulp-sass-lint'),
    browserSync = require('browser-sync').create(),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename');

const files = {
    sass: {
        source: ['./src/**/*.scss'],
        dest: './src/assets/css'
    },
    js: {
        source: ['./src/assets/**/*.js', './src/atlas-creator/*.js', '!./src/assets/scripts/*.js'],
        dest: './src/assets/scripts'
    },
    html: {
        source: ['./**/*.html', './**/*.html']
    }
};

// Task for overall styles
gulp.task('styles', function () {
    gulp.src(files.sass.source)
        .pipe(sourcemaps.init())
        .pipe(sasslint({'config': './sass-lint.yml'}))
        .pipe(sasslint.format())
        .pipe(sass({
            errLogToConsole: true,
            outputStyle: 'expanded'
        }))
        .pipe(autoprefix({
            browsers: ['last 4 versions']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(files.sass.dest));

    // .min version
    gulp.src(files.sass.source)
        .pipe(sass({
            errLogToConsole: true,
            outputStyle: 'compressed'
        }))
        .pipe(autoprefix({
            browsers: ['last 4 versions']
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(files.sass.dest)
            .on('end', function () {
                // finished
                browserSync.reload();
            })
        );
});

// Task for scripts
gulp.task('scripts', () => {
    gulp.src(files.js.source)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('scripts.js'))
        .pipe(rename({}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(files.js.dest));

    // .min version
    gulp.src(files.js.source)
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(files.js.dest));
});

gulp.task('watch', ['styles', 'scripts'], function () {
    let bsFiles = [
        files.sass.source,
        files.js.source,
        './**/*.php',
        './**/*.html'
    ];

    browserSync.init(bsFiles, {
        proxy: "http://phaser-game.local/",
        notify: true
    });

    // Compile overall styles
    gulp.watch(files.sass.source, ['styles']).on('change', browserSync.reload);

    // Compile scripts
    gulp.watch(files.js.source, ['scripts']).on('change', browserSync.reload);
});

// Build everything
gulp.task('default', ['styles', 'scripts']);