import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import "./Login.css";

function Login({ setIsAuthenticated }) {
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("access_token", response.data.access_token);
      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (error) {
      setMessage("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await api.post("/auth/register", { email, password });
      setMessage("Registration successful! Please log in.");
      setAuthMode("login");
    } catch (error) {
      setMessage("Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>AI Document Platform</h1>
          <p>Generate professional documents with AI assistance</p>
        </div>

        <div className="auth-tabs">
          <button
            className={authMode === "login" ? "active" : ""}
            onClick={() => {
              setAuthMode("login");
              setMessage("");
            }}
          >
            Login
          </button>
          <button
            className={authMode === "register" ? "active" : ""}
            onClick={() => {
              setAuthMode("register");
              setMessage("");
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={authMode === "login" ? handleLogin : handleRegister}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {message && (
            <div className={`message ${message.includes("successful") ? "success" : "error"}`}>
              {message}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Please wait..." : authMode === "login" ? "Login" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
