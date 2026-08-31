🌦️ Weather & Typhoon Tracker

A web-based weather dashboard that provides current weather information, forecasts, location-based weather data, and tropical cyclone tracking.

The project is designed as a simple and responsive weather monitoring tool using HTML, CSS, and JavaScript, with external APIs and map services for weather and location data.

✨ Features

- 🌡️ Current temperature and weather condition
- 💧 Humidity information
- 🌬️ Wind speed and direction
- 🌡️ Feels-like temperature
- 👁️ Visibility
- 🧭 Atmospheric pressure
- 📅 7-day weather forecast
- 📍 Current location detection
- 🔎 Search weather by city
- 🗺️ Interactive map
- 🌀 Tropical cyclone / typhoon tracking
- 🌧️ Weather map controls
- ⚠️ Weather condition alerts
- ☀️ Heat condition warnings
- 💡 Weather-based suggestions
- 🌙 Dark mode support

🛠️ Technologies Used

- HTML5 – Page structure
- CSS3 – Layout and styling
- JavaScript – Application logic and API integration
- Leaflet.js – Interactive maps
- Open-Meteo API – Weather and forecast data
- OpenStreetMap / Nominatim – Location and reverse geocoding
- Esri World Imagery – Satellite map layer
- Tropical cyclone data source – For storm/typhoon tracking

🌐 APIs & Data Sources

Open-Meteo

Used for:

- Current weather
- Temperature
- Humidity
- Wind
- Pressure
- Visibility
- Weather conditions
- Daily forecast

https://open-meteo.com/

Nominatim

Used for reverse geocoding and converting coordinates into location names.

https://nominatim.openstreetmap.org/

Leaflet

Used to display the interactive map and weather/storm markers.

https://leafletjs.com/

PAGASA

PAGASA is used as the primary reference for Philippine tropical cyclone information.

https://www.pagasa.dost.gov.ph/

«Storm information should always be verified through official weather agencies before making safety-related decisions.»

📂 Project Structure

weather-typhoon-tracker/
│
├── index.html
├── style.css
├── script.js
│
├── assets/
│   ├── images/
│   └── icons/
│
└── README.md

🚀 How to Run

1. Clone the repository.

git clone https://github.com/yourusername/weather-typhoon-tracker.git

2. Open the project folder.

cd weather-typhoon-tracker

3. Open "index.html" in your browser.

For the best experience, run the project using a local development server such as VS Code Live Server.

📍 Location Detection

The application can request the user's current location through the browser's Geolocation API.

If location access is unavailable or denied, the application uses a default location.

🌀 Typhoon Tracking

The map is designed to display tropical cyclone information using storm coordinates.

A storm can contain information such as:

{
    name: "Storm Name",
    category: "Typhoon",
    points: [
        {
            lat: 15.2,
            lon: 130.1,
            time: "2026-08-31 06:00",
            wind: 120
        }
    ]
}

The application can then display:

- Storm name
- Storm category
- Current/latest position
- Wind speed
- Observation time
- Storm track
- Previous storm positions

⚠️ Important

This project is intended for educational and demonstration purposes.

Weather and tropical cyclone information can change quickly. The application should not be used as a replacement for official warnings or emergency information from PAGASA and other authorized weather agencies.

🎓 Project Purpose

This project was created to practice:

- API integration
- JavaScript programming
- Asynchronous requests
- JSON data handling
- Interactive maps
- Geolocation
- Weather data visualization
- Tropical cyclone tracking
- Front-end web development

📌 Future Improvements

- [ ] Real-time Philippine tropical cyclone tracking
- [ ] Official storm forecast cone
- [ ] Storm movement direction
- [ ] Automatic storm data refresh
- [ ] Multiple active storm support
- [ ] Rain radar layer
- [ ] Wind visualization
- [ ] Severe weather notifications
- [ ] More detailed storm information
- [ ] Mobile UI improvements

👨‍💻 Author

Syntaxdev