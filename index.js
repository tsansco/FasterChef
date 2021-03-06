'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const axios = require('axios');

const {dialogflow} = require('actions-on-google')
const WELCOME_INTENT = 'default welcome intent'
const FALLBACK_INTENT = 'default fallback intent'
const GETMEALTYPE_INTENT = 'getmealtype'
const MEALTYPE_ENTITY = 'mealtype'
const GETRUSH_INTENT = 'getrush'
const RUSHTIME_ENTITY = 'rushtime'
const GETDIFFICULTY_INTENT = 'getdifficulty'
const DIFFICULTYTYPE_ENTITY = 'difficultytype'
const GETDIFFICULTYYES_INTENT = 'getdifficulty - yes'
const GETDIFFICULTYNO_INTENT = 'getdifficulty - no'
const DIETTYPE_ENTITY = 'diettype'
const app = dialogflow()

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app)

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
 
  
   function welcome(agent) {
  	agent.add(`Hi, Im the FasterChef virtual assistant. I want to help you find something to eat...Fast!` + 
             `First things first...what type of meal would you like to eat.` +
             `You can say something like breakfast, lunch, dinner or a snack?`)
}
 
  function fallback(agent) {
    agent.add(FALLBACK_INTENT);
  }
  
function getmealtype(agent) {
  const mealtype = agent.parameters[MEALTYPE_ENTITY].toLowerCase();
 if(mealtype == `breakfast`){                                     
  agent.add(`breakfast is the most important meal of the day. Are you in a rush?`)
  } else if(mealtype == `dinner`){
  agent.add(`There's nothing better than a quality meal after a long day. Are you in a rush?`)
  } else if(mealtype == `snack`){
  agent.add(`Fantastic, I know lots of great treats you can bake from scratch. Are you in a rush?`)
  } else{
    agent.add(`We got lots of meals to choose from.`)
  }
}
  
function getrush(agent) {    
  const rushtime = agent.parameters[RUSHTIME_ENTITY].toLowerCase();
 if(rushtime == `yes`){                                     
  agent.add(`Well they don't call me FasterChef for nothing!I have many recipes that you can cook in around 20 minutes` + `But some require a little bit more effort (but it's worth it). What kind of difficulty level are you looking for?`)
   } else if(rushtime == `no`){
  agent.add(`Great! taking your time will usually reflect in your cooking.` + `Most of my recipes are easy. But some require a little bit more effort (but it's worth it). What kind of difficulty level are you looking for?`)
   }
}
  
  function getdifficulty(agent){
  const difficultytype = agent.parameters[DIFFICULTYTYPE_ENTITY].toLowerCase();
 if(difficultytype == `easy`){                                     
  agent.add(`Easy! That's my middle name...do you eat meat?`)
   } else if(difficultytype == `more effort`){
  agent.add(`I reckon a meal tastes better when time and effort is put in. Do you eat meat?`)
   }
}
  
  function getdifficultyyes(agent){
	agent.add(`Awesome! We have plenty of great recipes for you. But first I need a hint of what you might be in the mood for. Is there an ingredient you have in mind`)
}

  function getdifficultyno(agent){
    const diettype = agent.parameters[DIETTYPE_ENTITY].toLowerCase();
 if(diettype == `vegetarian`){                                     
  agent.add(`I've got lots of vegetarian recipes for you. Take a look at this: `)
   } else if(diettype == `vegan`){
  agent.add(`I have some delicious vegan recipes for you. Check this out...`)
   } else if(diettype == `pescatarian`){
  agent.add(`I have lots of fish recipes to choose from. Look here`)
   }else{agent.add(`You've come to the right place!`)
        }
}
  
   function getSpreadsheetData(){
  	return axios.get('https://sheetdb.io/api/v1/pb34e10v6j4mg');
  }

 function getrecipeHandler(agent) {
    const fooditem = agent.parameters.fooditem;
    return getSpreadsheetData().then(res => {
    	res.data.map(person => {
            if(person.Fooditem === fooditem)
        	agent.add(`Here are some recipes with ${fooditem}. Name: ${person.foodname1}, Link: ${person.url1}, Name 2: ${person.foodname2}, Link 2: ${person.url2}, Name 3: ${person.foodname3}, Link 3: ${person.url3},Name 4: ${person.foodname4}, Link 4: ${person.url4},Name 5: ${person.foodname5}, Link 5: ${person.url5},Name 6: ${person.foodname6}, Link 6: ${person.url6},Name 7: ${person.foodname7}, Link 7: ${person.url7},Name 8: ${person.foodname8}, Link 8: ${person.url8}`);
        });
    });
  }
  
  
 
  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('getmealtype', getmealtype);
  intentMap.set('getrush', getrush);
  intentMap.set('getdifficulty', getdifficulty);
  intentMap.set('getdifficulty - yes', getdifficultyyes);
  intentMap.set('getdifficulty - no', getdifficultyno);
  intentMap.set('getrecipe', getrecipeHandler);
  agent.handleRequest(intentMap);
});

