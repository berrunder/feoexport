var fb = require("node-firebird"),
	fs = require('fs'),
	exportTable = require('./export.js'),
	async = require('async'),
	moment = require('moment'),
	config = require('./config');

var lastDate = config.get('lastDate'),
	dbParams = config.get('tsqlDB'),
	exportParams = [
		{ 
			proc: 'UPDATE_SUBSIDY', 
			query: "select s.id_subsidy, s.name, s.mnemo as code, s.fromdate as date_from, s.todate as date_to " +
				   "from subsidy s " +
				   "where s.lastdate >= '" + lastDate + "'"
		},
		{
			proc: "UPDATE_SOURCE_FINANCE",
			query: "select sf.id_source_finance, sf.name, sf.code, sf.fromdate as date_from, " +
				   "sf.todate as date_to from source_finance sf " +
					"where sf.lastdate >= '" + lastDate + "'"
		},
		{
			proc: "UPDATE_ARRANGEMENT",
			query: "select ID_ARRANGEMENTS as id_arrangement, NAME as name_full, MNEMO as name_short, CODE, " +
				   "a.fromdate as date_from, a.todate as date_to " + 
				   "from arrangements a " +
				   "where a.lastdate >= '" + lastDate + "'"
		},
		{
			proc: "UPDATE_COAT_VALUES",
			query: "select cv.id_coat_values, cv.code, cv.name as name, cv.fromdate as date_from, cv.todate as date_to " + 
					"from coat_values cv where cv.id_coat in (1,2) " +
					"and cv.lastdate >= '" + lastDate + "'"
		},
		{
			proc: "UPDATE_AIMEDMEANS",
			query: "select o.id_objective_found as id_aimedmeans, o.name, o.mnemo as code, " + 
					"o.fromdate as date_from, o.todate as date_to from objective_found o " + 
					"where o.lastdate >= '" + lastDate + "'"
		},
		{
			proc: "UPDATE_DIRECTION",
			query: "select f.id_flow as id_direction, f.name,  f.mnemo as code, " +
				   "f.fromdate as date_from, f.todate as date_to " +
				   "from flow f where f.lastdate >= '" + lastDate + "'"
		},
		{
			proc: "UPDATE_DON_PERSONAL_ACCOUNT",
			query: "select pa.id_di_personal_account as id_personal_account, " +
						   "pa.account as code, pa.is_default, c.inn, " +
						   "pa.fromdate as date_from, " +
						   "pa.todate as date_to " +
					"from di_personal_account pa " +
					"left join budg_acquies ba on ba.id_budg_acquies = pa.id_budg_acquies " +
					 "left join contractor c on c.id_contr = ba.id_contr " +
					"where pa.lastdate >= '" + lastDate + "'"
		},
		{
			proc: "UPDATE_ECONOM_CLASS",
			query: "select ec.id_econom_class, ec.mnemo, ec.name, ec.tree_level, 0 as canedit, ec.haschild, " + 
						  "ec.optional, ec.from_date as date_from, ec.to_date as date_to, ec.id_parent " +
					"from econom_class ec " +
					"where ec.lastdate >= '" + lastDate + "'"
		}
	],
	direction = process.argv[2] || 'json';
	
fb.attach(
    dbParams,
    function(err, db){
        if (err) {
            console.log(err.message);
        } else {
            console.log("connected...");
            if (direction === 'sql') 
            {
            	exportToSql(db);
            }
            else {
            	exportToJSON(db);
            }
        }
    }
);

function exportToSql(db) {
	async.map(exportParams, function(item, callback) {
    	exportTable.toSql(db, item.proc, item.query, function(err, text) {
    		if (err) {
    			console.log(err);
    			return callback(err);
    		}
    		callback(null, text);
    	});
    }, function(err, results) {
    	if (err) return console.log(err);
    	var filename = "export" + moment().format('YYYYMMDD_HHmmss') + '.sql';
    	
    	fs.writeFile(filename, results.join('\n----------\n'), function(er) {
    		if (err) return console.log(err);
	 		console.log('SQL export finished.');
	 		db.detach();
    	});
    });
}

function exportToJSON(db)  {
	async.map(exportParams, function(item, callback) {
    	exportTable.toJSON(db, item.proc, item.query, function(err, text) {
    		if (err) {
    			console.log(err);
    			return callback(err);
    		}
    		callback(null, text);
    	});
    }, function(err, results) {
    	if (err) return console.log(err);
    	var filename = "export" + moment().format('YYYYMMDD_HHmmss') + '.json';
    	//console.log(results);
    	var json = [].concat.apply(results);
    	
    	fs.writeFile(filename, JSON.stringify(json, null, 2), function(er) {
    		if (err) return console.log(err);
	 		console.log('JSON export finished.');
	 		db.detach();
    	});
    });
}
