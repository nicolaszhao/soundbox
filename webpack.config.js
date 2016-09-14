var path = require('path');

var webpack = require('webpack'),
	CleanWebpackPlugin = require('clean-webpack-plugin');

var PATHS = {
	app: path.join(__dirname, 'src'),
	build: path.join(__dirname, 'dist')
};

var libraryName = 'audio-engine';

module.exports = {
	entry: {
		app: path.join(PATHS.app, 'player.js')
	},
	output: {
		path: PATHS.build,
		filename: libraryName + '.js',
		library: libraryName,
		libraryTarget: 'umd',
		umdNamedDefine: true
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel',
				include: PATHS.app
			}
		]
	},
	plugins: [
		new webpack.IgnorePlugin(/(?:lodash|events-trigger)/),
		new CleanWebpackPlugin([PATHS.build])
	]
};