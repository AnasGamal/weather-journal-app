/* Global Variables */
const units = 'metric';
let isUIUpdated = false;
// UI
const entryHolder = document.getElementById('entryHolder');
const generateButton = document.getElementById('generate');
const clearButton = document.getElementById('confirmClear');

// Create a new date instance dynamically with JS
let currentDate = new Date();
let formattedDate = `${currentDate.getMonth()+1}/${currentDate.getDate()}/${currentDate.getFullYear()}`; // Get current date at time of request

const handleGenerateButtonClick = async () => {
    let zipCode = document.getElementById('zip').value;
    let feelings = document.getElementById('feelings').value;
    const apiData = await fetchWeatherData(zipCode, units);
    await saveData('/saveData', {temp:apiData.main.temp,date:formattedDate,content:feelings});
    isUIUpdated = false;
    updateUI();
  }
  
  
const handleClearButtonClick = async () => {
  await clearData();
  isUIUpdated = false;
  updateUI();
}

generateButton.addEventListener('click', handleGenerateButtonClick);
clearButton.addEventListener('click', handleClearButtonClick);

// Update user UI elements
const updateUI = async() => {
    const weatherDataRequest = await fetch('/getWeatherData');
    try{
        // returns an array of entries objects
       const weatherData = await weatherDataRequest.json();
       if (!isUIUpdated) {
        // call a function that loops through array and render elements
        entryHolder.innerHTML = '';
        updateEntry(weatherData);
        }
    }
    catch(error){
        console.log('error', error);
    }
   }   


   const updateEntry = (weatherData) => {
    if (weatherData.length === 0) {
        const entryDiv = document.createElement('div');
        entryDiv.innerHTML = `
        <div id="entryContainer" class="max-w-full h-36 mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow mt-4 overflow-auto">
        <div>No entries yet.</div>
        </div>
        `;
        entryHolder.prepend(entryDiv);
    } else {
    weatherData.forEach(entry => {
        // create a div container for entry contents
        const entryDiv = document.createElement('div');
        entryDiv.classList.add('entryDiv');

        entryDiv.innerHTML = `
        <div id="entryContainer" class="max-w-full h-36 mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow mt-4 overflow-auto">
        <div>Date: ${entry.date}</div>
        <div>Temperature: ${Math.round(entry.temp)}°C</div>
        <div>Feelings: ${entry.content}</div>
        </div>
        `;

        // add new entry to the beginning of entryHolder container
        entryHolder.prepend(entryDiv);
      })};
      isUIUpdated = true;
    }

    // update the UI for the first time
    updateUI();

// GET request function

const fetchWeatherData = async (zipCode, units) => {
    const res = await fetch(`/fetchWeatherData?zip=${zipCode}&units=${units}`);
    try {
      const data = await res.json();
      return data;
    } catch (error) {
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

const clearData = async(url='/clearData') => {
  try {
    const response = await fetch(url, {
      method: 'DELETE',
    });

    if (response.ok) {
      console.log('Data cleared successfully');
    } else {
      console.log('Failed to clear data');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}