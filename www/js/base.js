var Base = function () {
	var that = {
		data: null
	};

	var onLoad = function (data) {
		that.data = data;
	}

	var load = function () {
		$.ajax({url: 'base.json', async: false, dataType: 'json', success: onLoad});
	}();

	return that;
}();
