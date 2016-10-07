/* global __dirname */
var path = require('path');
var webpack = require('webpack');
var fs = require("fs");


var commonsPlugin = new webpack.optimize.CommonsChunkPlugin({
	filename: 'javascripts/common.js',
	chunks: [ 'player', 'recorder' ]
});
var ExtractTextPlugin = require('extract-text-webpack-plugin');
  
module.exports = {
	entry: {
		player: path.resolve(__dirname, './src/Player.ts'),
		recorder: path.resolve(__dirname, './src/Recorder.ts'),
		'audio-recording-worker': path.resolve(__dirname, './src/RecordingWorker.ts')
	},	
	output: {
		path: path.resolve(__dirname, './public'),
		filename: 'javascripts/[name].js'
	},
	devtool: 'source-map',	
	resolve: {
		extensions: [ '', '.ts', '.less', '.css', '.woff', '.svg', '.ttf', '.eot' ],
		modulesDirectories: [ 'node_modules' ]
	},	
	module: {
		loaders: [
			{
				test: /\.ts$/,
				loaders: [ 'babel', 'ts?sourceMap' ],
				exclude: [ /node_modules/ ]
			},
			{ test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap') },
			{ test: /\.less$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader?sourceMap') },
			{ test: /\.(woff|svg|ttf|eot)\?[0-9]*$/, loader:'url?prefix=font/&limit=5000' }
		]
	},	
	plugins: [ commonsPlugin, new ExtractTextPlugin('stylesheets/vector-screencast.css') ]
};