# Weather Journal

## Introduction

The Weather Journal is an interactive web application designed to provide current weather information based on user's location and allow the users to keep a journal of their thoughts and feelings about the weather and other aspects of their day. The goal of the project is to demonstrate an understanding of server-side programming and frontend-backend integration, with a particular focus on working with APIs and handling HTTP requests.

## Technologies Used

- **Node.js:** This project is entirely written in JavaScript, including server-side code. Node.js provides the runtime for this server-side JavaScript code.

- **Express.js:** This web application framework for Node.js has been used to create the HTTP server, handle requests, and serve static files.

- **OpenWeather API:** Weather data for the specified location is fetched from this API.

- **Geolocation API:** The user's location is fetched using the Geolocation API, which is built into modern web browsers. This API allows the application to access the user's current latitude and longitude coordinates, which are then used to fetch the weather data.

- **IndexedDB:** This low-level API for client-side storage of significant amounts of structured data has been used for maintaining the user entries in the weather journal.

- **HTML, CSS, JavaScript:** Used to structure, style, and add interactivity to the web page.

- **Tailwind CSS:** A utility-first CSS framework used for rapidly building custom user interfaces.

## Installation Instructions

1. Clone the repository to your local machine using `git clone <repository-url>`.

2. Navigate to the cloned repository using `cd <cloned-repository>`.

3. Install the required Node.js packages using `npm install`.

4. Build your Tailwind CSS file using `npm run build:css`.

5. Start the server using `npm start`.

## Usage

1. Once the server is running, navigate to `http://localhost:3000` in your browser.

2. On the homepage, you can select your preferred units (metric or imperial) and click the "Get Location" button to provide your location.

3. Input your thoughts or feelings in the text area and click the "Add Entry" button. The current weather information along with your entry will be added to your journal.

4. Click the "Clear" button if you wish to delete all your entries.

## Project Structure

The project has two main files: `server.js` and `src/app.js`.

- `server.js` runs the server-side code, handling requests and responses, serving static files, and interacting with the OpenWeather API.

- `src/app.js` contains the client-side JavaScript code that interacts with the DOM, makes requests to the server, and manages the IndexedDB.
