// App.js
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Main from './Main'; // Replace with your main component
import ResetPassword from './ResetPassword'; // Import the Reset Password component

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
