/* Global Variables */

// Personal API Key for OpenWeatherMap API
const weatherAPIBaseURL = 'https://api.openweathermap.org/data/2.5/weather?zip='
// Fetch the API key from the server
const getAPIKey = async () => {
    const res = await fetch('/getAPIKey');
    try {
      const data = await res.json();
      return data.key;
    } catch (error) {
      console.log('error', error);
    }
  }
  
// UI
const dateElement = document.getElementById('date');
const tempElement = document.getElementById('temp');
const contentElement = document.getElementById('content');
const generateButton = document.getElementById('generate');

// Create a new date instance dynamically with JS
let currentDate = new Date();
let formattedDate = `${currentDate.getMonth()+1}/${currentDate.getDate()}/${currentDate.getFullYear()}`; // Get current date at time of request

const handleGenerateButtonClick = async () => {
    let zipCode = document.getElementById('zip').value;
    let feelings = document.getElementById('feelings').value;
    const apiKey = await getAPIKey();
    getWeatherData(weatherAPIBaseURL,zipCode,apiKey)
      .then(function(apiData){
          saveData('/saveData', {temp:apiData.main.temp,date:formattedDate,content:feelings})
     })
     .then(()=>updateUI());
  }
  

generateButton.addEventListener('click', handleGenerateButtonClick);


// GET request function

const getWeatherData = async(weatherAPIBaseURL,zipCode,weatherAPIKey)=>{
    const res = await fetch(weatherAPIBaseURL+zipCode+weatherAPIKey);
    try{
        const data = await res.json();
        return data;
    }
    catch(error) {
        console.log('error', error);
    }
}


// POST request function
const saveData = async(url='/saveData',data={})=>{
    const res = await fetch(url, {
        method: 'POST', 
        credentials: 'same-origin', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),      
      })
    try{
        const newData = await res.json();
        return newData;
    }
    catch(error){
        console.log('error', error);
    }
};


// Update user UI elements

const updateUI = async() => {
 const req = await fetch('/getWeatherData');
 try{
     const dataComplete = await req.json();

     dateElement.innerHTML= `Date: ${dataComplete.date}`;
     tempElement.innerHTML= `Tempreture: ${Math.round(dataComplete.temp)}°C`;
     contentElement.innerHTML= `Feelings: ${dataComplete.content}`;
 }
 catch(error){
     console.log('error', error);
 }
}
