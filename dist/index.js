mapboxgl.accessToken = 'pk.eyJ1IjoiYW5kcmVhc25nOTciLCJhIjoiY2s1M2x1NWFoMDJiMjNrbjFnY3NwZGFnZyJ9.zHb9eE3laWbRLfXSxVRhRg';
const script = document.createElement('script');

script.src = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojsonp'
document.getElementsByTagName('head')[0].appendChild(script);

let marker;
const circles = document.getElementsByClassName("circles");
const toggleTectonic = document.querySelector("#toggleTectonic");
const eqInfo = document.querySelector("#eqInfo");

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/andreasng97/ck5h6weja05hg1iporhe9zwiq?optimize=true',
    center: [0, 0],
    zoom: 1.5
});

map.on('load', function() {
  map.addSource("tectonicLayer", {
    type: "geojson",
    data: "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"
});
  map.addLayer({
    id:'tectonicLayer',
    type:'line',
    paint: {
       'line-color': 'rgba(20, 20, 20, 0.5)'
    },
    source:"tectonicLayer"
  })
});
// Toggler på og av Layer som viser Tektoniske Plater
  const showTectonic = () => {
    if(toggleTectonic.checked == false) {
      map.setLayoutProperty("tectonicLayer", "visibility", "none")
    }else{
      map.setLayoutProperty("tectonicLayer", "visibility", "visible")
    }
  }

window.eqfeed_callback = (results) => {
    for (let i = 0; i < results.features.length; i++) {
        const coords = results.features[i].geometry.coordinates;
        const lngLat = new mapboxgl.LngLat(coords[0],coords[1]);
        const mag = results.features[i].properties.mag;

        // Gir markørene en klasse, for å style.
        const el = document.createElement('div');
        el.className = 'circles';
        new mapboxgl.Marker(el)
        .setLngLat(lngLat)
        .addTo(map);

        // Fjerner alle Jordskjelvene med magnitude minde enn 4, gjør dette for minde lag.
        for( let i = 0; i < results.features.length; i++) {
          if(results.features[i].properties.mag < 4){
            results.features.splice(i, 1);
          }
        }
        // Gir hvert element dataset som tar data fra Geojson og gir det til selve elementet.
        el.dataset.time = results.features[i].properties.time;
        el.dataset.sig = results.features[i].properties.sig
        el.dataset.place = results.features[i].properties.place
        el.dataset.magnitude = mag

        const unixTime = el.dataset.time
        const sig = el.dataset.sig
        const place = el.dataset.place
        const magnitude = el.dataset.magnitude
        // Størrelsen på sirklene er definert av magnitude på jordskjelvet
        circles[i].style.width = Math.pow(2, mag - 1) + "px"
        circles[i].style.height = Math.pow(2, mag - 1) + "px"
        // API som gjør unixTime(Millisekunder siden 01.01.1970) til en lesbar dato (Linje 81 også)
        const day = moment(Number(unixTime))
      
        
        el.onclick = () => {
          eqInfo.innerHTML = `
            <h4>${place}</h4>
            <p>${day.format('dddd, MMMM Do YYYY, h:mm:ssa')} UTC</p>
            <p>Magnitude: ${magnitude}</p>
            <p> 
              <span class="sigInfo">&#x24D8;
                <span class="sigText">A number describing how significant the event is. Larger numbers indicate a more significant event.</span>
              </span> Significance: ${sig}</p>
          `;
        } 
    }
}




