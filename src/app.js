/* Global Variables */
const units = 'metric';
let isUIUpdated = false;
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
const entryHolder = document.getElementById('entryHolder');
const generateButton = document.getElementById('generate');

// Create a new date instance dynamically with JS
let currentDate = new Date();
let formattedDate = `${currentDate.getMonth()+1}/${currentDate.getDate()}/${currentDate.getFullYear()}`; // Get current date at time of request

const handleGenerateButtonClick = async () => {
    let zipCode = document.getElementById('zip').value;
    let feelings = document.getElementById('feelings').value;
    let apiKey = await getAPIKey();
    let weatherAPIurl = `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode}&units=${units}&apiKey=${apiKey}`;
    const apiData = await fetchWeatherData(weatherAPIurl);
    await saveData('/saveData', {temp:apiData.main.temp,date:formattedDate,content:feelings});
    isUIUpdated = false;
    await updateUI();
    isUIUpdated = true;
  }
  

generateButton.addEventListener('click', handleGenerateButtonClick);

const updateUI = async() => {
    const req = await fetch('/getWeatherData');
    try{
       const dataComplete = await req.json();
       if (!isUIUpdated) {
       dataComplete.forEach(obj => {
           // create a div container for entry contents
           const entryDiv = document.createElement('div');
           entryDiv.classList.add('entry');
   
           // create and append date div element to entry container
           const dateElement = document.createElement('div');
           dateElement.textContent= `Date: ${obj.date}`;
           entryDiv.appendChild(dateElement);
   
            // create and append temperature div element to entry container
           const tempElement = document.createElement('div');
           tempElement.textContent= `Tempreture: ${Math.round(obj.temp)}°F`;
           entryDiv.appendChild(tempElement)
   
            // create and append content div element to entry container
            const contentElement = document.createElement('div');
           contentElement.textContent= `Feelings: ${obj.content}`;
           entryDiv.appendChild(contentElement);

           // add new entry to the beginning of entryHolder container
           entryHolder.prepend(entryDiv);
   
         });
         console.log(dataComplete)
         isUIUpdated = true;
        }
    }
    catch(error){
        console.log('error', error);
    }
   }   
   updateUI();

// GET request function

const fetchWeatherData = async(weatherAPIurl)=>{
    const res = await fetch(weatherAPIurl);
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
