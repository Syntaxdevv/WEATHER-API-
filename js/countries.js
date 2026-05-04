document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("compareBtn");
  if (btn) {
    btn.addEventListener("click", compareCities);
  }
});

async function getWeather(city) {
  try {
    const geo = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
    );

    const geoData = await geo.json();

    if (!geoData.results || geoData.results.length === 0) {
      return null;
    }

    const { latitude, longitude, name } = geoData.results[0];

    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`
    );

    const data = await res.json();

    return {
      name,
      temp: data.current.temperature_2m
    };

  } catch (err) {
    console.log("API Error:", err);
    return null;
  }
}

async function compareCities() {
  const city1 = document.getElementById("city1").value.trim();
  const city2 = document.getElementById("city2").value.trim();
  const resultBox = document.getElementById("result");

  if (!city1 || !city2) {
    resultBox.innerHTML = "⚠️ Please enter both cities";
    return;
  }

  resultBox.innerHTML = "Loading...";

  const a = await getWeather(city1);
  const b = await getWeather(city2);

  if (!a || !b) {
    resultBox.innerHTML = "❌ City not found";
    return;
  }

  const winner =
    a.temp > b.temp
      ? `${a.name} is hotter 🔥`
      : b.temp > a.temp
      ? `${b.name} is hotter 🔥`
      : "Same temperature 🌤️";

  resultBox.innerHTML = `
    <div class="city-card">
      <div>${a.name}</div>
      <div class="city-temp">${a.temp}°C</div>
    </div>

    <div class="city-card">
      <div>${b.name}</div>
      <div class="city-temp">${b.temp}°C</div>
    </div>

    <div class="winner-label">${winner}</div>
  `;
}