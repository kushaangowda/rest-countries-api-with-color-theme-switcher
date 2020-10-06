const express = require('express');
const logger = require('morgan');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

let settings = { method: "Get" };


var port = process.env.PORT || 3000;

//create instance of express app
var app = express();

//to serve html and js in ejs
app.set('view engine', 'ejs');

//we want to send css, images, and other static files from folder views
app.use(express.static('views'));
app.set('views',__dirname + '/views')

// give server access to post data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

//logging in development mode
app.use(logger('dev'));

app.listen(port, () => console.log(`listening to PORT ${port}...`));

app.get('/',(req,res)=>{
	var url = "https://restcountries.eu/rest/v2/all";
	var region = req.query.f;
	var s = req.query.s;
	if(typeof region != 'undefined'){
		url = 'https://restcountries.eu/rest/v2/region/'+region;
	}
	if(typeof s != 'undefined'){
		url = 'https://restcountries.eu/rest/v2/name/'+s;
	}
	get(res,url);
})

app.get('/display',(req,res)=>{
	var name = req.query.name || "";
	var url = 'https://restcountries.eu/rest/v2/name/'+name+'?fullText=true';
	get_single(res,url);
})

async function get_single(res,url){
	fetch(url, settings)
    .then(res => res.json())
    .then((json) => {
    	if(json['status']==404){
    		res.render('single.ejs',{error:'Data not found'});
    	}
    	var k = json[0]['borders'];
    	k.sort();
    	get_List(k,json,res);
    	// data['borders'][`${i}`]
    	// console.log(json[0]['name']);
    	
    	//console.log('list:',list);
    	
    });
}

async function get_List(k,json1,res){
    var url = 'https://restcountries.eu/rest/v2/all';
    fetch(url, settings)
		.then(res => res.json())
		.then((json) => {
		    var i = 0;
		    var list = [];
			while(k[`${i}`]){
    			for(var j=0;j<=249;j++){
    				if(json[j]['alpha3Code']==k[`${i}`]){
    					list.push(json[j]['name']);
    					break;
    				}
    			}
				i++;
    		}
		   	res.render('single.ejs',{data:json1[0],list:list});

		});	
}

async function get(res,url){
	fetch(url, settings)
    .then(res => res.json())
    .then((json) => {
    	if(json['status']==404){
    		res.render('index.ejs',{error:'Data not found'});
    	}
    	res.render('index.ejs',{data:json});
    });
}