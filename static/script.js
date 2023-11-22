import createPopup from './modules/popup.mjs';
import createIcon from './modules/icon.mjs';
import fetchData from './modules/data.mjs';
import getRotation from './modules/rotation.mjs';
import getCountry from './modules/lookup.mjs';
import addNode, { findNode, removeNode } from './modules/tree.mjs';
import createLatLng, { createLatLngs } from './modules/latlng.mjs';
import createFilterForm, { createFilters, addOptions, isEligible, 
	isMatch, resetMatches } from './modules/filter.mjs';

const leaflet = (function() {
	const overlayTree = {
		label: 'Overlays',
		selectAllCheckbox: 'Un/select all',
		children: [
			{
				label: 'Weather',
				selectAllCheckbox: true,
				collapsed: true,
				children: [
					{
						label: 'Temperature',
						layer: L.tileLayer(
							'https://tile.openweathermap.org/map/'
							+ 'temp_new/{z}/{x}/{y}.png' 
							+ '?appid=e81823873f6d856e087c25ebb4b3eb26', {
								attribution: '&copy; ' 
									+ '<a href="https://openweathermap.org">'
									+ 'OpenWeatherMap</a>',
								maxZoom: 20})
					},
					{
						label: 'Precipitation',
						layer: L.tileLayer(
							'https://tile.openweathermap.org/map/'
							+ 'precipitation_new/{z}/{x}/{y}.png'
							+ '?appid=e81823873f6d856e087c25ebb4b3eb26', {
								attribution: '&copy; ' 
									+ '<a href="https://openweathermap.org">'
									+ 'OpenWeatherMap</a>',
								maxZoom: 20})
					}
				]
			}
		]
	};
	let map;
	let controls;

	const addCity = function(latLng, { name = '', iata = '' } = {}) {
		const icon = createIcon('city', 'location-dot');
		const popup = createPopup(
			name, {
				'Code': iata, 
				'Latitude': latLng.lat, 
				'Longitude': latLng.lng
			});
		const marker = L.marker(latLng, {icon: icon}).bindPopup(popup);

		addNode(findNode(overlayTree, 'Cities'), name, { layer: marker });
	};

	const addFlight = function(latLng, originLatLng, destinationLatLng, 
		{ name = '', origin = '', destination = '', arrival = '', 
			departure = ''} = {}) {
		const icon = createIcon('flight', 'plane', 
			{ transformValue: getRotation(
				destinationLatLng, originLatLng, latLng) });
		const popup = createPopup(
			`Flight ${name}`, {
				'Origin': origin, 
				'Destination': destination, 
				'Arrival': arrival, 
				'Departure': departure });
		const path = L.geodesic(
			createLatLngs(destinationLatLng, latLng, originLatLng), 
			{ color: '#274768' });
		const marker = L.marker(latLng, { icon: icon, zIndexOffset: 1000 })
			.bindPopup(popup)
			.on('popupopen', function() { path.addTo(map); })
			.on('popupclose', function() { path.removeFrom(map); })
			.on('move', function(event) {
				path.setLatLngs(
					createLatLngs(destinationLatLng, event.latlng, 
						originLatLng));
			});

		addNode(findNode(overlayTree, 'Flights'), name, { layer: marker });
	}

	const addMarkers = function(flights, cities) {
		resetMatches('nation', 'airport');

		for (let i = 0; i < flights.length; i++) {
			const flight = flights[i];
			const carrier = flight[2];
			const originIATA = flight[4];
			const destinationIATA = flight[5];
			const originCountry = getCountry(originIATA);
			const destinationCountry = getCountry(destinationIATA);
			const origin = cities[originIATA];
			const destination = cities[destinationIATA];
			const flightName = carrier + flight[3];
			const included = isEligible('carrier', carrier) 
				&& isEligible('airport', originIATA, 
					{ value2: destinationIATA })
				&& isEligible('nation', originCountry, 
					{ value2: destinationCountry });

			addOptions('carrier', carrier);
			addOptions('airport', originIATA, destinationIATA);
			addOptions('nation', originCountry, destinationCountry);
			
			if (included) {
				const originLatLng = createLatLng(origin);
				const destinationLatLng = createLatLng(destination);
				const flightLatLng = L.latLng(flight[0], flight[1]);

				addNode(overlayTree, 'Markers');

				const subtree = findNode(overlayTree, 'Markers');
		
				addNode(subtree, 'Cities');
				addNode(subtree, 'Flights');

				addFlight(flightLatLng, originLatLng, destinationLatLng, 
					{ name: flightName, origin: originIATA, 
						destination: destinationIATA, arrival: flight[8],
						departure: flight[9] });

				if (origin) {
					addCity(originLatLng, 
						{ name: origin.stationname, iata: originIATA });
				}

				if (destination) {
					addCity(destinationLatLng, { name: destination.stationname, 
							iata: destinationIATA });
				}
			} else {
				const subtree = findNode(overlayTree, 'Markers');

				if (subtree) {
					const citiesSubtree = findNode(overlayTree, 'Cities');
					const flightsSubtree = findNode(overlayTree, 'Flights');

					if (citiesSubtree) {
						if (origin) {
							const matched = (isMatch('nation', originCountry) 
								|| isMatch('airport', originIATA));

							if (!matched) {
								removeNode(citiesSubtree, origin.stationname);
							}
						}

						if (destination) {
							const matched = (
								isMatch('nation', destinationCountry) 
								|| isMatch('airport', destinationIATA));

							if (!matched) {
								removeNode(
									citiesSubtree, destination.stationname);
							}					
						}

						if (!citiesSubtree.children.length) {
							removeNode(subtree, citiesSubtree.label);
						}
					}

					if (flightsSubtree) {
						removeNode(flightsSubtree, flightName);
					
						if (!flightsSubtree.children.length) {
							removeNode(subtree, flightsSubtree.label);
						}				
					}

					if (!subtree.children.length) {
						removeNode(overlayTree, subtree.label);
					}
				}
			}		
		}
	};

// Step 1: Add the "Nearby Flights" button to the filter form
const nearbyFlightsButton = document.getElementById('userLoc');
nearbyFlightsButton.addEventListener('click', handleNearbyFlightsClick);

// Step 2: Add an event listener to the "Nearby Flights" button
function handleNearbyFlightsClick() {
  // Step 3: Request geolocation permission and get the user's current location
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);

      // Step 4: Add a radius circle around the user's location
      const radiusCircle = L.circle(userLatLng, {
        radius: 100000, // Adjust the radius as needed (in meters)
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
      }).addTo(map);

      // Optionally, you can fit the map to the bounds of the radius circle
      map.fitBounds(radiusCircle.getBounds());
    },
    (error) => {
      console.error('Error getting user location:', error);
    }
  );
}


	const refresh = async function() {
		const data = await fetchData();
		const cities = data.Cities;
		const flights = data.Flights;

		addMarkers(flights, cities);
		
		controls.setOverlayTree(overlayTree);
	};

	const start = function({ elementId = 'map', lat = 54.5260, lng = -105.2551,
			initialZoom = 2, interval = 30000 } = {}) {
		map = L.map(elementId, { worldCopyJump: true })
			.setView([lat, lng], initialZoom);

		const baseTree = {
			label: 'Base',
			children: [
				{
					label: 'OpenStreetMap',
					layer: L.tileLayer(
						'https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
								maxZoom: 19,
								attribution: '&copy; ' 
									+ '<a href="https://www.openstreetmap.org/copyright">'
									+ 'OpenStreetMap</a>'}).addTo(map)
				},
				{
					label: 'OpenTopoMap',
					layer: L.tileLayer(
						'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
							, {
								maxZoom: 19,
								attribution: '&copy; '
									+ '<a href="https://www.opentopomap.org/">'
									+ 'OpenTopoMap</a>'})
				}
			]
		};

		controls = L.control.layers.tree(baseTree).addTo(map);

		createFilterForm();
		createFilters(function () { refresh() }, 
			'nation', 'airport', 'carrier');
		resetMatches('nation', 'airport');

		refresh();
		setInterval(function () { refresh(); }, interval);
	};

	return { start };
})();

let hidePopup=()=>{
		document.getElementById("accept-cookies-popup").style.display="none";

}
document.getElementById("accept-cookies-yes").addEventListener("click",()=>{
	hidePopup()
})

document.getElementById("accept-cookies-no").addEventListener("click",()=>{
	hidePopup()
})

leaflet.start();

