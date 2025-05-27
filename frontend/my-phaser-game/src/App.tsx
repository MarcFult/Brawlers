import React from 'react';
import Game from './components/Game';


const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);  // Update state when login is successful
  };

  return (
    <div className="App bg-gray-100 p-4">


      <Game />
    </div>
  );
};

export default App;
