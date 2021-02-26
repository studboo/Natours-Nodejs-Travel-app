/* eslint-disable */

const locations = JSON.parse(document.getElementById('map').dataset.locations);

// console.log(locations);

mapboxgl.accessToken = 'pk.eyJ1Ijoic3R1ZGJvbyIsImEiOiJja2xnZ3E0bmkxYW9xMnZuMWlzZmIwZHdsIn0.NepGg9tQpYuZT01Ke0y24A';
var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/studboo/cklghzmzy6e3p17mp4lg6slrc',
	scrollZoom: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
	//add marker
	const el = document.createElement('div');
	el.className = 'marker';

	new mapboxgl.Marker({
		element: el,
		anchor: 'bottom',
	})
		.setLngLat(loc.coordinates)
		.addTo(map);

	// add popup

	new mapboxgl.Popup({
		offset: 30,
	})
		.setLngLat(loc.coordinates)
		.setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
		.addTo(map);

	bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
	padding: {
		top: 180,
		bottom: 150,
		left: 100,
		right: 100,
	},
});
