import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import "./Dashboard.css";

function Dashboard({ setIsAuthenticated }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects");
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);
    navigate("/");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>My Projects</h1>
          <p>Manage your AI-generated documents</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => navigate("/project/new")}>
            + New Project
          </button>
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {loading ? (
          <div className="loading-state">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <h2>No projects yet</h2>
            <p>Create your first AI-powered document</p>
            <button className="btn-primary" onClick={() => navigate("/project/new")}>
              Create Project
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => navigate(`/project/${project.id}/edit`)}
              >
                <div className="project-type">
                  {project.document_type === "docx" ? "📄 Word" : "📊 PowerPoint"}
                </div>
                <h3>{project.name}</h3>
                <p className="project-description">{project.description}</p>
                <div className="project-meta">
                  <span>Created: {formatDate(project.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
