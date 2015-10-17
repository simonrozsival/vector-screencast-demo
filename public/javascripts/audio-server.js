/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var AudioRecording_1 = __webpack_require__(7);
	// init the server
	var server = new AudioRecording_1['default']({
	    hostName: 'localhost',
	    port: 4000,
	    path: '/',
	    outputDir: './public/recordings',
	    formats: ['mp3'],
	    deleteWav: true
	});
	// start listening for clients
	server.Start();

/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__dirname) {/// <reference path='../typings/node/node.d.ts' />
	/// <reference path='./node-libs.d.ts' />
	'use strict';
	
	var ws_1 = __webpack_require__(8);
	var wav_1 = __webpack_require__(9);
	var fs = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"fs\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	var node_uuid_1 = __webpack_require__(10);
	var colors_1 = __webpack_require__(11);
	var AudioConvertor_1 = __webpack_require__(12);
	var Server = (function () {
	    function Server(cfg) {
	        this.cfg = cfg;
	        // default settings if needed
	        if (!cfg.port) cfg.port = 45678;
	        if (!cfg.outputDir) cfg.outputDir = __dirname;
	        if (!cfg.formats) cfg.formats = ['mp3', 'ogg'];
	        this.config = cfg;
	    }
	    Server.prototype.Start = function () {
	        var _this = this;
	        // init binary server
	        this.server = new ws_1.WebSocketServer({
	            port: this.config.port
	        });
	        if (this.server) {
	            console.log(colors_1.colors.yellow("Audio recorder is running and listening on port " + this.config.port));
	        } else {
	            console.log(colors_1.colors.red('Audio recorder could not be started.'));
	        }
	        this.server.on('connection', function (socket) {
	            return _this.HandleClient(socket);
	        });
	        this.server.on('error', function (error) {
	            return console.log("ERROR: " + error);
	        });
	    };
	    Server.prototype.HandleClient = function (socket) {
	        var _this = this;
	        try {
	            // serve the client
	            console.log(colors_1.colors.blue('Handling new client'));
	            var fileWriter = null;
	            var $this = this;
	            // generate random unique file
	            var name = this.GetTempFileName(this.cfg.outputDir, '.wav');
	            var recordingEndedProperly = false;
	            socket.on('message', function (message, flags) {
	                if (recordingEndedProperly === false) {
	                    if (!flags.binary) {
	                        var msg = JSON.parse(message);
	                        if (!!msg && msg.type === 'start') {
	                            fileWriter = _this.InitRecording(name, msg);
	                        } else if (!!msg && msg.type === 'end') {
	                            recordingEndedProperly = true;
	                            _this.FinishRecording(_this.cfg.hostName, name, fileWriter, socket, _this.cfg.deleteWav);
	                        } else {
	                            // error - unsupported message
	                            console.log(colors_1.colors.red('Unsupported message'), message);
	                        }
	                    } else {
	                        if (!!fileWriter) {
	                            fileWriter.file.write(message);
	                        } else {
	                            // error - not initialised properly
	                            console.log(colors_1.colors.red('Binary data can\'t be accepted - initialisation wasn\'t done properly.'));
	                            socket.close();
	                        }
	                    }
	                }
	            });
	            // stream was closed
	            socket.on('close', function () {
	                console.log('stream closed');
	                if (!recordingEndedProperly) {
	                    if (fileWriter !== null) {
	                        fileWriter.end();
	                        fs.unlink(name, function (err) {
	                            if (err) {
	                                console.log(colors_1.colors.red("Can't delete tmp wav file " + name));
	                                return;
	                            }
	                            console.log(colors_1.colors.yellow("Tmp file " + name + " was deleted as stream was closed and not ended properly"));
	                        });
	                    }
	                }
	            });
	        } catch (e) {
	            console.log(colors_1.colors.red('A fatal error occured while serving a client. Recording session was aborted.'), e);
	        }
	    };
	    Server.prototype.InitRecording = function (name, msg) {
	        console.log(colors_1.colors.gray('initialising streaming into ') + name);
	        // save all incoming data (INT16 PCM) to the Wav file
	        var fileWriter = new wav_1.Wav.FileWriter(name, {
	            channels: msg.channels || 1,
	            sampleRate: msg.sampleRate || 48000,
	            bitDepth: msg.bitDepth || 16
	        });
	        return fileWriter;
	    };
	    Server.prototype.FinishRecording = function (hostName, name, fileWriter, socket, deleteWav) {
	        // write the Wav into the file
	        fileWriter.end();
	        fileWriter = null;
	        this.TryConvertTo(name, deleteWav, function (results) {
	            // inform the client about the result
	            if (!!socket) {
	                for (var i = 0; i < results.length; i++) {
	                    results[i].url = hostName + results[i].url;
	                }
	                socket.send(JSON.stringify({
	                    error: false,
	                    files: results
	                }));
	            } else {
	                console.log(colors_1.colors.red('Can\'t report the result - socket is already closed'));
	            }
	            // now close the socket
	            socket.close();
	        });
	    };
	    Server.prototype.GetTempFileName = function (dir, ext) {
	        dir = dir || './';
	        ext = ext || '';
	        // this will NEVER colide, for sure
	        // see http://en.wikipedia.org/wiki/Universally_unique_identifier
	        return dir + "/" + node_uuid_1.uuid.v4() + ext;
	    };
	    Server.prototype.TryConvertTo = function (input, deleteWav, _success) {
	        AudioConvertor_1['default']({
	            input: input,
	            formats: this.cfg.formats,
	            quality: 64,
	            publicRoot: './public',
	            outputDir: '/recordings',
	            channels: 1,
	            debug: false,
	            success: function success(files) {
	                var resultFileNames = [{
	                    url: input,
	                    type: 'audio/wav'
	                }];
	                if (files.length > 0) {
	                    if (deleteWav) {
	                        // I don't need the Wav any more
	                        fs.unlink(input, function (err) {
	                            if (err) {
	                                console.log(colors_1.colors.red("Can't delete tmp wav file " + input));
	                                return;
	                            }
	                            console.log(colors_1.colors.green("Tmp file " + input + " was deleted"));
	                        });
	                        resultFileNames = files;
	                    } else {
	                        resultFileNames = resultFileNames.concat(files);
	                    }
	                }
	                if (_success) {
	                    _success(resultFileNames);
	                }
	            },
	            error: function error() {
	                console.log(colors_1.colors.red("Error while converting the result from wav to " + this.cfg.formats));
	            }
	        });
	    };
	    return Server;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports['default'] = Server;
	//}
	/* WEBPACK VAR INJECTION */}.call(exports, "/"))

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("ws");

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = require("wav");

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = require("node-uuid");

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("colors");

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/// <refenrece path="../typings/tsd.d.ts" />
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	exports['default'] = convert;
	
	var _child_process = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"child_process\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	
	var _colors = __webpack_require__(11);
	
	function convert(cfg) {
	    if (cfg === undefined) {
	        console.log(_colors.colors.red("Audio Converted Error - No information passed."));
	        return false;
	    }
	    if (!cfg.hasOwnProperty("input")) {
	        console.log("Audio Converter Error - No input filename specified.");
	        return false;
	    }
	    var name = cfg.input.substr(cfg.input.lastIndexOf("/") + 1);
	    name = name.substr(0, name.lastIndexOf("."));
	    var outputDir = cfg.publicRoot + cfg.outputDir || "./";
	    var formats = cfg.formats || ["mp3"];
	    var done = 0;
	    var successful = [];
	    var debug = cfg.debug === undefined ? true : cfg.debug;
	    var overrideArg = cfg.hasOwnProperty("override") && cfg.override !== undefined ? cfg.override === true ? "-y" : "-n" : "-y";
	    for (var i in formats) {
	        var ext = formats[i];
	        convertTo(cfg, outputDir + "/" + name, ext, overrideArg, debug, function (ext) {
	            successful.push({
	                url: cfg.outputDir + '/' + name + '.' + ext,
	                type: 'audio/' + ext
	            });
	            if (++done === formats.length) {
	                if (cfg.hasOwnProperty("success")) {
	                    cfg.success(successful);
	                }
	            }
	        }, function (ext) {
	            if (++done === formats.length) {
	                if (cfg.hasOwnProperty("success")) {
	                    cfg.success(successful);
	                }
	            }
	        });
	    }
	}
	
	function convertTo(cfg, name, ext, overrideArg, debug, success, error) {
	    var output = name + "." + ext;
	    console.log(_colors.colors.gray('Trying to convert ' + cfg.input + ' to ' + output + '.'));
	    var ffmpeg = (0, _child_process.spawn)("ffmpeg", ["-i", cfg.input.toString(), "-ac", cfg.channels.toString() || "1", "-ab", cfg.quality.toString() || "64", "-loglevel", debug ? "verbose" : "quiet", overrideArg, output]);
	    ffmpeg.on("exit", function (code) {
	        if (code === 0) {
	            console.log(_colors.colors.gray('[' + _colors.colors.green("OK") + '] ' + ext));
	            success(ext);
	        } else {
	            console.log(_colors.colors.gray('[' + _colors.colors.red("XX") + '] ' + ext));
	            error(ext);
	        }
	    });
	    ffmpeg.stderr.on("data", function (err) {
	        console.log("FFmpeg err: %s", err);
	    });
	}
	module.exports = exports['default'];

/***/ }
/******/ ]);
//# sourceMappingURL=audio-server.js.map