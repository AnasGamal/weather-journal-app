# Weather Journal App

This is a dynamic single-page web application that allows the user to input their zip code and feelings to generate weather data based on the zip code and save a record along with user input feelings. It utilizes an external weather API to retrieve weather data and dynamically updates the UI to display the returned information. The app also has a responsive design that can adapt to different screen widths.

## Technologies and Dependencies

- JavaScript
- Express.js
- Node.js
- Body-Parser
- Cors
- OpenWeatherMap API

## Installation

1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Run `npm install` to install the required dependencies.
4. Create an account on OpenWeatherMap and acquire an API key.
5. In the `app.js` file, replace `<Your_API_Key_Here>` with your OpenWeatherMap API key.
6. Run `node server.js` to initiate the server.
7. Open the project in your browser at `http://localhost:3000`.

## Usage

1. Enter your zip code and your feelings in the input fields.
2. Click on the 'Generate' button to display the weather data and save the record.

## Capabilities and Functionality

- User can input a zip code and their feelings.
- The app utilizes an external weather API to retrieve real-time weather data.
- The app generates and displays the weather data based on the inputted zip code.
- The app saves a record along with the user input feelings.
- The app retrieves and displays the most recent record.
- The app has a responsive design that can adapt to different screen sizes.

Feel free to contact the project creator for any questions or feedback.
