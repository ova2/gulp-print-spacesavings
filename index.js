var through = require("through2");
var gutil = require("gulp-util");

module.exports = function (param) {
    "use strict";

    if (!param) {
        throw new gutil.PluginError("gulp-print-spacesavings", "No param supplied");
    }

    function printSpaceSavings(file, encoding, callback) {
        /*jshint validthis:true*/
        
        // Do nothing if no contents
        if (file.isNull()) {
            this.push(file);
            return callback();
        }

        if (file.isStream()) {
            // accepting streams is optional
            this.emit("error", new gutil.PluginError("gulp-print-spacesavings", "Stream content is not supported"));
            return callback();
        }

        // check if file.contents is a `Buffer`
        if (file.isBuffer()) {
            file.contents = new Buffer(String(file.contents) + "\n" + param);

            this.push(file);
        }

        return callback();
    }

    return through.obj(printSpaceSavings);
};