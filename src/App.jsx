import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import Space from './pages/Space/Space';
import FormCreate from './pages/FormCreate/FormCreate';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/space" element={<Space />} />
          <Route path="/form/create" element={<FormCreate />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
