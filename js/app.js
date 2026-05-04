let radarGlow;
let map, tileLayer, marker;
let radarCircle, radarInterval;
let currentLat = 15.145;
let currentLon = 120.5887;

// Function to get the users current location using the Geolocation API
function getUserLocation() {
  if (!navigator.geolocation) {
    loadDefaultCity();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      currentLat = pos.coords.latitude;
      currentLon = pos.coords.longitude;

      initMap();
      fetchWeatherByCoords(currentLat, currentLon);
      startRadar(currentLat, currentLon);
      console.log("LOCATION:", { latitude: currentLat, longitude: currentLon }); // Fixed logging
    },
    () => loadDefaultCity(),
    { enableHighAccuracy: true, timeout: 6000 }
  );
}

// Function to load the default city
function loadDefaultCity() {
  initMap();
  document.getElementById("cityInput").value = "Angeles";
  getWeather();
}

// Function to update the clock
function updateClock() {
  const now = new Date();

  document.getElementById("clock").innerHTML = `
    <div class="clock-date">
      📅 ${now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })}
    </div>
    <div class="clock-time">
      ${now.toLocaleTimeString('en-US', { hour12: true })}
    </div>
  `;
}
setInterval(updateClock, 1000);
updateClock();

// Function to toggle between light and dark themes
function toggleTheme() {
  const html = document.documentElement;
  const btn = document.getElementById("themeBtn");

  const isDark = html.getAttribute("data-theme") === "dark";

  html.setAttribute("data-theme", isDark ? "light" : "dark");
  btn.textContent = isDark ? "☀️" : "🌙";

  localStorage.setItem("theme", isDark ? "light" : "dark");

  setTimeout(() => map?.invalidateSize(), 200);
}

// Function to initialize the map with the current location
function initMap() {
  if (!window.L) return;

  if (map) map.remove();

  map = L.map("map").setView([currentLat, currentLon], 12);

  tileLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 19 }
  ).addTo(map);

  marker = L.marker([currentLat, currentLon], {
    icon: makeIcon()
  }).addTo(map);

  map.on("click", (e) => {
    const { lat, lng } = e.latlng;

    fetchWeatherByCoords(lat, lng);
  });
}

// Function to create a custom icon for the map marker
function makeIcon() {
  return L.divIcon({
    html: `<div style="
      width:18px;height:18px;
      background:#38bdf8;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:2px solid white;
      box-shadow:0 0 12px rgba(56,189,248,0.8)
    "></div>`,
    className: ""
  });
}

// Function to move the map to a new location and update the marker
function moveMap(lat, lon) {
  currentLat = lat;
  currentLon = lon;

  map.setView([lat, lon], 12);

  if (marker) marker.remove();

  marker = L.marker([lat, lon], {
    icon: makeIcon()
  }).addTo(map);

  startRadar(lat, lon);
}

// Function to start a radar animation on the map
function startRadar(lat, lon) {
  if (!map) return;

  if (radarCircle) map.removeLayer(radarCircle);
  if (radarGlow) map.removeLayer(radarGlow); // ✅ ADD THIS
  if (radarInterval) clearInterval(radarInterval);

  let radius = 500;

  radarCircle = L.circle([lat, lon], {
    radius,
    color: "#38bdf8",
    weight: 2,
    opacity: 0.8,
    fillColor: "#38bdf8",
    fillOpacity: 0.15
  }).addTo(map);

  radarGlow = L.circle([lat, lon], {
    radius: radius * 2,
    color: "#22c55e",
    weight: 1,
    opacity: 0.4,
    fillColor: "#22c55e",
    fillOpacity: 0.05
  }).addTo(map);

  radarInterval = setInterval(() => {
    radius += 400;
    if (radius > 8000) radius = 500;

    radarCircle.setRadius(radius);
    radarGlow.setRadius(radius * 2);

    const pulse = Math.abs(Math.sin(radius / 1000));

    radarCircle.setStyle({
      fillOpacity: 0.10 + pulse * 0.15,
      opacity: 0.6 + pulse * 0.4
    });

    radarGlow.setStyle({
      fillOpacity: 0.03 + pulse * 0.08
    });

  }, 80);
}

// Function to fetch weather data
async function fetchWeatherByCoords(lat, lon) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,visibility` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise&timezone=auto&forecast_days=7`
  );

  const data = await res.json();

  const loc = await getLocationName(lat, lon);

renderWeather(data, loc.name, loc.country, loc.region);
  moveMap(lat, lon);
  
  const decisions = generateSmartDecisions(
    c.temperature_2m,
    c.apparent_temperature,
    c.weather_code,
    c.wind_speed_10m,
    c.relative_humidity_2m
  );
  
  renderDecisions(decisions);

  
}

// Function to get the location name
async function getLocationName(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
    );

    const data = await res.json();

    console.log("Nominatim response:", data);

    return {
      name:
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.municipality ||
        data.display_name.split(",")[0],
      country: data.address.country_code?.toUpperCase() || "",
      region: data.address.state || ""
    };

  } catch (err) {
    console.log(err);
    return { name: "Unknown", country: "", region: "" };
  }
}

// Function to fetch weather data for a city entered by the user
async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return;

  const btn = document.querySelector(".search button");
  btn.disabled = true;
  btn.textContent = "Loading...";

  try {
    const geo = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
    );
    const geoData = await geo.json();

    if (!geoData.results?.length) return alert("City not found");

    const { latitude, longitude, name, country_code, admin1 } = geoData.results[0];

    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,visibility` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise&timezone=auto&forecast_days=7`
    );

    const data = await res.json();

    renderWeather(data, name, country_code, admin1);
    moveMap(latitude, longitude);

  } catch (e) {
    console.log(e);
  }

  btn.disabled = false;
  btn.textContent = "Search";
}

function heatWarning(feels) {
  if (feels < 27) return { level: "Safe", color: "#22c55e" };
  if (feels < 32) return { level: "Caution", color: "#facc15" };
  if (feels < 41) return { level: "Extreme Caution", color: "#fb923c" };
  if (feels < 54) return { level: "Danger", color: "#ef4444" };
  return { level: "Extreme Danger", color: "#b91c1c" };
}

function showHeatPopup(hw) {
  const old = document.getElementById("heatPopup");
  if (old) old.remove();

  if (hw.level === "Safe") return;

  const popup = document.createElement("div");
  popup.id = "heatPopup";
  popup.innerText = getHeatMessage(hw.level);

  popup.style.position = "fixed";
  popup.style.bottom = "30px";
  popup.style.right = "30px";
  popup.style.padding = "14px 20px";
  popup.style.borderRadius = "14px";
  popup.style.background = hw.color;
  popup.style.color = "#fff";
  popup.style.fontWeight = "600";
  popup.style.boxShadow = "0 10px 30px rgba(0,0,0,0.4)";
  popup.style.zIndex = "9999";

  document.body.appendChild(popup);

  setTimeout(() => popup.remove(), 4000);
}

function getHeatMessage(level) {
  console.log("Heat level:", level);
  if (level === "Caution") return "💧 Stay hydrated!";
  if (level === "Extreme Caution") return "☀️ Avoid sun exposure!";
  if (level === "Danger") return "🚨 High heat! Stay indoors!";
  if (level === "Extreme Danger") return "🆘 Heat stroke risk!";
  return "";
}
function renderWeather(data, name, country, region) {
  const c = data.current;
  const d = data.daily;

  set("city", name);
  set("country", region ? `${region}, ${country}` : country);

  set("temp", `${Math.round(c.temperature_2m)}°C`);
  set("icon", wmoIcon(c.weather_code));
  set("desc", wmoDesc(c.weather_code));

  set("hum", `${c.relative_humidity_2m}%`);
  set("wind", `${Math.round(c.wind_speed_10m)} km/h ${windDir(c.wind_direction_10m)}`);
  set("feel", `${Math.round(c.apparent_temperature)}°C`);
  set("vis", `${(c.visibility / 1000).toFixed(0)} km`);
  set("pressure", `${Math.round(c.surface_pressure)} hPa`);

  const feels = c.apparent_temperature;
  const hw = heatWarning(feels);

  set("heatIndex", `${Math.round(feels)}°C`);
  set("heatLevel", hw.level);

  const heatEl = document.getElementById("heatLevel");
  if (heatEl) heatEl.style.color = hw.color;

  const heatCard = document.querySelector(".heat-card");
  if (heatCard) {
    heatCard.classList.toggle(
      "heat-danger",
      hw.level === "Danger" || hw.level === "Extreme Danger"
    );
  }

  showHeatPopup(hw);
  renderForecast(d);

  // ✅ SMART DECISIONS (FIXED)
  const decisions = generateSmartDecisions(
    c.temperature_2m,
    c.apparent_temperature,
    c.weather_code,
    c.wind_speed_10m,
    c.relative_humidity_2m
  );

  renderDecisions(decisions);
}

function renderForecast(d) {
  const el = document.getElementById("forecast");
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  el.innerHTML = d.time.map((t, i) => {
    const dt = new Date(t);

    return `
      <div class="day">
        <div>${i === 0 ? "Today" : days[dt.getDay()]}</div>
        <div>${wmoIcon(d.weather_code[i])}</div>
        <div>${Math.round(d.temperature_2m_max[i])}°</div>
        <div>${Math.round(d.temperature_2m_min[i])}°</div>
      </div>
    `;
  }).join('');
}
function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function windDir(d) {
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(d / 45) % 8];
}

function wmoIcon(c) {
  return c === 0 ? "☀️"
    : c <= 2 ? "⛅"
    : c <= 65 ? "🌧️"
    : "⛈️";
}

function wmoDesc(c) {
  return c === 0 ? "Clear"
    : c <= 2 ? "Cloudy"
    : c <= 65 ? "Rain"
    : "Storm";
}

window.addEventListener("load", () => {
  document.documentElement.setAttribute(
    "data-theme",
    localStorage.getItem("theme") || "dark"
  );

  getUserLocation();
});


function generateSmartDecisions(temp, feels, code, wind, humidity) {
  const decisions = [];

  const isHot = temp >= 32;
  const isWarm = temp >= 26 && temp < 32;
  const isRainy = code >= 51 && code <= 82;
  const isWindy = wind > 25;

  // 🌧️ Rain logic
  if (isRainy) {
    decisions.push("☂️ Bring an umbrella");
    decisions.push("🏠 Better stay indoors");
  }

  // 🔥 Heat logic
  if (isHot) {
    decisions.push("🥵 Avoid going out at noon");
    decisions.push("💧 Drink more water");
  }

  // 🌤️ Good weather
  if (isWarm && !isRainy) {
    decisions.push("🏃 Perfect time for jogging");
    decisions.push("📸 Great weather for photos");
  }

  // 🌬️ Wind
  if (isWindy) {
    decisions.push("🌬️ It's windy—secure loose items");
  }

  // 💦 Humidity
  if (humidity > 80) {
    decisions.push("😓 High humidity—expect discomfort");
  }

  // 👕 Outfit suggestion (important!)
  if (isRainy) {
    decisions.push("🧥 Wear light jacket");
  } else if (isHot) {
    decisions.push("👕 Wear light clothes");
  } else {
    decisions.push("👖 Comfortable outfit recommended");
  }

  return decisions;
}

function renderDecisions(list) {
  const box = document.getElementById("decisionBox");
  if (!box) return;

  box.innerHTML = list
    .map(item => `<div class="decision-item">${item}</div>`)
    .join("");
}