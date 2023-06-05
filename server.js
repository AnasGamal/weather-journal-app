// Setup empty JS object to act as endpoint for all routes
projectData = [];  

// Require Express to run server and routes
const express = require('express');
const path = require('path');
// Start up an instance of app
const app = express();
// load .env file
require('dotenv').config();
const port = process.env.PORT || 3000;

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

var axios = require('axios');

// Autocomplete setup
app.post('/city', async (req, res) => { try {
  const googlePlacesApiKey = process.env.GOOGLEPLACES_API_KEY;
  await axios({
    method: 'get',
    url: `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${req.body.query}&types=geocode&language=en&key=${googlePlacesApiKey}`,
    headers: { }
  })
  .then((response) => {
      res.send(response.data.predictions.map((prediction) => prediction.description));
  });
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
  let weatherAPIurl;
  const latitude = req.query.lat;
  const longitude = req.query.lon;
  const city = req.query.city;
  const openWeatherApiKey = process.env.OPEN_WEATHER_API_KEY;
  if (latitude && longitude) {
    weatherAPIurl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&apiKey=${openWeatherApiKey}`;
    console.log(weatherAPIurl);
  } else if (city) {
    weatherAPIurl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&apiKey=${openWeatherApiKey}`;
    console.log(weatherAPIurl);
  }
  const res = await axios.get(weatherAPIurl);
  console.log(res);
  try{
      return res.data;
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