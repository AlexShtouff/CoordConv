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

  const url = `https://www.govmap.gov.il/CoordinateConversionHandler.ashx?x=${x}&y=${y}&f=itm`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      currentLat = parseFloat(data.y).toFixed(6);
      currentLon = parseFloat(data.x).toFixed(6);

      document.getElementById("result").innerText =
        `GPS Coordinates:\nLatitude: ${currentLat}\nLongitude: ${currentLon}`;

      document.getElementById("mapButtons").style.display = "block";
    })
    .catch(error => {
      document.getElementById("result").innerText = "Error converting coordinates.";
      console.error("Conversion error:", error);
    });
}

function openInMaps() {
  if (currentLat && currentLon) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const lat = currentLat;
    const lon = currentLon;

    let url = isIOS
      ? `http://maps.apple.com/?ll=${lat},${lon}`
      : `geo:${lat},${lon}?q=${lat},${lon}`;

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
