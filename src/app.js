// Global Variables
let convertUnits = "metric";
let isUIUpdated = false;
let db;
let latitude;
let longitude;
let dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
let timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true, timeZoneName: 'short' };


// UI Elements
const uiElements = {
    selectElement: document.getElementById('units'),
    entryHolder: document.getElementById('entryHolder'),
    generateButton: document.getElementById('generate'),
    clearButton: document.getElementById('confirmClear'),
    locationButton: document.getElementById('getLocation')
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
uiElements.generateButton.addEventListener('click', handleGenerateButtonClick);
uiElements.locationButton.addEventListener('click', handleLocationButtonClick);
uiElements.clearButton.addEventListener('click', handleClearButtonClick);
uiElements.selectElement.addEventListener('change', handleUnitsChange);
});

// IndexedDB setup
const request = indexedDB.open("weatherDB", 1);
request.onerror = event => console.log('Database error:', event.target.error);
request.onsuccess = event => {
    db = request.result;
    updateUI(); 
};
request.onupgradeneeded = event => {
    let db = event.target.result;
    let objectStore = db.createObjectStore("weatherData", {autoIncrement: true});
};

// Function definitions
const getLocation = () => {
    return new Promise((resolve, reject) => {
        if (!confirm("We need your location to provide weather data. Do you allow us to access your location?")) {
            reject("User did not allow access to location.");
        } else if (navigator.geolocation) {
            // Define options object with enableHighAccuracy set to true
            const options = {
                enableHighAccuracy: true,
            };

            // Pass options object as the second parameter to getCurrentPosition
            navigator.geolocation.getCurrentPosition(
                position => {
                    latitude = position.coords.latitude;
                    longitude = position.coords.longitude;
                    resolve();
                },
                error => {
                    reject(console.log(error));
                },
                options
            );
        } else {
            reject("Geolocation is not supported by this browser.");
        }
    });
}

const handleLocationButtonClick = async () => {
    try {
        await getLocation();
    } catch (error) {
        console.log(error);
    }
}

const handleUnitsChange = async () => {
    const selectedOption = uiElements.selectElement.options[uiElements.selectElement.selectedIndex];
    convertUnits = selectedOption.value;  
    isUIUpdated = false;
    updateUI();
}

const handleGenerateButtonClick = async () => {
    try {
    let feelings = document.getElementById('feelings').value;
    let currentDate = new Date();
    let date = getCurrentDate(currentDate);
    let time = getCurrentTime(currentDate);
    if (latitude === undefined || longitude === undefined) {
    await handleLocationButtonClick();
    }
    const apiData = await fetchWeatherData(latitude, longitude);
    const newData = {
        temp: apiData.main.temp,
        date: date,
        content: feelings
    }
    const transaction = db.transaction(["weatherData"], "readwrite");
    const objectStore = transaction.objectStore("weatherData");
    objectStore.add(newData);
    isUIUpdated = false;
    updateUI();
    } catch(error) {
        console.log(error);
    }
}

const handleClearButtonClick = async () => {
    const transaction = db.transaction(["weatherData"], "readwrite");
    const objectStore = transaction.objectStore("weatherData");
    const request = objectStore.clear();
    request.onsuccess = () => {
        // Clear the UI entries as well
        uiElements.entryHolder.innerHTML = '';
        isUIUpdated = false;
        updateUI();
    }
    request.onerror = (event) => {
        console.log('Error clearing data:', event.target.error);
    }
}

const updateUI = async() => {
    try{
        const transaction = db.transaction(["weatherData"], "readonly");
        const objectStore = transaction.objectStore("weatherData");
        const request = objectStore.getAll();
        request.onsuccess = () => {
            if (!isUIUpdated) {
                // call a function that loops through array and render elements
                uiElements.entryHolder.innerHTML = '';
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
        entryDiv.classList.add('entryDiv');
        entryDiv.textContent = "No entries yet.";
        uiElements.entryHolder.prepend(entryDiv);
    } else {
        weatherData.forEach(entry => {
            createEntryContainer(entry.date,entry.temp,entry.content)
        });
    }
    isUIUpdated = true;
}

const getCurrentDate = (dateInstance) => new Intl.DateTimeFormat('en-US', dateOptions).format(dateInstance);
const getCurrentTime = (dateInstance) => new Intl.DateTimeFormat('en-US', timeOptions).format(dateInstance);

// UI Helper Functions
const createEntryContainer = (date,kelvin,content) => {
    const entryDiv = document.createElement('div');
    entryDiv.classList.add('entryDiv');
    const entryMeta = document.createElement('p');
    entryMeta.classList.add('entryMeta');
    entryMeta.innerHTML = `${entryInfoElement(date, kelvin)}`
    const entryContent = document.createElement('p');
    entryContent.classList.add('entryContent');
    entryContent.innerHTML = `${feelingsElement(content)}`
    entryDiv.appendChild(entryMeta)
    entryDiv.appendChild(entryContent);
    uiElements.entryHolder.prepend(entryDiv);
}
const entryInfoElement = (date, kelvin) => {
    return `${dateElement(date)} | ${temperatureElement(kelvin)}`;
}
const feelingsElement = (content) => `<p>${content}</p>`
const dateElement = (date) => `<span>${date}</span>`
const temperatureElement = (kelvin) => {
    if (convertUnits === "metric") {
        const metric = Math.round(kelvin - 273.15)
        return `<span>Temperature: ${metric}°C</span>`;
    }  
    else if (convertUnits === "imperial"){
        const imperial = (Math.round(kelvin - 273.15) * 9 / 5 + 32);
        return `<span>Temperature: ${imperial}°F</span>`;
    }
    else {
        return
    }
}

// GET request function
const fetchWeatherData = async (latitude, longitude) => {
    const res = await fetch(`/fetchWeatherData?lat=${latitude}&lon=${longitude}`);
    if (!res.ok) {
        throw new Error(`HTTP error!: ${res.status}`)
    }
    try {
      const data = await res.json();
      return data;
    } catch (error) {
      console.log('error', error);
    }
}
