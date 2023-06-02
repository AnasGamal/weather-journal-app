// Setup empty JS object to act as endpoint for all routes
projectData = [];  
// Requre PlaceKit client library
const placekit = require('@placekit/client-js');
// Require Express to run server and routes
const express = require('express');
const path = require('path');
// Start up an instance of app
const app = express();
// load .env file
require('dotenv').config();
const port = process.env.PORT || 3000;
// Load PlaceKit API Key from environment variables 
const pk = placekit(process.env.PLACEKIT_API_KEY, { language: 'en', types: ['city'], maxResults: 4, countryByIP: true, countries: ['US']});

let fetch;
(async () => {
  fetch = (await import('node-fetch')).default;
})();
// Serve static files from the 'src' directory
app.use(express.static(path.join(__dirname, 'src')));

// Serve the 'index.html' file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

/* Dependencies */
const bodyParser = require('body-parser')


/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
const cors = require('cors');
app.use(cors());
// Initialize the main project folder
app.use(express.static('src/'));

// Autocomplete setup
app.post('/city', async (req, res) => { try {
  const results = await pk.search(req.body.query);
  res.json(results.results);
  } catch (error) {
    console.log('error', error);
    res.status(500).send({error: 'Server error'});
  }
});

// GET method route
app.get('/getWeatherData', (req, res)=>{
    console.log(projectData);
    res.send(projectData);
});

// POST method route
app.post('/saveData', (req, res)=>{
    var newData = {
    temp: req.body.temp,
    date:  req.body.date,
    content: req.body.content
    }
    projectData.push(newData);
    res.send(projectData);
    }
  );

const fetchWeatherData = async(req)=>{
  const latitude = req.query.lat;
  const longitude = req.query.lon;
  const apiKey = process.env.OPEN_WEATHER_API_KEY;
  let weatherAPIurl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&apiKey=${apiKey}`;
  const res = await fetch(weatherAPIurl);
  console.log(res);
  try{
      const data = await res.json();
      return data;
  }
  catch(error) {
      console.log('error', error);
  }
}
app.get('/fetchWeatherData', async (req, res) => {
  try {
    const weatherData = await fetchWeatherData(req);
    console.log(weatherData);
    res.send(weatherData);
  } catch (error) {
    console.log('error', error);
    res.status(500).send({error: 'Server error'});
  }
});

app.delete('/clearData', (req, res) => {
  projectData = []; // Clear the projectData array
  res.send('Data cleared successfully');
});

app.listen(port, () => console.log(`app listening on port ${port}!`));