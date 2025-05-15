proj4.defs("EPSG:2039", "+proj=tmerc +lat_0=31.7343936111111 +lon_0=35.2045169444444 +k=1.0000067 +x_0=219529.584 +y_0=626907.39 +ellps=GRS80 +units=m +no_defs");

let currentLat = null;
let currentLon = null;

function convert() {
  const x = parseFloat(document.getElementById("x").value);
  const y = parseFloat(document.getElementById("y").value);

  if (isNaN(x) || isNaN(y)) {
    currentLat = null;
    currentLon = null;
    document.getElementById("result").innerText = "Please enter valid coordinates.";
    document.getElementById("mapButtons").style.display = "none";
    return;
  }

  const [lon, lat] = proj4("EPSG:2039", "WGS84", [x, y]);
  currentLat = lat.toFixed(6);
  currentLon = lon.toFixed(6);

  document.getElementById("result").innerText =
    `GPS Coordinates:\nLatitude: ${currentLat}\nLongitude: ${currentLon}`;
  document.getElementById("mapButtons").style.display = "block";
}

function openInMaps() {
  if (currentLat && currentLon) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const url = isIOS
      ? `http://maps.apple.com/?ll=${currentLat},${currentLon}`
      : `geo:${currentLat},${currentLon}?q=${currentLat},${currentLon}`;
    const fallback = `https://maps.google.com/?q=${currentLat},${currentLon}`;

    window.location.href = url;

    setTimeout(() => {
      window.open(fallback, "_blank");
    }, 500);
  }
}

// Назначаем обработчики сразу, т.к. DOM уже загружен
document.getElementById("convertBtn").addEventListener("click", convert);
document.getElementById("openMapsBtn").addEventListener("click", openInMaps);
