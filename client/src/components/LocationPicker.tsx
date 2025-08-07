import React, { useState } from 'react';
import { LocationService, LocationData } from '../utils/locationService';
import LocationMap from './LocationMap';
import './LocationPicker.css';

interface LocationPickerProps {
  onLocationChange: (location: LocationData | null) => void;
  initialLocation?: LocationData | null;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationChange, initialLocation }) => {
  const [location, setLocation] = useState<LocationData | null>(initialLocation || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationData | null>(null);

  const handleGetCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const currentLocation = await LocationService.getCurrentLocation();
      setLocation(currentLocation);
      onLocationChange(currentLocation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
      onLocationChange(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualLocationChange = (field: keyof LocationData, value: string | number) => {
    const currentLocation = editingLocation || location;
    
    if (!currentLocation) {
      const newLocation: LocationData = {
        latitude: 0,
        longitude: 0,
        address: '',
        city: '',
        state: '',
        pincode: ''
      };
      newLocation[field] = value as any;
      setEditingLocation(newLocation);
    } else {
      const updatedLocation = { ...currentLocation, [field]: value };
      setEditingLocation(updatedLocation);
    }
  };

  const clearLocation = () => {
    setLocation(null);
    onLocationChange(null);
    setError(null);
  };

  return (
    <div className="location-picker">
      <div className="location-header">
        <h4>📍 Location Details</h4>
        <p>Help us locate the issue accurately</p>
      </div>

      {!location && !showManualInput && (
        <div className="location-options">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLoading}
            className="location-btn primary"
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Getting Location...
              </>
            ) : (
              <>
                📍 Use Current Location
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => setShowManualInput(true)}
            className="location-btn secondary"
          >
            📝 Enter Address Manually
          </button>
        </div>
      )}

      {showManualInput && (
        <div className="manual-location-form">
          <div className="form-group">
            <label htmlFor="address">Street Address *</label>
            <input
              id="address"
              type="text"
              placeholder="Enter street address"
              className="form-input"
              value={editingLocation?.address || location?.address || ''}
              onChange={(e) => handleManualLocationChange('address', e.target.value)}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                id="city"
                type="text"
                placeholder="Mumbai"
                className="form-input"
                value={editingLocation?.city || location?.city || ''}
                onChange={(e) => handleManualLocationChange('city', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="state">State *</label>
              <input
                id="state"
                type="text"
                placeholder="Maharashtra"
                className="form-input"
                value={editingLocation?.state || location?.state || ''}
                onChange={(e) => handleManualLocationChange('state', e.target.value)}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="pincode">Pincode *</label>
            <input
              id="pincode"
              type="text"
              placeholder="400001"
              className="form-input"
              value={editingLocation?.pincode || location?.pincode || ''}
              onChange={(e) => handleManualLocationChange('pincode', e.target.value)}
            />
          </div>
          
          <div className="manual-location-actions">
            <button
              type="button"
              onClick={() => {
                setShowManualInput(false);
                if (editingLocation) {
                  setLocation(editingLocation);
                  onLocationChange(editingLocation);
                  setEditingLocation(null);
                }
              }}
              className="location-btn secondary"
            >
              ← Back
            </button>
            {editingLocation && (
              <button
                type="button"
                onClick={() => {
                  setLocation(editingLocation);
                  onLocationChange(editingLocation);
                  setShowManualInput(false);
                  setEditingLocation(null);
                }}
                className="location-btn primary"
              >
                ✅ Save Changes
              </button>
            )}
          </div>
        </div>
      )}

      {location && (
        <div className="location-display">
          <div className="location-info">
            <div className="location-icon">📍</div>
            <div className="location-details">
              <h5>{location.address}</h5>
              <p>{location.city}, {location.state} - {location.pincode}</p>
              {location.latitude && location.longitude && (
                <p className="coordinates">
                  Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              )}
            </div>
          </div>
          
          <LocationMap location={location} />
          
          <div className="location-actions">
            <button
              type="button"
              onClick={clearLocation}
              className="location-btn danger"
            >
              ✕ Clear
            </button>
                      <button
            type="button"
            onClick={() => {
              setEditingLocation(location);
              setShowManualInput(true);
            }}
            className="location-btn secondary"
          >
            ✏️ Edit
          </button>
          </div>
        </div>
      )}

      {error && (
        <div className="location-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default LocationPicker; 