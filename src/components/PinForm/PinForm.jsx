import React, { useState } from 'react';
import './PinForm.css';

const PinForm = ({ currentLocation, onAddPin }) => {
  const [locationName, setLocationName] = useState('');
  const [type, setType] = useState('visited');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!locationName.trim()) {
      alert('Please enter a location name');
      return;
    }
    
    if (!notes.trim()) {
      alert('Please add some notes about this destination');
      return;
    }
    
    onAddPin({
      position: [currentLocation.lat, currentLocation.lng],
      locationName,
      type,
      notes,
      date: new Date().toLocaleDateString()
    });
    
    // Reset form
    setLocationName('');
    setNotes('');
    setType('visited');
  };

  return (
    <div className="pin-form">
      <h2>Add New Destination</h2>
      
      <div className="form-group">
        <label>Location Name</label>
        <input 
          type="text" 
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="Enter location name"
        />
      </div>
      
      <div className="form-group">
        <label>Coordinates</label>
        <input 
          type="text" 
          value={currentLocation ? `Lat: ${currentLocation.lat.toFixed(4)}, Lng: ${currentLocation.lng.toFixed(4)}` : 'Click on map to select location'}
          readOnly 
        />
      </div>
      
      <div className="form-group">
        <label>Destination Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="visited">Visited Destination</option>
          <option value="planning">Planning to Visit</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>Notes</label>
        <textarea 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Share your experience or plans for this destination..."
          rows="4"
        ></textarea>
      </div>
      
      <button 
        className="submit-btn"
        onClick={handleSubmit}
        disabled={!currentLocation}
      >
        <i className="fas fa-plus"></i> Add Destination
      </button>
    </div>
  );
};

export default PinForm;
