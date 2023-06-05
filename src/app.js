// Global Variables
let isUIUpdated = false;
let db;
let latitude;
let longitude;
let searchTimeout;
let dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
let timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true, timeZoneName: 'short' };
// TODO: add an error container to the UI
// TODO: prevent from submitting an empty feelings field
// TODO: display errors in the error UI container


// UI Elements
const uiElements = {
    selectElement: document.getElementById('units'),
    entryHolder: document.getElementById('entryHolder'),
    generateButton: document.getElementById('generate'),
    clearButton: document.getElementById('clear'),
    locationButton: document.getElementById('getLocation'),
    exportButton: document.getElementById('export'),
    importButton: document.getElementById('import'),
    fileInputButton: document.getElementById('fileInput'),
    autoCompleteContainer: document.getElementById('autocompleteContainer'),
    autocompleteInput: document.getElementById('autocompleteInput'),
    dropdownEl: document.getElementById('dropdown'),
}

// Global Variables that depend on the UI
let convertUnits = uiElements.selectElement.options[uiElements.selectElement.selectedIndex].value;
let selectedCity = uiElements.autocompleteInput.value;
let locationFromCoords = false; // Flag to check if the location is obtained from the Geolocation API
let locationFromSearch; // Flag to check if the location is obtained from the search bar

// If the search bar is not empty at load then the location is obtained from the search bar unless user clicks on the location button
if (selectedCity !== '') { 
    locationFromSearch = true;
} else locationFromSearch = false; 

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
    objectStore.createIndex("date", "date", {unique: false});
    objectStore.createIndex("temp", "temp", {unique: false});
    objectStore.createIndex("content", "content", {unique: false});
};

// Function definitions

const handleKeyUp = async () => {
    clearTimeout(searchTimeout);
    // TODO: consider using trim() to remove leading and trailing spaces
    let query = uiElements.autocompleteInput.value;
    // indicate that the location is obtained from the search bar and not from the Geolocation API
    locationFromCoords = false;
    if (query === '') {
      hideDropDown();
      // handle empty city input asynchonously
      locationFromSearch = false;
    } else {
      // wait 1 second before making the API call
      searchTimeout = setTimeout(async () => {
    try {
    const results = await searchCity(query);
    locationFromSearch = true;
    renderOptions(results);
    } catch (error) {
    console.log('error', error);
    }
    }, 1000);
  }
}

const renderOptions = (results) => {
    const dropDownResults = document.createElement('div');
    if (results.length > 0) {
    results.map(result => {
      const dropDownResult = document.createElement('div');
      dropDownResult.classList.add('dropDownResult');
      dropDownResult.textContent = result;
      dropDownResult.addEventListener('click', () => selectOption(result));
      dropDownResults.appendChild(dropDownResult);
    });
  } else {
    const dropDownResult = document.createElement('div');
    dropDownResult.classList.add('dropDownResult');
    dropDownResult.textContent = "No results found.";
    dropDownResults.appendChild(dropDownResult);
  }
  // make sure the dropdown is empty before appending the new results
  uiElements.dropdownEl.innerHTML = '';
  uiElements.dropdownEl.appendChild(dropDownResults);
  uiElements.dropdownEl.classList.remove('hidden');
}

const selectOption = (name) => {
    uiElements.autocompleteInput.value = name;
    selectedCity = name;
    hideDropDown();
}

const hideDropDown = () => uiElements.dropdownEl.classList.add('hidden');

const handleImportButtonClick = () => {
    // Trigger the file input selection
    uiElements.fileInputButton.click();
}

const handleExportButtonClick = () => {
    const transaction = db.transaction("weatherData", "readonly");
    const objectStore = transaction.objectStore("weatherData");
    const request = objectStore.getAll();
    request.onsuccess = event => {
        const data = event.target.result;
        const dataString = JSON.stringify(data);
        const blob = new Blob([dataString], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "weatherData.json";
        a.click();
        a.remove();
    }
}

const handleImportFileChange = (event) => {
    const file = event.target.files[0];
  
    // Create a file reader to read the imported file
    const reader = new FileReader();
    reader.onload = () => {
      const importedData = reader.result; // Use reader.result to access the imported data
      try {
        // Parse the imported data as JSON
        const data = JSON.parse(importedData);
  
        // Clear the existing data in IndexedDB
        const transaction = db.transaction(["weatherData"], "readwrite");
        const objectStore = transaction.objectStore("weatherData");
        const clearRequest = objectStore.clear();
  
        clearRequest.onsuccess = () => {
          // Add the imported data to IndexedDB
          data.forEach((entry) => {
            objectStore.add(entry);
          });
  
          // Update the UI to display the imported data
          isUIUpdated = false;
          updateUI();
        };
  
        clearRequest.onerror = (event) => {
          console.log('Error clearing data:', event.target.error);
        };
      } catch (error) {
        console.log('Error importing data:', error);
      }
    };
  
    // Read the file as text
    reader.readAsText(file);
  };  

const handleImportFileLoad = (event) => {
    const importedData = event.target.result;
    
    try {
      // Parse the imported data as JSON
      const data = JSON.parse(importedData);
      
      // Clear the existing data in IndexedDB
      const transaction = db.transaction(["weatherData"], "readwrite");
      const objectStore = transaction.objectStore("weatherData");
      const clearRequest = objectStore.clear();
      
      clearRequest.onsuccess = () => {
        // Add the imported data to IndexedDB
        data.forEach((entry) => {
          objectStore.add(entry);
        });
        
        // Update the UI to display the imported data
        isUIUpdated = false;
        updateUI();
      };
      
      clearRequest.onerror = (event) => {
        console.log('Error clearing data:', event.target.error);
      };
    } catch (error) {
      console.log('Error importing data:', error);
    }
};

// TODO: Refactor to use modern Promise syntax
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
            // Indicate that the location was obtained from the geolocation API and not from the search input
            locationFromCoords = true;
            locationFromSearch = false;
        }
         else {
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
    convertUnits = uiElements.selectElement.options[uiElements.selectElement.selectedIndex].value;  
    isUIUpdated = false;
    updateUI();
}

const handleGenerateButtonClick = async () => {
    try {
    let feelings = document.getElementById('feelings').value;
    let currentDate = new Date();
    let date = getCurrentDate(currentDate);
    // TODO: set up time variable for later integration
    let time = getCurrentTime(currentDate);
    // TODO: Handle those errors through a better UI 
    if (!locationFromSearch && !locationFromCoords) {
      alert ("Please enter a city name or click on the location button to get weather data.");
      return;
    }
    if (feelings === '') {
      alert ("Please enter your journal entry.");
      return;
    }
    // Destructuring assignment to get the temperature from the returned object
    const { main: {temp}} = await fetchWeatherData(latitude, longitude, selectedCity);
    const journalEntry = {
        temp, 
        date: date,
        content: feelings
    };
    const transaction = db.transaction(["weatherData"], "readwrite");
    const objectStore = transaction.objectStore("weatherData");
    objectStore.add(journalEntry);
    isUIUpdated = false;
    document.getElementById('feelings').value = ''; // reset the input fields
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

// Event Listeners
uiElements.generateButton.addEventListener('click', handleGenerateButtonClick);
uiElements.locationButton.addEventListener('click', async () => {await handleLocationButtonClick()});
uiElements.clearButton.addEventListener('click', handleClearButtonClick);
uiElements.selectElement.addEventListener('change', handleUnitsChange);
uiElements.exportButton.addEventListener('click', handleExportButtonClick);
uiElements.importButton.addEventListener('click', handleImportButtonClick);
uiElements.fileInputButton.addEventListener('change', handleImportFileChange);
uiElements.autoCompleteContainer.addEventListener('click', (event) => {
    event.stopImmediatePropagation();
  });
uiElements.autocompleteInput.addEventListener('keyup', handleKeyUp);
document.addEventListener('click', hideDropDown);

// GET request function
const fetchWeatherData = async (latitude, longitude) => {
    let res;
    if (locationFromSearch) {
    res = await fetch(`/fetchWeatherData?city=${selectedCity}`);
    } else if (locationFromCoords) {
      res = await fetch(`/fetchWeatherData?lat=${latitude}&lon=${longitude}`);
    }
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

const searchCity = async (query) => {
    try {
        const response = await fetch('/city', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: query }),
        });

        if (!response.ok) {
          throw new Error('Request failed with status: ' + response.status);
        }
    
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
}