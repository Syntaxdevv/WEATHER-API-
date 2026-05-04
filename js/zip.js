const starsEl = document.getElementById('stars');
if (starsEl) {
  for (let i = 0; i < 40; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    s.style.cssText = `
      width:${size}px;
      height:${size}px;
      top:${Math.random() * 100}%;
      left:${Math.random() * 100}%;
      animation-delay:${Math.random() * 3}s;
      animation-duration:${2 + Math.random() * 3}s;
    `;
    starsEl.appendChild(s);
  }
}
async function getCoords(input) {

  const isZip = /^\d+$/.test(input);

  let url = "";

  if (isZip) {
    url = `https://nominatim.openstreetmap.org/search?postalcode=${input}&country=Philippines&format=json`;
  } else {
    url = `https://nominatim.openstreetmap.org/search?q=${input},Philippines&format=json`;
  }

  const res = await fetch(url);
  const data = await res.json();

  if (!data.length) return null;

  return {
    lat: data[0].lat,
    lon: data[0].lon,
    name: data[0].display_name
  };
}

async function getWeather(lat, lon) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code&timezone=auto`
  );

  const data = await res.json();

  return {
    temp: data.current.temperature_2m,
    code: data.current.weather_code
  };
}
function generatePlaces(temp, code) {

  const isHot = temp >= 32;
  const isWarm = temp >= 26 && temp < 32;
  const isRainy = code >= 51 && code <= 82;

  let results = [];

  if (isRainy) {
    results.push({ icon: "🛍️", text: "Mall + Food Trip (Indoor safe)" });
    results.push({ icon: "☕", text: "Café hopping" });
    results.push({ icon: "🎮", text: "Arcade / Gaming" });
  }

  if (isHot) {
    results.push({ icon: "🏖️", text: "Beach / Waterpark" });
    results.push({ icon: "🌊", text: "Resort swimming" });
  }

  if (isWarm) {
    results.push({ icon: "🌄", text: "Nature + hiking" });
    results.push({ icon: "📸", text: "Scenic walk" });
  }

  results.push({ icon: "🍽️", text: "Food trip + night market" });

  return results;
}

function getVerdict(temp, code) {
  if (code >= 51 && code <= 82) return "⚠️ Rainy – Better stay indoors";
  if (temp >= 35) return "🔥 Very hot – Limit outdoor trips";
  if (temp >= 30) return "☀️ Good but warm";
  return "✅ Perfect weather to go out!";
}
async function checkZip() {
  const input = document.getElementById("zipInput").value.trim();
  const result = document.getElementById("zipResult");

  if (!input) return;

  result.innerHTML = "🔍 Analyzing...";

  const loc = await getCoords(input);

  if (!loc) {
    result.innerHTML = "❌ Location not found";
    return;
  }

  const weather = await getWeather(loc.lat, loc.lon);
  const places = generatePlaces(weather.temp, weather.code);
  const verdict = getVerdict(weather.temp, weather.code);

  result.innerHTML = `
    <div class="card main">
      <h3>📍 ${loc.name}</h3>
      <p>🌡️ ${weather.temp}°C</p>
      <p><strong>${verdict}</strong></p>
    </div>

    <h3 style="margin-top:15px;">✨ Best Places</h3>

    ${places.map(p => `
      <div class="card">
        <span class="icon">${p.icon}</span>
        <span>${p.text}</span>
      </div>
    `).join("")}
  `;
}