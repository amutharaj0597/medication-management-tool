import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Prescription from "./components/Prescription";
import WeeklyPlanner from './components/WeeklyPlanner';
import Notification from './components/Notification';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/prescription" element={<Prescription />} />
        <Route path="/weekly-planner" element={<WeeklyPlanner />} />
        <Route path="/notification" element={<Notification />} />
      </Routes>
    </Router>
  );
}

export default App;
