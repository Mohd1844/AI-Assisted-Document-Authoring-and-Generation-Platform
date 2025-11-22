import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import ProjectConfig from "./components/Project/ProjectConfig";
import DocumentEditor from "./components/Document/DocumentEditor";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard setIsAuthenticated={setIsAuthenticated} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/project/new"
          element={
            isAuthenticated ? <ProjectConfig /> : <Navigate to="/" />
          }
        />
        <Route
          path="/project/:id/edit"
          element={
            isAuthenticated ? <DocumentEditor /> : <Navigate to="/" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
