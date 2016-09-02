var Test = function () {
	var state = null;
	var schema = null;
	var base = null;
	var currentTest = null;
	var currentStep = null;
	var callbacks = [];
	var currentSteps = [];
	var $container = $('<div>');
	var result = {};
	var allSteps = {};

	var that = {};

	var storeResult = function (context) {
		if (!result.hasOwnProperty(currentTest)) {
			result[currentTest] = [];
		}
		if (!result[currentTest][currentStep]) {
			result[currentTest][currentStep] = [];
		}

		result[currentTest][currentStep].push($(context).data('value'));
	}

	var handleClick = function (event, context) {
		if (!context) {
			context = this;
		}

		$(context).removeClass('picker-active')
			.addClass('picker-null')
			.css('background', 'transparent');

		storeResult(context);

		$active = $container.find('.picker-active');

		if ($active.length == 1) {
			handleClick(event, $active);
		} else if (!$active.length) {
			that.processTest();
		}

		return false;
	}

	var handleDummyClick = function () {
		return false;
	}

	var renderItem = function (config) {
		var $item = $('<a class="col-md-3" href="#">').addClass('picker');

		if (config == null) {
			$item.addClass('picker-null');
			$item.click(handleDummyClick);
			return $item;
		}

		if (config.length == 1) {
			console.log(config);
			return $item;
		}

		if (config.length == 2) {
			color = schema.getColor(config[0]);
			value = config[1];

			$item.addClass('picker-active');
			$item.css('background', color);
			$item.data('value', value);
			$item.click(handleClick);
		}

		return $item;
	};

	var renderRow = function (row) {
		var $result = $('<div class="row">');

		for (column in row) {
			var item = row[column];
			$result.append(renderItem(item));
		}

		return $result;
	}

	var renderConfig = function (config) {
		var $result = $('<div class="step-area">');
		currentSteps = config;

		for (steps in config) {
			if (currentStep != steps) {
				continue;
			}

			var step = config[steps];

			for (rows in step) {
				var row = step[rows];
				$result.append(renderRow(row));
			}
		}

		return $result;
	};

	var handleFinish = function () {
		for (offset in callbacks) {
			callbacks[offset]();
		}
	}

	that.getBase = function () {
		if (!base) {
			base = Base;
		}

		return base;
	}

	that.getSchema = function () {
		if (!schema) {
			schema = Schema;
		}

		return schema;
	}

	that.init = function () {
		that.getSchema();
		that.getBase();

		allSteps = ArrayIterator(that.getSchema().data.config);
		result = {};

		var date = new Date();
		result.date = ('0' + date.getDate()).slice(-2) + '.' + ('0' + (date.getMonth() + 1)).slice(-2) + '.' + date.getFullYear();
		currentTest = null;
		currentSteps = [];
		currentStep = 0;
	}

	that.processTest = function (test) {
		if (test) {
			currentTest = allSteps[test];
			currentStep = 0;
		} else if (currentTest && currentStep < currentSteps.length - 1) {
			currentStep++;
			test = allSteps.indexOf(currentTest);
		} else {
			currentTest = allSteps.getNext();

			if (currentTest == false) {
				handleFinish();
				return;
			}

			currentStep = 0;
			test = allSteps.indexOf(currentTest);
		}

		var config = this.getSchema().generateConfig(test);
		$container.html(renderConfig(config));
	}

	that.getResult = function () {
		return result;
	}

	that.onFinish = function (callback) {
		callbacks.push(callback);
	}

	that.setContainer = function (container) {
		$container = container;
	}

	return that;
}();

$(document).ready(Test.init);