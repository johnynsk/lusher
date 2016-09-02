var Page = function () {
	var $active = null;
	var test = null;
	var resultBuilder = null;
	var that = {};

	var showPage = function(selector) {
		$('body>.container>.page').addClass('hidden');
		$active = $('body>.container>.' + selector);
		$active.removeClass('hidden');
	};

	var getResultBuilder = function () {
		if (!resultBuilder) {
			resultBuilder = Result;
		}

		return resultBuilder;
	}

	var handleFinished = function () {
		var data = test.getResult();

		that.showResult(data);
	}

	var processStep = function (step) {
		switch(step) {
			case 'test':
				if (!test) {
					test = Test;
				}

				showPage('test');
				startTest();
				break;

			case 'result':
				showPage('result');
				break;

			default:
				showPage('index');
				break;
		}
	};

	var startTest = function () {
		test.init();
		test.setContainer($active.find('.result-area'));
		test.onFinish(handleFinished);
		test.processTest();
	};

	var handleHashChange = function () {
		if (!location.hash.length) {
			return processStep();
		}

		if (location.hash.match(/#\/test\/$/)) {
			return processStep('test');
		}

		var matches = location.hash.match(/#\/result\/(.+)$/);
		if (matches) {
			return that.showResult(JSON.parse(atob(matches[1])));
		}
	};

	that.ready = function() {
		window.onhashchange = handleHashChange;

		handleHashChange();
	};

	that.showResult = function (data) {
		history.pushState(null, null, '#/result/' + btoa(JSON.stringify(data)));
		var resultBuilder = getResultBuilder();
		var result = resultBuilder.getResult(data);

		var $renderedResult = resultBuilder.render(result);
		processStep('result');
		$active.find('.result-area').html($renderedResult);
		$active.find('.copy-field').val(location);
		$active.find('.copy-action').click(copyLocation);
	};

	var copyLocation = function () {
  		var copyTextarea = document.querySelector('.copy-field');
  		copyTextarea.select();

  		try {
    		document.execCommand('copy');
  		} catch (err) {
  		}
	};

	return that;
}();

$('document').ready(Page.ready());