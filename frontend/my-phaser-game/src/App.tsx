import React from 'react';
import Game from './components/Game';


const App: React.FC = () => {
  return (
      <Router>
          <div className="App bg-gray-100 p-4">
              <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/game" element={<Game />} />
              </Routes>
          </div>
      </Router>
  );
};

export default App;
