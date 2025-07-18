// --- DOM Elements ---
const eastingInput = document.getElementById('easting');
const northingInput = document.getElementById('northing');
const convertBtn = document.getElementById('convert-btn');
const latResult = document.getElementById('latitude-result');
const lonResult = document.getElementById('longitude-result');
const latResultBox = document.getElementById('lat-result-box');
const lonResultBox = document.getElementById('lon-result-box');
const errorMessage = document.getElementById('error-message');
const manualActionsContainer = document.getElementById('manual-actions-container');

const csvUploadInput = document.getElementById('csv-upload');
const processCsvBtn = document.getElementById('process-csv-btn');
const csvResultsSection = document.getElementById('csv-results-section');
const csvResultsBody = document.getElementById('csv-results-body');
const csvErrorMessage = document.getElementById('csv-error-message');

const csvColumnSelection = document.getElementById('csv-column-selection');
const pointNameColumnSelect = document.getElementById('point-name-column');
const eastingColumnSelect = document.getElementById('easting-column');
const northingColumnSelect = document.getElementById('northing-column');

const myPointsSection = document.getElementById('my-points-section');
const myPointsContainer = document.getElementById('my-points-container');
const myPointsBtn = document.getElementById('my-points-btn');

const myLatSpan = document.getElementById('my-lat');
const myLonSpan = document.getElementById('my-lon');

let csvFileContent = null;
let userLocation = null; // To store {latitude, longitude}

const addPointBtn = document.getElementById('add-point-btn');
let lastConversion = null;

let modeToggleButton;
let modeDropdown;
const menuManualInput = document.getElementById('menu-manual-input');
const menuCsvUpload = document.getElementById('menu-csv-upload');

const manualInputInterface = document.getElementById('manual-input-interface');
const csvUploadInterface = document.getElementById('csv-upload-interface');


function showInterface(mode) {
    if (mode === 'manual') {
        manualInputInterface.style.display = 'block';
        csvUploadInterface.style.display = 'none';
        csvResultsSection.style.display = 'none';
        csvErrorMessage.textContent = '';
        errorMessage.textContent = '';
        csvColumnSelection.style.display = 'none';

        eastingInput.value = '';
        northingInput.value = '';
        latResult.textContent = '-';
        lonResult.textContent = '-';
        latResultBox.classList.remove('success');
        lonResultBox.classList.remove('success');
        manualActionsContainer.style.display = 'none';
        manualActionsContainer.innerHTML = '';
        addPointBtn.style.display = 'none';
        lastConversion = null;

    } else if (mode === 'csv') {
        manualInputInterface.style.display = 'none';
        csvUploadInterface.style.display = 'block';
        latResult.textContent = '-';
        lonResult.textContent = '-';
        latResultBox.classList.remove('success');
        lonResultBox.classList.remove('success');
        errorMessage.textContent = '';
        csvErrorMessage.textContent = '';
        manualActionsContainer.style.display = 'none';
        manualActionsContainer.innerHTML = '';
        addPointBtn.style.display = 'none';
        lastConversion = null;
        csvColumnSelection.style.display = 'none';
        csvResultsBody.innerHTML = '';
        csvResultsSection.style.display = 'none';
    }
    if (modeDropdown) {
        modeDropdown.classList.add('hidden');
    }
}

/**
 * Converts ITM (Israeli Transverse Mercator) coordinates to WGS84 (Latitude, Longitude).
 */
function convertITMtoWGS84(easting, northing) {
    // --- GRS80 Ellipsoid Parameters ---
    const a = 6378137; // Semi-major axis
    const f = 1 / 298.257222101; // Inverse flattening
    const e_sq = 2 * f - f ** 2; // Eccentricity squared
    const e_prime_sq = e_sq / (1 - e_sq);

    // --- ITM Projection Parameters ---
    const lat0_rad = 31.7343936111111 * Math.PI / 180;
    const lon0_rad = 35.2045169444444 * Math.PI / 180;
    const k0 = 1.0000067;
    const false_easting = 219529.584;
    const false_northing = 626907.39;

    const M0_coeff0 = 1 - e_sq / 4 - 3 * e_sq ** 2 / 64 - 5 * e_sq ** 3 / 256;
    const M0_coeff2 = 3 * e_sq / 8 + 3 * e_sq ** 2 / 32 + 45 * e_sq ** 3 / 1024;
    const M0_coeff4 = 15 * e_sq ** 2 / 256 + 45 * e_sq ** 3 / 1024;
    const M0_coeff6 = 35 * e_sq ** 3 / 3072;

    const M0 = a * (M0_coeff0 * lat0_rad - M0_coeff2 * Math.sin(2 * lat0_rad) + M0_coeff4 * Math.sin(4 * lat0_rad) - M0_coeff6 * Math.sin(6 * lat0_rad));

    const M = M0 + (northing - false_northing) / k0;
    const mu = M / (a * M0_coeff0);
    const e1 = (1 - Math.sqrt(1 - e_sq)) / (1 + Math.sqrt(1 - e_sq));

    const phi1_coeff2 = 3 * e1 / 2 - 27 * e1 ** 3 / 32;
    const phi1_coeff4 = 21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32;
    const phi1_coeff6 = 151 * e1 ** 3 / 96;
    const phi1_coeff8 = 1097 * e1 ** 4 / 512;

    const phi1 = mu + phi1_coeff2 * Math.sin(2 * mu) + phi1_coeff4 * Math.sin(4 * mu) + phi1_coeff6 * Math.sin(6 * mu) + phi1_coeff8 * Math.sin(8 * mu);

    const C1 = e_prime_sq * Math.cos(phi1) ** 2;
    const T1 = Math.tan(phi1) ** 2;
    const N1 = a / Math.sqrt(1 - e_sq * Math.sin(phi1) ** 2);
    const R1 = a * (1 - e_sq) / Math.pow(1 - e_sq * Math.sin(phi1) ** 2, 1.5);
    const D = (easting - false_easting) / (N1 * k0);

    const lat_rad_grs80 = phi1 - (N1 * Math.tan(phi1) / R1) * (D ** 2 / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * e_prime_sq) * D ** 4 / 24 + (61 + 90 * T1 + 298 * C1 + 45 * T1 ** 2 - 252 * e_prime_sq - 3 * C1 ** 2) * D ** 6 / 720);
    const lon_rad_grs80 = lon0_rad + (D - (1 + 2 * T1 + C1) * D ** 3 / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 ** 2 + 8 * e_prime_sq + 24 * T1 ** 2) * D ** 5 / 120) / Math.cos(phi1);

    const h_grs80 = 0;
    const sinLat_grs80 = Math.sin(lat_rad_grs80);
    const cosLat_grs80 = Math.cos(lat_rad_grs80);
    const sinLon_grs80 = Math.sin(lon_rad_grs80);
    const cosLon_grs80 = Math.cos(lon_rad_grs80);
    const N_grs80 = a / Math.sqrt(1 - e_sq * sinLat_grs80 ** 2);
    const X_grs80 = (N_grs80 + h_grs80) * cosLat_grs80 * cosLon_grs80;
    const Y_grs80 = (N_grs80 + h_grs80) * cosLat_grs80 * sinLon_grs80;
    const Z_grs80 = (N_grs80 * (1 - e_sq) + h_grs80) * sinLat_grs80;

    const dX = -24.0024, dY = -17.1032, dZ = -17.8444;
    const rX_arcsec = -0.33077, rY_arcsec = -1.85269, rZ_arcsec = 1.66969;
    const s_ppm = 5.4262;

    const toRadians = Math.PI / (180 * 3600);
    const rX = rX_arcsec * toRadians, rY = rY_arcsec * toRadians, rZ = rZ_arcsec * toRadians;
    const s_factor = s_ppm * 1e-6;

    const X_wgs84 = dX + (1 + s_factor) * X_grs80 - rZ * Y_grs80 + rY * Z_grs80;
    const Y_wgs84 = dY + rZ * X_grs80 + (1 + s_factor) * Y_grs80 - rX * Z_grs80;
    const Z_wgs84 = dZ - rY * X_grs80 + rX * Y_grs80 + (1 + s_factor) * Z_grs80;

    const a_wgs84 = 6378137, f_wgs84 = 1 / 298.257223563;
    const e_sq_wgs84 = 2 * f_wgs84 - f_wgs84 ** 2;
    const p = Math.sqrt(X_wgs84 ** 2 + Y_wgs84 ** 2);
    let lon_rad_wgs84 = Math.atan2(Y_wgs84, X_wgs84);
    let lat_rad_wgs84 = Math.atan2(Z_wgs84, p * (1 - e_sq_wgs84));

    for (let i = 0; i < 10; i++) {
        const lat_prev = lat_rad_wgs84;
        const N_wgs84 = a_wgs84 / Math.sqrt(1 - e_sq_wgs84 * Math.sin(lat_prev) ** 2);
        lat_rad_wgs84 = Math.atan2(Z_wgs84 + e_sq_wgs84 * N_wgs84 * Math.sin(lat_prev), p);
        if (Math.abs(lat_rad_wgs84 - lat_prev) < 1e-12) break;
    }

    return {
        latitude: lat_rad_wgs84 * 180 / Math.PI,
        longitude: lon_rad_wgs84 * 180 / Math.PI,
    };
}

/**
 * Calculates the distance between two lat/lon points in kilometers using the Haversine formula.
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}


// --- Event Listener for the single convert button ---
convertBtn.addEventListener('click', () => {
    latResult.textContent = '-';
    lonResult.textContent = '-';
    errorMessage.textContent = '';
    latResultBox.classList.remove('success');
    lonResultBox.classList.remove('success');
    manualActionsContainer.style.display = 'none';
    manualActionsContainer.innerHTML = '';
    addPointBtn.style.display = 'none';
    lastConversion = null;

    const easting = parseFloat(eastingInput.value);
    const northing = parseFloat(northingInput.value);

    if (isNaN(easting) || isNaN(northing)) {
        errorMessage.textContent = 'Please enter valid numeric coordinates.';
        return;
    }

    const result = convertITMtoWGS84(easting, northing);

    if (result) {
        const lat = result.latitude.toFixed(6);
        const lon = result.longitude.toFixed(6);
        latResult.textContent = lat;
        lonResult.textContent = lon;
        latResultBox.classList.add('success');
        lonResultBox.classList.add('success');

        const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
        const wazeUrl = `https://www.waze.com/ul?ll=${lat},${lon}&navigate=yes`;
        manualActionsContainer.innerHTML = `
            <a href="${googleMapsUrl}" target="_blank" class="map-button">Open in Google Maps</a>
            <a href="${wazeUrl}" target="_blank" class="map-button">Open in Waze</a>
        `;
        manualActionsContainer.style.display = 'flex';

        addPointBtn.style.display = 'inline-block';
        lastConversion = {
            easting: easting,
            northing: northing,
            latitude: result.latitude,
            longitude: result.longitude
        };
    } else {
         errorMessage.textContent = 'An unexpected error occurred during conversion.';
    }
});


addPointBtn.addEventListener('click', () => {
    if (lastConversion) {
        const pointName = prompt("Please enter a name for this point:", "Manual Point");
        if (pointName) { // Proceed only if user enters a name
            const { easting, northing, latitude, longitude } = lastConversion;

            appendToMyPoints(pointName, easting, northing, latitude, longitude);

            // Reset UI
            eastingInput.value = '';
            northingInput.value = '';
            latResult.textContent = '-';
            lonResult.textContent = '-';
            latResultBox.classList.remove('success');
            lonResultBox.classList.remove('success');
            manualActionsContainer.style.display = 'none';
            manualActionsContainer.innerHTML = '';
            addPointBtn.style.display = 'none';
            lastConversion = null;
        }
    }
});


csvUploadInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        csvResultsBody.innerHTML = '';
        csvResultsSection.style.display = 'none';
        csvColumnSelection.style.display = 'none';

        const reader = new FileReader();

        reader.onload = function(e) {
            csvFileContent = e.target.result;
            const headers = getCsvHeaders(csvFileContent);
            if (headers) {
                populateColumnSelectors(headers);
                csvErrorMessage.textContent = '';
                csvColumnSelection.style.display = 'block';
            } else {
                csvErrorMessage.textContent = 'Could not read CSV headers. Make sure the file is a valid CSV.';
                csvColumnSelection.style.display = 'none';
            }
        };

        reader.onerror = function() {
            csvErrorMessage.textContent = 'Error reading file.';
            csvColumnSelection.style.display = 'none';
        };

        reader.readAsText(file, 'windows-1255'); // Use Hebrew charset

    } else {
        csvErrorMessage.textContent = 'Please select a CSV file.';
        csvColumnSelection.style.display = 'none';
    }
});

function getCsvHeaders(csvText) {
    if (!csvText) return null;
    const firstLine = csvText.split('\n')[0].trim();
    return firstLine.replace(/^\uFEFF/, '').split(',').map(header => header.trim());
}

function populateColumnSelectors(headers) {
    pointNameColumnSelect.innerHTML = '';
    eastingColumnSelect.innerHTML = '';
    northingColumnSelect.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Choose a column...';
    defaultOption.disabled = true;
    defaultOption.selected = true;

    pointNameColumnSelect.appendChild(defaultOption.cloneNode(true));
    eastingColumnSelect.appendChild(defaultOption.cloneNode(true));
    northingColumnSelect.appendChild(defaultOption.cloneNode(true));

    headers.forEach(header => {
        const option = document.createElement('option');
        option.value = header;
        option.textContent = header;
        pointNameColumnSelect.appendChild(option.cloneNode(true));
        eastingColumnSelect.appendChild(option.cloneNode(true));
        northingColumnSelect.appendChild(option);
    });
}


processCsvBtn.addEventListener('click', () => {
    if (!csvFileContent) {
        csvErrorMessage.textContent = 'Please select a CSV file first.';
        return;
    }
    processCSVData(csvFileContent);
});

function processCSVData(csvText) {
    let lines = csvText.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');

    const selectedNameHeader = pointNameColumnSelect.value;
    const selectedEastingHeader = eastingColumnSelect.value;
    const selectedNorthingHeader = northingColumnSelect.value;

    if (!selectedNameHeader || !selectedEastingHeader || !selectedNorthingHeader) {
        csvErrorMessage.textContent = 'Please select columns for Point Name, Easting, and Northing.';
        return;
    }

    if (lines.length < 2) {
        csvErrorMessage.textContent = 'CSV file must contain a header and at least one data row.';
        return;
    }

    const headers = lines[0].split(',').map(header => header.trim());
    const nameColIndex = headers.indexOf(selectedNameHeader);
    const eastingColIndex = headers.indexOf(selectedEastingHeader);
    const northingColIndex = headers.indexOf(selectedNorthingHeader);

    if (nameColIndex === -1 || eastingColIndex === -1 || northingColIndex === -1) {
        csvErrorMessage.textContent = 'One or more selected columns not found in CSV headers.';
        return;
    }

    csvResultsBody.innerHTML = '';
    let hasValidData = false;

    for (let i = 1; i < lines.length; i++) {
        const rowData = lines[i].split(',');
        const pointName = rowData[nameColIndex] ? rowData[nameColIndex].trim() : `Row ${i+1}`;
        const originalEasting = rowData[eastingColIndex] ? rowData[eastingColIndex].trim() : '';
        const originalNorthing = rowData[northingColIndex] ? rowData[northingColIndex].trim() : '';

        const easting = parseFloat(originalEasting);
        const northing = parseFloat(originalNorthing);

        let lat = 'N/A', lon = 'N/A', rowClass = '', actionsHtml = '<td>-</td>';

        if (!isNaN(easting) && !isNaN(northing)) {
            const result = convertITMtoWGS84(easting, northing);
            if (result) {
                lat = result.latitude.toFixed(6);
                lon = result.longitude.toFixed(6);
                rowClass = 'success';
                hasValidData = true;

                appendToMyPoints(pointName, easting, northing, result.latitude, result.longitude);

                const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
                const wazeUrl = `https://www.waze.com/ul?ll=${lat},${lon}&navigate=yes`;

                actionsHtml = `
                    <td>
                        <a href="${googleMapsUrl}" target="_blank" class="map-button-csv google">Maps</a>
                        <a href="${wazeUrl}" target="_blank" class="map-button-csv waze">Waze</a>
                    </td>
                `;
            }
        }

        const row = `
            <tr class="${rowClass}">
                <td>${pointName}</td>
                <td>${originalEasting || '-'}</td>
                <td>${originalNorthing || '-'}</td>
                <td>${lat}</td>
                <td>${lon}</td>
                ${actionsHtml}
            </tr>
        `;
        csvResultsBody.insertAdjacentHTML('beforeend', row);
    }

    if (hasValidData) {
        csvResultsSection.style.display = 'block';
        csvErrorMessage.textContent = '';
        myPointsBtn.click(); // Open the "My Points" section to show the new additions
    } else {
        csvErrorMessage.textContent = 'No valid coordinates found in the CSV for the selected columns.';
        csvResultsSection.style.display = 'none';
    }
}

function appendToMyPoints(pointName, easting, northing, latitude, longitude) {
    const lat = latitude.toFixed(6);
    const lon = longitude.toFixed(6);

    let distanceText = 'Distance unavailable';
    if (userLocation) {
        const dist = calculateDistance(userLocation.latitude, userLocation.longitude, latitude, longitude);
        distanceText = `Distance from my location: <strong>${dist.toFixed(2)} km</strong>`;
    }

    const gmapUrl = `https://www.google.com/maps?q=${lat},${lon}`;
    const wazeUrl = `https://www.waze.com/ul?ll=${lat},${lon}&navigate=yes`;

    const pointCardHTML = `
        <div class="point-card">
            <div class="point-header">
                <h3 class="point-name">${pointName}</h3>
            </div>
            <div class="point-body">
                <div class="point-detail">
                    <span class="point-detail-label">Easting</span>
                    <span class="point-detail-value">${easting}</span>
                </div>
                 <div class="point-detail">
                    <span class="point-detail-label">Latitude</span>
                    <span class="point-detail-value">${lat}</span>
                </div>
                <div class="point-detail">
                    <span class="point-detail-label">Northing</span>
                    <span class="point-detail-value">${northing}</span>
                </div>
                <div class="point-detail">
                    <span class="point-detail-label">Longitude</span>
                    <span class="point-detail-value">${lon}</span>
                </div>
                <div class="point-distance">${distanceText}</div>
                <div class="point-actions">
                    <a href="${gmapUrl}" target="_blank" class="map-button-csv google">Google Maps</a>
                    <a href="${wazeUrl}" target="_blank" class="map-button-csv waze">Waze</a>
                </div>
            </div>
        </div>
    `;

    myPointsContainer.insertAdjacentHTML('beforeend', pointCardHTML);
    myPointsSection.classList.remove('hidden');
}

myPointsBtn.addEventListener('click', () => {
    myPointsSection.classList.toggle('hidden');
    // Hide or show the about section to make space
    document.getElementById('about-section').style.display = myPointsSection.classList.contains('hidden') ? 'block' : 'none';
});

document.addEventListener('DOMContentLoaded', () => {
    modeToggleButton = document.getElementById('options-menu');
    modeDropdown = document.getElementById('mode-dropdown');

    if (modeToggleButton && modeDropdown) {
        modeToggleButton.addEventListener('click', () => {
            modeDropdown.classList.toggle('hidden');
        });
    }

    if (menuManualInput) {
        menuManualInput.addEventListener('click', (event) => {
            event.preventDefault();
            showInterface('manual');
        });
    }

    if (menuCsvUpload) {
        menuCsvUpload.addEventListener('click', (event) => {
            event.preventDefault();
            showInterface('csv');
        });
    }

    // Close dropdown if clicking outside
    window.addEventListener('click', function(e) {
        if (modeDropdown && !modeToggleButton.contains(e.target) && !modeDropdown.contains(e.target)) {
            modeDropdown.classList.add('hidden');
        }
    });

    showInterface('manual');
});

// Get user's location
navigator.geolocation?.getCurrentPosition(
    position => {
        userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
        myLatSpan.textContent = userLocation.latitude.toFixed(6);
        myLonSpan.textContent = userLocation.longitude.toFixed(6);
    },
    error => {
        myLatSpan.textContent = 'Unavailable';
        myLonSpan.textContent = 'Unavailable';
        console.warn('Geolocation error:', error.message);
    }
);