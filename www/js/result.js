var Result = function () {
	var base = null;
	var that = {};
	var renderSchema = [
			['header', 'Желаемое'],
			['item', 'want.plus.common', 'Общая + функция'],
			['item', 'want.plus.concrete', 'Частная + функция'],
			['item', 'want.multiply.common', 'Общая x функция'],
			['item', 'want.multiply.concrete', 'Частная x функция'],
			['item', 'want.equal.common', 'Общая = функция'],
			['item', 'want.equal.concrete', 'Частная = функция'],
			['item', 'want.minus.common', 'Общая - функция'],
			['item', 'want.minus.concrete', 'Частная - функция'],
			['header', 'Действительное'],
			['item', 'real.plus.common', 'Общая + функция'],
			['item', 'real.plus.concrete', 'Частная + функция'],
			['item', 'real.multiply.common', 'Общая x функция'],
			['item', 'real.multiply.concrete', 'Частная x функция'],
			['item', 'real.equal.common', 'Общая = функция'],
			['item', 'real.equal.concrete', 'Частная = функция'],
			['item', 'real.minus.common', 'Общая - функция'],
			['item', 'real.minus.concrete', 'Частная - функция'],
			['header', 'Характеристики'],
			['item', 'ambition', 'Стремления, мотивируемые собственным разумением (самопониманием, осознанием собственного поведения)'],
			['item', 'relations', 'Манера проявления характера (внутреннее отношение к...) по отношению к близким, отношение к партнеру'],
			['item', 'self_concept', 'Оценка собственного "Я". Манера проявления воли'],
			['item', 'excitability', 'Возбудимость, импульсивное (побужденое, вызванное) поведение'],
			['item', 'behaviour', 'Поведение с точки зрения контактов (поведение ожидания). Отношение к окружающему миру'],
			['header', 'Самоощущение'],
			['item', 'feel', 'Самоощущение'],
		];

	var getBase = function () {
		if (!base) {
			base = Base;
		}

		return base;
	};

	var getDataByPath = function (path, parent) {
		if (!parent) {
			parent = getBase().data;
		}

        if (parent.hasOwnProperty('restricted_key')) {
            return parent['restricted_key'];
        }

		var regexp = /([\w]+)\.?(.*)/;
		if (!(matches = path.match(regexp))) {
			throw 'must be a string containing only chars ' + path;
		}

		if (!parent.hasOwnProperty(matches[1])) {
			return null;
		} else if (matches[2].length) {
			return getDataByPath(matches[2], parent[matches[1]]);
		}

		return parent[matches[1]];
	};

	var getDataWithIndex = function (path, index) {
		var result = getDataByPath(path);

		if (!result) {
			console.log('empty result for query =  ' + path);
			return {index: index};
		}

		result.index = index;

		return result;
	};

	var getResultForGray = function (data) {
		if (!data.length) {
			return;
		}

		var response = data[0];
		var index = '+' + response[0].toString() + '+' + response[1].toString() + '-' + response[4].toString();
		var data = getDataWithIndex('plusminus.' + response[0].toString() + response[1].toString() + response[4].toString(), index);

		return data;
	};

	var getResultForMixed = function (data) {
		if (!data.length) {
			return;
		}

		var answers = data[0];
		var result = {
			plus: {"common": null, "concrete": null},
			minus: {"common": null, "concrete": null},
			equal: {"common": null, "concrete": null},
			multiply: {"common": null, "concrete": null}
		};

		result.plus.common = getDataWithIndex('plus.' + answers[0].toString(), '+' + answers[0].toString());
		result.plus.concrete = getDataWithIndex('plus.' + answers[0].toString() + answers[1].toString(), '+' + answers[0].toString() + '+' + answers[1].toString());
		result.multiply.common = getDataWithIndex('multiply.' + answers[2].toString(), '+' + answers[2].toString());
		result.multiply.concrete = getDataWithIndex('multiply.' + answers[2].toString() + answers[3].toString(), '+' + answers[2].toString() + '+' + answers[3].toString());
		result.equal.common = getDataWithIndex('equal.' + answers[4].toString(), '+' + answers[4].toString());
		result.equal.concrete = getDataWithIndex('equal.' + answers[4].toString() + answers[5].toString(), '+' + answers[4].toString() + '+' + answers[5].toString());
		result.minus.common = getDataWithIndex('equal.' + answers[6].toString(), '+' + answers[6].toString());
		result.minus.concrete = getDataWithIndex('equal.' + answers[6].toString() + answers[7].toString(), '+' + answers[6].toString() + '+' + answers[7].toString());

		return result;
	};

	var calculateAnswers = function (data) {
		var result = {"0": 0, "1": 0, "2": 0, "3": 0};
		var check = {"0": 0, "1": 0, "2": 0, "3": 0};
		for (answer in data) {
			result[data[answer][0].toString()]++;
		}

		// 3 0 0 3 || 1 2 1 2
		for (answer in result) {
			check[result[answer].toString()]++;
			if (check[result[answer].toString()] > 1) {
				return null;
			}
		}

		return result;
	};

	var getResultForAdvanced = function (data, offset) {
		var answers = calculateAnswers(data);
		if (!answers) {
			return null;
		}

		var index = answers[0].toString() + answers[2].toString() + answers[3].toString() + answers[1].toString() + offset.toString();
		var result = getDataWithIndex('color.' + index, index);

		return result;
	};

	that.getResult = function (data) {
		var result = {};

        // it must be more flexibility to calculate only processed steps
		result.feel = getResultForGray(data.gray);
		result.want = getResultForMixed(data.want);
		result.real = getResultForMixed(data.real);
		result.ambition = getResultForAdvanced(data.color, 0);
		result.relations = getResultForAdvanced(data.blue, 1);
		result.self_concept = getResultForAdvanced(data.green, 2);
		result.excitability = getResultForAdvanced(data.red, 3);
		result.behaviour = getResultForAdvanced(data.yellow, 4);

		return result;
	};

	var renderItem = function (data, header, hint) {
		if (!header) {
			header = '';
		}

		if (!data) {
			data = {flags: 3, text: 'Произошла ошибка в ходе прохождения теста. Необходимо пройти ещё раз.'};
		} else if (!data.text) {
			data = {index: data.index, flags: 3, text: 'Произошла ошибка в ходе прохождения теста. Необходимо пройти ещё раз.'};
		}

		var index = '';

		if (typeof data.index != 'undefined') {
			index = '[' + data.index + '] ';
		}

		var className = 'panel-default';
		if (typeof data.flags != 'undefined') {
			switch (data.flags) {
				case 1:
					header += ' <span class="label label-info">*</span> ';
					className = 'panel-info';
					break;
				case 2:
					header += ' <span class="label label-warning">**</span> ';
					className = 'panel-warning';
					break;
				case 3:
					header += ' <span class="label label-danger">***</span> ';
					className = 'panel-danger';
					break;
			}
		}

		var percent = '';
		if (data.percent) {
			percent = ' <span class="label label-default">' + data.percent.toString() +'%</span>';
		}

		var content = '';
		if (data.title) {
			content = '<h4>' + data.title + '</h4>';
		}

		if (data.text) {
			content += data.text;
		}

		$result = $('<div class="panel ' + className + '"><div class="panel-heading">' + index + header + percent + '</div><div class="panel-body">' + content + '</div></div>');
		return $result;
	}

	that.render = function (data) {
		var $result = $('<div />');
		data = ObjectPath(data);

		if (typeof data.date != 'undefined') {
			$result.append('<p><strong>Дата выполнения теста: ' + data.date + '</strong></p>');
		}

		for (items in renderSchema) {
			var item = renderSchema[items];
			switch (item[0]) {
				case 'item':
					$result.append(renderItem(data.getByPath(item[1]), item[2]));
					break;
				case 'header':
					$result.append('<h3>' + item[1] + '</h3>');;
					break;
			}
		}

		return $result;
	}

	return that;
}();
