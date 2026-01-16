import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Space from './pages/Space/Space';
import FormCreate from './pages/FormCreate/FormCreate';
import FormFill from './pages/FormFill/FormFill';
import FormDataView from './pages/FormDataView/FormDataView';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { isAuthenticated } from './utils/auth';
// 示意页面
import SpaceWithSidebar from '../example/SpaceWithSidebar';
import ResultsQuery from '../example/ResultsQuery';
import ExampleFormDataView from '../example/FormDataView';
import DataPushConfig from '../example/DataPushConfig';
import LogManager from '../example/LogManager';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* 公开路由 */}
          <Route 
            path="/" 
            element={isAuthenticated() ? <Navigate to="/space" replace /> : <Login />} 
          />
          <Route path="/register" element={<Register />} />
          
          {/* 表单填写页面（公开访问） */}
          <Route path="/form/:url" element={<FormFill />} />
          
          {/* 受保护的路由 */}
          <Route
            path="/space"
            element={
              <ProtectedRoute>
                <Space />
              </ProtectedRoute>
            }
          />
          <Route
            path="/form/create"
            element={
              <ProtectedRoute>
                <FormCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/form/:formId/data"
            element={
              <ProtectedRoute>
                <FormDataView />
              </ProtectedRoute>
            }
          />
          
          {/* 示意页面路由（无需登录） */}
          <Route path="/example/space" element={<SpaceWithSidebar />} />
          <Route path="/example/results" element={<ResultsQuery />} />
          <Route path="/example/form-data" element={<ExampleFormDataView />} />
          <Route path="/example/data-push" element={<DataPushConfig />} />
          <Route path="/example/logs" element={<LogManager />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
