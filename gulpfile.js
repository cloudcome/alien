'use strict';

var gulp = require('gulp');
var karma = require('karma').server;

var taskList = [
    'utils/allocation.js',
    'utils/calendar.js',
    'utils/dato.js',
    'utils/number.js',
    'utils/random.js',
    'utils/string.js',
    'utils/typeis.js'
];

taskList.forEach(function (task) {
    var preprocessors = {};

    preprocessors['./src/' + task] = ['coverage'];

    gulp.task(task, function (done) {
        karma.start({
            configFile: __dirname + '/karma.conf.js',
            singleRun: true,
            browsers: ['PhantomJS'],
            files: [
                './examples/coolie.min.js',
                {
                    pattern: './src/**/*.js',
                    included: false
                },
                './test/' + task
            ],
            preprocessors: preprocessors
        }, done);
    });
});

gulp.task('default', taskList);


