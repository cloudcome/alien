'use strict';

var gulp = require('gulp');
var karma = require('gulp-karma');

var testFiles = [
    './examples/coolie.min.js',
    './test/utils/typeis.js'
];

gulp.task('test', function () {
    return gulp.src(testFiles)
        .pipe(karma({
            configFile: './karma.conf.js',
            action: 'run'
        }))
        .on('error', function (err) {
            throw err;
        });
});

//gulp.task('default');


//gulp.task('utils/typeis', function (done) {
//    karma.start({
//        configFile: __dirname + '/karma.conf.js',
//        singleRun: true,
//        browsers: ['PhantomJS'],
//        files: [
//            './examples/coolie.min.js',
//            {
//                pattern: './src/**/*.js',
//                included: false
//            },
//            './test/utils/typeis.js'
//        ],
//        preprocessors: {
//            './src/utils/typeis.js': ['coverage']
//        }
//    }, done);
//});
//
//gulp.task('utils/dato', function (done) {
//    karma.start({
//        configFile: __dirname + '/karma.conf.js',
//        singleRun: true,
//        browsers: ['PhantomJS'],
//        files: [
//            './examples/coolie.min.js',
//            {
//                pattern: './src/**/*.js',
//                included: false
//            },
//            './test/utils/dato.js'
//        ],
//        preprocessors: {
//            './src/utils/dato.js': ['coverage']
//        }
//    }, done);
//});
//
//gulp.task('utils/random', function (done) {
//    karma.start({
//        configFile: __dirname + '/karma.conf.js',
//        singleRun: true,
//        browsers: ['PhantomJS'],
//        files: [
//            './examples/coolie.min.js',
//            {
//                pattern: './src/**/*.js',
//                included: false
//            },
//            './test/utils/random.js'
//        ],
//        preprocessors: {
//            './src/utils/random.js': ['coverage']
//        }
//    }, done);
//});
//
//gulp.task('default', ['utils/typeis','utils/dato', 'utils/random']);
//
//
