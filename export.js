var moment = require('moment');

function exportToSql(db, import_proc, query, callback) {
	db.execute(query, function(err, rows) {
	 	if (err) {
	 		//console.log(err);
	 		if (callback) return callback(err);
	 		else return;
	 	}
	 	var text = rows.map(function(val){
	 		return 'EXEC ' + import_proc + ' ' + exportRow(val);
	 	}).join(';\n');
	 	
//	 	console.log(text);
	 	if (callback) callback(null, text);
	});
}

function exportRow(row) {
	return row.reduce(function(prev, current){
		var value = escapeValue(current);
		prev = prev || '';
		
		return prev + ', ' + value;
	});
}

function escapeValue(val) {
	if (typeof val === "string") {
		return '\'' + val + '\'';
	} else if (val instanceof Date) {
		var date = val.getDate(),
			month = (val.getMonth() + 1);
		date = date < 10 ? '0' + date : '' + date;
		month = month < 10 ? '0' + month : '' + month;
		
		return '\'' + moment(val).format('YYYY-MM-DD') + '\'';
	} else {
		return val;
	}
}

function exportToJSON(db, tableName, query, callback) {
	db.query(query, function(err, data) {
	 	if (err) {
	 		if (callback) return callback(err);
	 		else return;
	 	}
	 	var rows = data.map(function(row) {
	 		for (var field in row) if (row.hasOwnProperty(field) && row[field] instanceof Date) {
	 			row[field] = moment(row[field]).format('YYYY-MM-DD');
	 		}
	 		return row;
	 	});
	 	var result = { 
	 		name: tableName, 
	 		rows: rows
	 	};
	 	if (callback) callback(null, result);
	});
}

module.exports = {
	toSql: exportToSql,
	toJSON: exportToJSON
};
