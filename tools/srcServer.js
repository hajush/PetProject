import express from 'express';
import webpack from 'webpack';
import path from 'path';
import config from '../webpack.config.dev';
import open from 'open';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import uriUtil from 'mongodb-uri';
import morgan from 'morgan';
import configAuth from './configAuth';
import User from '../models/user';
import Pet from'../models/pet';
import petRoutes from '../routes/petRoutes';
import userRoutes from '../routes/userRoutes';
/* eslint-disable no-console */

const port = process.env.PORT || 3000;
const app = express();
const compiler = webpack(config);
const router = express.Router();

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

//MongoDB -- Mongoose Import - Start
mongoose.Promise = global.Promise;

let mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost/petsdata';
let mongooseUri = uriUtil.formatMongoose(mongodbUri);
let options = {
  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
};

mongoose.connect(mongooseUri, options);
//End

const PROD = process.env.NODE_ENV === 'production';

//Timed scrape and sync
let scrapeRunner = require('../helpers/scrape');
let syncRunner = require('../helpers/sync');
//
let url = "http://ws.petango.com/Webservices/adoptablesearch/" +
  "wsAdoptableAnimals.aspx?sex=All&agegroup=All&colnum=" +
  "1&authkey=1t4v495156y98t2wd78317102f933h83or1340ptjm31spd04d";
//Call it when you npm start
// scrapeAndSync();
//Call again every hour
setInterval(scrapeAndSync, 3600000);

function scrapeAndSync() {
  scrapeRunner.scrapePetango(url, function(arr) {
    syncRunner.syncPets(arr);
    console.log(arr);
  });
}

app.use(express.static('src/public'));

if (PROD) {
  app.use('/', express.static('dist'));
} else {
  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
  }));

  app.use(require('webpack-hot-middleware')(compiler, {
    log: console.log,
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000
  }));
}

app.use('/', petRoutes);

app.use('/user', userRoutes);

app.get('*', function(req, res) {
  res.sendFile(path.join( __dirname, '../src/public/index.html'));
});

app.listen(port, function(err) {
  if (err) {
    console.log(err);
  } else if (!PROD) {
    console.log(('Starting app in dev mode, listening on port ' + port).green);
    open(`http://localhost:${port}`);
  } else {
    console.log('Starting app in production mode, listening on port ' + port);
  }
});
