// Map.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, useMapEvents } from 'react-leaflet';

const Map = () => {
  const [guessResult, setGuessResult] = useState(null);
  const [animalPolygon, setAnimalPolygon] = useState(null);

  useEffect(() => {
    // Fetch the GeoJSON data
    fetch('./Varanus_albigularis.geojson')
      .then(response => response.json())
      .then(data => {
        // Extract polygon coordinates from the GeoJSON
        const polygonCoordinates = data.features[0].geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
        setAnimalPolygon(polygonCoordinates);
        console.log(polygonCoordinates)
      })
      .catch(error => console.error('Error fetching animal data:', error));
      // GWYN TODO: Error fetching animal data: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
      // Server is returning HTML instead of JSON. I'm sure there's some non-intuitive fix out there.
  }, []);

  // GWYN TODO: Get the click to actually show up as a marker + check overlap
  // Custom hook to handle user's click on the map
  function useGuessHandler() {
    const map = useMapEvents({
      click(e) {
        const userGuess = [e.latlng.lat, e.latlng.lng];
        // Check if the user's guess overlaps with the animal's region
        const isOverlap = isPointInsidePolygon(userGuess, animalPolygon);
        setGuessResult(isOverlap ? 'Correct!' : 'Incorrect!');
      },
    });

    return null;
  }

  // Function to check if a point is inside a polygon
  const isPointInsidePolygon = (point, polygon) => {
    let inside = false;
    const x = point[0];
    const y = point[1];

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  };

  return (
    <div>
      <MapContainer center={[0, 0]} zoom={2} style={{ height: '500px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {animalPolygon && <Polygon positions={animalPolygon} />}
        <useGuessHandler />
      </MapContainer>
      {guessResult && <p>{guessResult}</p>}
    </div>
  );
};

export default Map;
