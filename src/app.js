/* Global Variables */
let convertUnits;
let isUIUpdated = false;
let db;

// UI
const selectElement = document.getElementById('units');
const entryHolder = document.getElementById('entryHolder');
const generateButton = document.getElementById('generate');
const clearButton = document.getElementById('confirmClear');


// Create a new date instance dynamically with JS
let currentDate = new Date();
let formattedDate = `${currentDate.getMonth()+1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;

const handleUnitsChange = async () => {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    convertUnits = selectedOption.value;  
    isUIUpdated = false;
    updateUI();
}

const handleGenerateButtonClick = async () => {
    let zipCode = document.getElementById('zip').value;
    let feelings = document.getElementById('feelings').value;
    const apiData = await fetchWeatherData(zipCode, units);
    const newData = {
        temp: apiData.main.temp,
        date: formattedDate,
        content: feelings
    }
    const transaction = db.transaction(["weatherData"], "readwrite");
    const objectStore = transaction.objectStore("weatherData");
    objectStore.add(newData);
    isUIUpdated = false;
    updateUI();
}

const handleClearButtonClick = async () => {
    const transaction = db.transaction(["weatherData"], "readwrite");
    const objectStore = transaction.objectStore("weatherData");
    const request = objectStore.clear();
    request.onsuccess = () => {
        // Clear the UI entries as well
        entryHolder.innerHTML = '';
        isUIUpdated = false;
        updateUI();
    }
    request.onerror = (event) => {
        console.log('Error clearing data:', event.target.error);
    }
}

generateButton.addEventListener('click', handleGenerateButtonClick);
clearButton.addEventListener('click', handleClearButtonClick);
selectElement.addEventListener('change', handleUnitsChange);

const updateUI = async() => {
    try{
        const transaction = db.transaction(["weatherData"], "readonly");
        const objectStore = transaction.objectStore("weatherData");
        const request = objectStore.getAll();
        request.onsuccess = () => {
            if (!isUIUpdated) {
                // call a function that loops through array and render elements
                entryHolder.innerHTML = '';
                updateEntry(request.result);
            }
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
            createEntryContainer(entry.date,entry.temp,entry.content)
        });
    }
    isUIUpdated = true;
}
const createEntryContainer = (date,kelvin,content) => {
    const entryDiv = document.createElement('div');
    entryDiv.classList.add('entryDiv');
    entryDiv.innerHTML = `
    <div id="entryContainer" class="max-w-full h-36 mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow mt-4 overflow-auto">
    ${dateElement(date)}
    ${temperatureElement(kelvin)}
    ${feelingsElement(content)}
    </div>
    `;
    entryHolder.prepend(entryDiv);
}

const feelingsElement = (content) => `<div>Feelings: ${content}</div>`
const dateElement = (date) => `<div>Date: ${date}</div>`
const temperatureElement = (kelvin) => {
    if (convertUnits === "metric") {
        const metric = Math.round(kelvin - 273.15)
        return `<div>Temperature: ${metric}°C</div>`;
    }  
    else {
        const imperial = (Math.round(kelvin - 273.15) * 9 / 5 + 32);
        return `<div>Temperature: ${imperial}°F</div>`;
    }
}
// IndexedDB setup
const request = indexedDB.open("weatherDB", 1);
request.onerror = function(event) {
};
request.onsuccess = function(event) {
    db = request.result;
    updateUI(); 
};
request.onupgradeneeded = function(event) {
    let db = event.target.result;
    let objectStore = db.createObjectStore("weatherData", {autoIncrement: true});
};

// update the UI for the first time

// GET request function
const fetchWeatherData = async (zipCode, units) => {
    const res = await fetch(`/fetchWeatherData?zip=${zipCode}`);
    try {
      const data = await res.json();
      return data;
    } catch (error) {
      console.log('error', error);
    }
}
