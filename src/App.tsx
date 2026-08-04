import React from 'react';
import { ControllerPreview, useEngine } from '@aoles-gl/react';
import ResourcePanel from './components/ResourcePanel';
import './App.css';

function App() {
  const engine = useEngine();

  return (
    <div className="editor-root">
      <div className="main-content">
        {/* Left: Resource Panel */}
        <div className="card-style resources-section">
          <ResourcePanel />
        </div>

        {/* Right: Main Area */}
        <div className="right-section">
          {/* Top: Preview + Attributes */}
          <div className="preview-attr-row">
            <div className="card-style preview-section">
              <ControllerPreview />
            </div>
            <div className="card-style attr-section">
              <div className="p-4 text-center text-gray-500">
                <p>Attribute Panel</p>
                <p className="text-sm mt-2">(Implementation in progress)</p>
              </div>
            </div>
          </div>

          {/* Bottom: Track Timeline */}
          <div className="card-style track-section">
            <div className="p-4 text-center text-gray-500">
              <p>Track Timeline</p>
              <p className="text-sm mt-2">(Implementation in progress)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
