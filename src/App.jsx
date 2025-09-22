import React, { useState } from 'react';
import Header from './components/Header/Header';
import Map from './components/Map/Map';
import PinForm from './components/PinForm/PinForm';
import TravelLog from './components/TravelLog/TravelLog';
import Chatbot from './components/Chatbot/Chatbot';
import { usePins } from './hooks/usePins';
import { useMap } from './hooks/useMap';
import './App.css';

function App() {
  const [showChatbot, setShowChatbot] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentView, setCurrentView] = useState('map'); // 'map', 'pins', 'profile'
  
  const { pins, addPin, deletePin } = usePins();
  const { currentLocation, handleMapClick, mapRef } = useMap();

  return (
    <div className="app">
      <Header 
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        onToggleChatbot={() => setShowChatbot(!showChatbot)}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
      
      <div className="app-content">
        <div className={`sidebar ${showSidebar ? 'sidebar-open' : ''}`}>
          <div className="sidebar-content">
            {currentView === 'map' && (
              <PinForm 
                currentLocation={currentLocation}
                onAddPin={addPin}
              />
            )}
            
            {currentView === 'pins' && (
              <TravelLog 
                pins={pins}
                onDeletePin={deletePin}
              />
            )}
            
            {currentView === 'profile' && (
              <div className="profile-view">
                <h2>User Profile</h2>
                <div className="user-info">
                  <div className="user-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="user-details">
                    <h3>Travel Explorer</h3>
                    <p>explorer@beyondborders.com</p>
                  </div>
                </div>
                <div className="profile-stats">
                  <div className="stat">
                    <span className="stat-number">{pins.filter(pin => pin.type === 'visited').length}</span>
                    <span className="stat-label">Visited Places</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{pins.filter(pin => pin.type === 'planning').length}</span>
                    <span className="stat-label">Future Plans</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="map-container">
          <Map 
            pins={pins}
            onMapClick={handleMapClick}
            mapRef={mapRef}
          />
        </div>
      </div>
      
      {showChatbot && <Chatbot onClose={() => setShowChatbot(false)} />}
      
      <button 
        className="chatbot-toggle"
        onClick={() => setShowChatbot(!showChatbot)}
      >
        <i className="fas fa-robot"></i>
      </button>
    </div>
  );
}

export default App;
