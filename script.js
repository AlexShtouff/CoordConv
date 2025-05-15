<script src="https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.7.6/proj4.js"></script>
<script>
  // Определение системы координат EPSG:2039 (Israeli TM Grid)
  proj4.defs("EPSG:2039", "+proj=tmerc +lat_0=31.7343936111111 +lon_0=35.2045169444444 +k=1.0000067 +x_0=219529.584 +y_0=626907.39 +ellps=GRS80 +units=m +no_defs");

  let currentLat = null;
  let currentLon = null;

  function convert() {
    const xInput = document.getElementById("x").value.trim();
    const yInput = document.getElementById("y").value.trim();
    const x = parseFloat(xInput);
    const y = parseFloat(yInput);

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
      const lat = currentLat;
      const lon = currentLon;

      let url = isIOS
        ? `http://maps.apple.com/?ll=${lat},${lon}`
        : `geo:${lat},${lon}?q=${lat},${lon}`;

      const fallback = `https://maps.google.com/?q=${lat},${lon}`;

      window.location.href = url;

      setTimeout(() => {
        try {
          window.open(fallback, "_blank");
        } catch (e) {
          alert("Could not open map. Please try manually: " + fallback);
        }
      }, 500);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("convertBtn").addEventListener("click", convert);
    document.getElementById("openMapsBtn").addEventListener("click", openInMaps);
  });
</script>
