/* Global Variables */
const units = 'metric';
let isUIUpdated = false;
let db;

// UI
const entryHolder = document.getElementById('entryHolder');
const generateButton = document.getElementById('generate');

// Create a new date instance dynamically with JS
let currentDate = new Date();
let formattedDate = `${currentDate.getMonth()+1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;

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

generateButton.addEventListener('click', handleGenerateButtonClick);

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
        entryDiv.textContent = 'No entries yet.';
        entryHolder.prepend(entryDiv);
    } else {
        weatherData.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.classList.add('entryDiv');

            const dateElement = document.createElement('div');
            dateElement.textContent= `Date: ${entry.date}`;

            const tempElement = document.createElement('div');
            tempElement.textContent= `Tempreture: ${Math.round(entry.temp)}°C`;

            const contentElement = document.createElement('div');
            contentElement.textContent= `Feelings: ${entry.content}`;

            entryDiv.append(dateElement, tempElement, contentElement);
            entryHolder.prepend(entryDiv);
        });
    }
    isUIUpdated = true;
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
    const res = await fetch(`/fetchWeatherData?zip=${zipCode}&units=${units}`);
    try {
      const data = await res.json();
      return data;
    } catch (error) {
      console.log('error', error);
    }
}
