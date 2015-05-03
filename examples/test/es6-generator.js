function co(GeneratorFunction) {
    return new Promise(function (resolve, reject) {
        var gen = GeneratorFunction();
        var err;
        var ret;
        var next = function () {
            if (err) {
                return reject(err);
            }

            var yielded = gen.next(ret);

            if (yielded.done) {
                return resolve(yielded.value);
            }

            try {
                yielded.value(function (_err, _ret) {
                    err = _err;
                    ret = _ret;
                    next();
                });
            } catch (err) {
                reject(err);
            }
        };

        next();
    });
}

var fs = require('fs');
var path = require('path');

var readFileSize = function (file, callback) {
    var p = path.join(__dirname, file);

    fs.stat(p, function (err, stat) {
        setTimeout(function () {
            callback(err, stat && stat.size);
        }, 100 + Math.random() * 1000);
    });
};

var readFileSize2 = function (file) {
    return function (callback) {
        readFileSize(file, callback);
    };
};


function* FileSize() {
    var s1 = yield readFileSize2('./es6-generator.js');
    var s2 = yield readFileSize2('./es6-generator.html');

    return [s1, s2];
}

co(FileSize).then(function (ret) {
    console.log('\nthen:');
    console.log(ret);
}).catch(function (err) {
    console.log('\ncatch:');
    console.log(err);
});
