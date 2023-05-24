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
  const zipCode = req.query.zip;
  const units = req.query.units;
  const apiKey = process.env.OPEN_WEATHER_API_KEY;
  let weatherAPIurl = `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode}&apiKey=${apiKey}`;
  const res = await fetch(weatherAPIurl);
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
    res.send(weatherData);
  } catch (error) {
    console.log('error', error);
    res.status(500).send({error: 'Server error'});
  }
});

app.listen(port, () => console.log(`app listening on port ${port}!`));