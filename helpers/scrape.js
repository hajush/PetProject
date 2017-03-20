
let request = require('request');
let cheerio = require('cheerio');
let scraper = {};


scraper.scrapePetango = function(url, callback) {
  //Make a GET request
  request(url, function (error, response, body) {
    //Parse the response and return and array of Urls to the animals
    let animalUrls = this.parseAnimalListResponse(body);
    //Make a GET request to each individual url
    let petArray = [];
    for(let i = 0; i <animalUrls.length; i++) {
      //make a GET request using animalUrls[i]
      request(animalUrls[i], function (error, response, body) {
        //Parse response to get a pet object
        petArray.push(this.parseIndividualAnimalResponse(body));
        if(petArray.length === animalUrls.length){
          callback(petArray);
        }
      }.bind(this));
    }
  }.bind(this));
};

//This function takes a response which is an HTML string
//and returns and array of url strings.
scraper.parseAnimalListResponse = function(html) {
  let urlStrings = [];
  let $ = cheerio.load(html);
  //jquery get href from a tag
  let linkElements = $('.list-animal-name a');
  linkElements.each(function(i, k) {
    //put data in an array and concat the host name
    if(k.attribs.href !== 'http://www.petango.com') {
      urlStrings.push('http://ws.petango.com/Webservices/adoptablesearch/'
                      + k.attribs.href);
    }
  });
  return urlStrings;
};

//This function takes the html from each individual pet and parses it into
//a pet object and returns an object.
scraper.parseIndividualAnimalResponse = function(html) {
  let $ = cheerio.load(html);
  let petObject = {};

  petObject.animalId = $('#lblID').text();
  petObject.mainPhoto = $('#imgAnimalPhoto').attr('src');
  petObject.name = $('#lbName').text();
  petObject.species = $('#lblSpecies').text();
  petObject.breed = $('#lbBreed').text();
  petObject.age = $('#lbAge').text();
  petObject.gender = $('#lbSex').text();
  petObject.size = $('#lblSize').text();
  petObject.color = $('#lblColor').text();
  if($('#ImageAltered').attr('src') == 'images/GreenCheck.JPG') {
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
