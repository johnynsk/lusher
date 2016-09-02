var Schema = function () {
	var that = {
		data: {
			'config': [],
			'steps': [],
			'colors': []
		}
	};

	var onLoad = function (data) {
		that.data = data;
	}

	var load = function () {
		$.ajax({url: 'schema.json', async: false, 'dataType': 'json', 'success': onLoad});
	}();

	that.getColor = function (path) {
		var regex = /([\w]+)\.(.+)/;
		var colors = that.data.colors;

		if (!(matches = path.match(regex))) {
			return;
		}

		if (!colors[matches[1]]) {
			throw 'unknown color path ' + path;
		}

		if (typeof colors[matches[1]] == 'string') {
			if (!colors[matches[1]].match(regex)) {
				return colors[matches[1]];
			}

			return that.getColor(colors[matches[1]]);
		}

		if (!colors[matches[1]][matches[2]].match(regex)) {
			return colors[matches[1]][matches[2]];
		}

		return that.getColor(colors[matches[1]][matches[2]]);
	}

	that.generateConfig = function (test) {
		var config = that.data.config;
		var steps = that.data.steps;
		var result = [];
		var regex = /([\w]+)\.([\w]+)/;
		var matches = null;

		if (typeof config[test] == 'undefined') {
			throw 'test ' + test + ' is undefined in config section';
		}

		if (!(matches = config[test].match(regex))) {
			return steps[config[test]];
		}

		for (step in steps[matches[1]]) {
			result[step] = decorateStep(steps[matches[1]][step]);
		}

		return result;
	}

	that.get = function () {
		return that.data;
	}

	return that;
}();
