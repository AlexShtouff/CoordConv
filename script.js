// Define IG05/12 projection (very similar to EPSG:2039 but used directly here)
proj4.defs("IG05", "+proj=tmerc +lat_0=31.7343936111111 +lon_0=35.2045169444444 +k=1.0000067 +x_0=219529.584 +y_0=626907.39 +ellps=GRS80 +units=m +no_defs");

let currentLat = null;
let currentLon = null;

function convert() {
  const x = parseFloat(document.getElementById("x").value);
  const y = parseFloat(document.getElementById("y").value);

  if (isNaN(x) || isNaN(y)) {
    document.getElementById("result").innerText = "Please enter valid coordinates.";
    document.getElementById("mapButtons").style.display = "none";
    return;
  }

  try {
    const [lon, lat] = proj4("IG05", "WGS84", [x, y]);
    currentLat = lat.toFixed(6);
    currentLon = lon.toFixed(6);

    document.getElementById("result").innerText =
      `GPS Coordinates:\nLatitude: ${currentLat}\nLongitude: ${currentLon}`;

    document.getElementById("mapButtons").style.display = "block";
  } catch (error) {
    document.getElementById("result").innerText = "Error converting coordinates.";
    document.getElementById("mapButtons").style.display = "none";
  }
}

function openInMaps() {
  if (currentLat && currentLon) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const lat = currentLat;
    const lon = currentLon;

    let url = "";

    if (isIOS) {
      url = `http://maps.apple.com/?ll=${lat},${lon}`;
    } else {
      url = `geo:${lat},${lon}?q=${lat},${lon}`;
    }

    const fallback = `https://maps.google.com/?q=${lat},${lon}`;

    window.location.href = url;

    setTimeout(() => {
      window.open(fallback, "_blank");
    }, 500);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("convertBtn").addEventListener("click", convert);
  document.getElementById("openMapsBtn").addEventListener("click", openInMaps);
});
