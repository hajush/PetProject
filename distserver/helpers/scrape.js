'use strict';

var request = require('request');
// import request from 'request';
var cheerio = require('cheerio');
// import cheerio from 'cheerio';
var scraper = {};

scraper.scrapePetango = function (url, callback) {
  console.log("scrape petango");
  //Make a GET request
  request(url, function (error, response, body) {
    console.log("scrape petango request");
    //Parse the response and return an array of Urls to the animals
    var animalUrls = this.parseAnimalListResponse(body);
    //Make a GET request to each individual url
    var petArray = [];
    for (var i = 0; i < animalUrls.length; i++) {
      //make a GET request using animalUrls[i]
      request(animalUrls[i], function (error, response, body) {
        //Parse response to get a pet object
        petArray.push(this.parseIndividualAnimalResponse(body));
        if (petArray.length === animalUrls.length) {
          callback(petArray);
        }
      }.bind(this));
    }
  }.bind(this));
};

//This function takes a response which is an HTML string
//and returns an array of url strings.
scraper.parseAnimalListResponse = function (html) {
  var urlStrings = [];
  var $ = cheerio.load(html);
  //jquery get href from a tag
  var linkElements = $('.list-animal-name a');
  linkElements.each(function (i, k) {
    //put data in an array and concat the host name
    if (k.attribs.href !== 'http://www.petango.com') {
      urlStrings.push('http://ws.petango.com/Webservices/adoptablesearch/' + k.attribs.href);
    }
  });
  return urlStrings;
};

//This function takes the html from each individual pet and parses it into
//a pet object and returns an object.
scraper.parseIndividualAnimalResponse = function (html) {
  var $ = cheerio.load(html);
  var petObject = {};

  petObject.animalId = parseInt($('#lblID').text());
  petObject.mainPhoto = $('#imgAnimalPhoto').attr('src');
  petObject.name = $('#lbName').text();
  petObject.species = $('#lblSpecies').text();
  petObject.breed = $('#lbBreed').text();
  petObject.age = $('#lbAge').text();
  petObject.gender = $('#lbSex').text();
  petObject.size = $('#lblSize').text();
  petObject.color = $('#lblColor').text();
  if ($('#ImageAltered').attr('src') == 'images/GreenCheck.JPG') {
    petObject.spayNeuter = true;
  } else {
    petObject.spayNeuter = false;
  }
  petObject.declawed = $('#lbDeclawed').text();
  petObject.intakeDate = $('#lblIntakeDate').text();
  petObject.intakeDate = $('#lblIntakeDate').text();
  petObject.description = $('#lbDescription').text();

  return petObject;
};

module.exports = scraper;