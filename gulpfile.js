var gulp        = require('gulp');
var plumber = require('gulp-plumber');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');
var karmaServer = require('karma').Server;

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {

    browserSync.init({
        server: "./app"
    });

    gulp.watch("app/scss/*.scss", ['sass']);
    gulp.watch("app/js/**/*.js", ['js']);
    gulp.watch("app/**/*.html").on('change', browserSync.reload);
    gulp.watch("app/**/*.hbs").on('change', browserSync.reload);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src("app/scss/*.scss")
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest("app/css"))
        .pipe(browserSync.stream());
});

// Stream updated JS into the browser
gulp.task('js', function() {
    return gulp.src("app/js/**/*.js")
        .pipe(browserSync.stream());
});

// Run tests (currently broken)
gulp.task('test', function (done) {
    new karmaServer({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('default', ['serve']);