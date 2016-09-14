var path = require('path');

var webpack = require('webpack'),
	CleanWebpackPlugin = require('clean-webpack-plugin');

var PATHS = {
	app: path.join(__dirname, 'src'),
	build: path.join(__dirname, 'dist')
};

var package = require('./package.json'),
	libraryName = package.name,
	dependsExternalModules = Object.keys(package.dependencies || {}),
	externalModules = {};

dependsExternalModules.forEach(function(module) {
	externalModules[module] = module;
});

module.exports = {
	entry: {
		app: path.join(PATHS.app, 'index.js')
	},
	output: {
		path: PATHS.build,
		filename: libraryName + '.js',
		library: libraryName,
		libraryTarget: 'umd'
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
		new CleanWebpackPlugin([PATHS.build])
	],
	externals: externalModules
};