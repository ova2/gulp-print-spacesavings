var through = require("through2");
var gutil = require("gulp-util");
var prettyBytes = require('pretty-bytes');
var table = require('cli-table2');

module.exports.init = function () {
    "use strict";

    function init(file, encoding, callback) {
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

        // buffer original file size
        file.originalSize = file.contents.length;

        this.push(file);
        return callback();
    }

    return through.obj(init);
};

module.exports.print = function () {
    "use strict";

    var fileCount = 0;
    var totalOriginalSize = 0;
    var totalMinifiedSize = 0;
    var rows = [];

    function print(file, encoding, callback) {
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

        fileCount++;

        // calculate current space savings
        var minifiedSize = file.contents.length;
        var spaceSaving = 1 - minifiedSize / file.originalSize;
        spaceSaving = parseFloat(spaceSaving.toFixed(3)) + "%";

        // update total sizes
        totalOriginalSize = totalOriginalSize + file.originalSize;
        totalMinifiedSize = totalMinifiedSize + minifiedSize;

        // push a row into the table
        rows.push([file.relative, prettyBytes(file.originalSize), prettyBytes(minifiedSize), spaceSaving]);

        this.push(file);
        callback(null, file);
    }

    return through.obj(print, function (callback) {
        if (fileCount > 0) {
            // instantiate the table for printing sizes and space savings
            var sstable = new table({
                head: ['File', 'Original size', 'Minified size', 'Space savings'],
                colAligns: ['left', 'right', 'right', 'right'],
                style: {
                    head: ['cyan']
                }
            });

            // create the table rows
            var length = rows.length;
            for (var i = 0; i < length; i++) {
                sstable.push(rows[i]);
            }
            
            if (fileCount > 1) {
                // add footer with total sizes and space savings if there are more than one file
                var totalSpaceSaving = 1 - totalMinifiedSize / totalOriginalSize;
                totalSpaceSaving = parseFloat(totalSpaceSaving.toFixed(3)) + "%";
                sstable.push([
                    gutil.colors.cyan.bold('Total'),
                    gutil.colors.cyan.bold(prettyBytes(totalOriginalSize)),
                    gutil.colors.cyan.bold(prettyBytes(totalMinifiedSize)),
                    gutil.colors.cyan.bold(totalSpaceSaving)
                ]);
            }

            // print the whole table
            console.log(sstable.toString());
        }

        callback();
    });
};