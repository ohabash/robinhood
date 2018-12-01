const colors = require('colors');








//  /$$$$$$$  /$$$$$$$
// | $$__  $$| $$__  $$
// | $$  \ $$| $$  \ $$
// | $$  | $$| $$$$$$$
// | $$  | $$| $$__  $$
// | $$  | $$| $$  \ $$
// | $$$$$$$/| $$$$$$$/
// |_______/ |_______/
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017';
const params = { useNewUrlParser: true}
const dbName = 'robinhood_db';
let db;

// Connect to database
MongoClient.connect(url, params, function(err, client) {
	assert.equal(null, err);
	console.log(`Connected to ${dbName} successfully on ${url}`.magenta);
	db = client.db(dbName);

	// readDB('quote_data', db, (data) => handleQuoteData(data));
	init(client);
});



const handleQuoteData = (data) => {
	console.log(`quote_data: ${pretty(data)}`.bgCyan.black.bold);
}

// Robinhood
const init = (dbClient, interval) => {
	// const quote_data = db.collection('documents');
	const credentials = require("./credentials.js");
	const Robinhood = require('robinhood')(credentials, ()=> {
		const token = Robinhood.auth_token();

	    if(interval) {
	    	setInterval( e=> {getAndSave(Robinhood) }, interval);
	    }else {
	    	getAndSave(Robinhood);
	    }

	});
}


// get quote_data
const getAndSave = (Robinhood) => {
    Robinhood.quote_data('GOOG', function(error, response, body) {
        if (error) { err(error); }
        if (body === undefined) {err('body undefined');return false}
        // console.log(' quote_data => '.inverse, body.results);
        const data = [Object.assign({stamp:Date.now()}, {data:body.results})];
        // const data = body.results;
        save_data( data, 'quote_data', result => {
        	console.log(`Inserted: `.yellow, `${result.ops[0]._id}`.bgYellow.black.bold);
        });
		// dbClient.close();
    });
}

const saveDataOninterval = (interval, client) => {
	setInterval( e=> {
		getAndSave(client)
	}, interval);
}



const save_data = (data, locName, callback) => {  
  // Get the documents collection
  let collection = db.collection(locName);
  
  // Insert some documents
  collection.insertMany(data, function(err, result) {
    assert.equal(err, null);
    callback(result);
  });
}




const readDB = (query ,db, callback) => {
  // Get the documents collection
  const collection = db.collection(query);
  // Find some documents
  collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    callback(docs);
  });
}


const err = (error) => {
	console.error(error);
    process.exit(1);
}



function pretty(obj) {
    return JSON.stringify(obj, null, 2)
}







