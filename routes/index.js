/* global __dirname */

var express = require('express');
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');

var publicDir = path.resolve(__dirname, '../public'),
	dataRoot = path.resolve(publicDir, 'recordings');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET record a new video */
router.get('/record', function(req, res, next) {
	res.render('record', {  });
});

/* POST upload recorded video file */
router.post('/upload', UploadResult);

/**
 * Handle upload request
 * @param req	HTTP request object
 * @param res	HTTP response object
 */
function UploadResult(req, res) {
    var form = new formidable.IncomingForm();
	form.uploadDir = dataRoot;
	form.parse(req, function(err, fields, files) {
		if(!!err) {
			res.status(500).json({ success: false });
			return;
		}
		
		var ext = encodeURIComponent(fields.extension);
		var tmpName = files.file.path;
		var fileName = GenerateRandomFileName(ext);
		var newName = path.join(dataRoot, fileName);
		fs.renameSync(tmpName, newName);
		res.status(200).json({
			success: true,
			redirect: "/play/" + fileName			
		})
	});
}

/**
 * Generates a random file name to prevent collisions
 * @return 	{string}	File name
 */
function GenerateRandomFileName(ext) {
	ext = ext || "svg";
	return "rec-" + Date.now() + "-" + Math.floor(Math.random() * 10000) + "." + ext;
}



router.get('/play/:id', function(req, res, next) {
	res.render('play', {
		fileUrl: '/recordings/' + req.params.id
	});
});

module.exports = router;
