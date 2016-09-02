var ArrayIterator = function (data) {
    var current = -1;
    data.getNext = (function () { return (++current >= this.length) ? false : this[current]; });
    data.getPrevious = (function () { return (--current < 0) ? false : this[current]; });
    data.getOffset = (function () { return current;});
    return data;
};

var ObjectPath = function (data) {
	data.getByPath = (function (path, parent) {
		if (!parent) {
			parent = data;;
		}

        if (parent.hasOwnProperty('restricted_key')) {
            return parent['restricted_key'];
        }

		var regexp = /([\d\w\-_]+)\.?(.*)/;
		if (!(matches = path.match(regexp))) {
			throw 'must be a string containing only chars ' + path;
		}

		if (!parent.hasOwnProperty(matches[1])) {
			return null;
		} else if (matches[2].length) {
			return data.getByPath(matches[2], parent[matches[1]]);
		}

		return parent[matches[1]];
	});
	return data;
};
