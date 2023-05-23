// Setup empty JS object to act as endpoint for all routes
projectData = {};  

// Require Express to run server and routes
const express = require('express');

// Start up an instance of app
const app = express();
// load .env file
require('dotenv').config();


// Serve static files from the 'src' directory
app.use(express.static(path.join(__dirname, 'src')));

// Serve the 'index.html' file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html', 'tailwind.css'));
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

// Setup Server
const server = app.listen(0, () => {
    const port = process.env.PORT || server.address().port;
    console.log(`Server is listening on port: ${port}`);
  });
  

// GET method route
app.get('/getWeatherData', (req, res)=>{
    console.log(projectData);
res.send(projectData);
});

// POST method route
app.post('/saveData', (req, res)=>{
    newData = {
    temp: req.body.temp,
    date:  req.body.date,
    content: req.body.content
}
    projectData = newData;
    res.send(projectData);
    }
  );

  app.get('/getAPIKey', (req, res) => {
    res.send({ key: `&appid=${process.env.OPEN_WEATHER_API_KEY}&units=imperial` });
});
