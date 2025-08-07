import React from 'react';
import { LocationData } from '../utils/locationService';
import './LocationMap.css';

interface LocationMapProps {
  location: LocationData;
  className?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({ location, className = '' }) => {
  const { latitude, longitude, address } = location;
  
  // OpenStreetMap URL with the location
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`;
  
  return (
    <div className={`location-map ${className}`}>
      <div className="map-container">
        <iframe
          title={`Map showing ${address}`}
          src={mapUrl}
          width="100%"
          height="200"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
        />
      </div>
      <div className="map-overlay">
        <div className="map-pin">📍</div>
      </div>
    </div>
  );
};

export default LocationMap; 