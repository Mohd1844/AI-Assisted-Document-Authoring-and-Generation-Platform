import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { generateProjectSections } from "../../api/api";
import "./DocumentEditor.css";

function DocumentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedSection, setSelectedSection] = useState(0);
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data);
      setContent(response.data.sections || []);
      if (!response.data.sections || response.data.sections.length === 0) {
        await generateContent();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      setLoading(false);
    }
  };

  const generateContent = async () => {
    setGenerating(true);
    try {
      const response = await generateProjectSections(id);
      setContent(response.data.sections);
    } catch (error) {
      alert("Failed to generate content");
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!refinementPrompt.trim()) return;
    try {
      const section = content[selectedSection];
      const response = await api.post("/generate/refine", {
        section_id: section.id,
        prompt: refinementPrompt,
      });
      const newContent = [...content];
      newContent[selectedSection].content = response.data.refined_content;
      setContent(newContent);
      setRefinementPrompt("");
    } catch (error) {
      alert("Failed to refine content");
    }
  };

  const handleFeedback = async (type) => {
    try {
      const section = content[selectedSection];
      await api.post(`/projects/${id}/feedback`, {
        section_id: section.id,
        feedback_type: type,
      });
      alert(`Feedback recorded: ${type}`);
    } catch (error) {
      console.error("Error recording feedback:", error);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    try {
      const section = content[selectedSection];
      await api.post(`/projects/${id}/comment`, {
        section_id: section.id,
        comment: comment,
      });
      setComment("");
      alert("Comment saved");
    } catch (error) {
      alert("Failed to save comment");
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get(`/projects/${id}/export`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${project.title || "document"}.${project.document_type}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Failed to export document");
    }
  };

  // --- Content Viewer: Bold subheadings, clean lists, remove stray asterisks ---
  const renderSectionContent = (section) => {
    if (!section || !section.content || !section.content.trim()) {
      return (
        <p style={{ color: "#888", fontStyle: "italic" }}>
          No content available. Generate or select a section to see preview.
        </p>
      );
    }

    // Split content into lines for detection
    const lines = section.content.split('\n');

    // Function: Is this a subheading? (starts/ends with **, no more **, not a bullet)
    const isSubheading = (line) => (
      /^\s*\*\*[^\*]+\*\*\s*$/.test(line) && !/^\s*\*/.test(line)
    );

    let inList = false;
    let listItems = [];
    let output = [];

    // Loop through lines and render appropriately
    lines.forEach((rawLine, idx) => {
      let line = rawLine.trim();

      // Bold only subheadings
      if (isSubheading(line)) {
        // Close any existing list
        if (inList && listItems.length) {
          output.push(
            <ul key={`ul-${idx}`}>
              {listItems}
            </ul>
          );
          inList = false;
          listItems = [];
        }
        line = line.replace(/^\*\*/, "").replace(/\*\*$/, "");
        output.push(
          <p key={idx} style={{
            fontWeight: "bold",
            fontSize: "1.15rem",
            letterSpacing: "0.5px",
            marginTop: "16px",
            marginBottom: "10px",
            color: "#1f3864"
          }}>
            <strong>{line}</strong>
          </p>
        );
        return;
      }

      // List items: line starts with *
      if (/^\s*\*/.test(line)) {
        inList = true;
        // Remove marker and all ** (no double bold in lists)
        line = line.replace(/^\s*\*/, "").replace(/\*\*/g, "");
        listItems.push(
          <li key={idx} style={{
            fontSize: "1.05rem",
            marginBottom: "7px",
            marginLeft: "24px"
          }}>
            {line.trim()}
          </li>
        );
        return;
      }

      // Non-list: render paragraph, close any open list
      if (inList && listItems.length) {
        output.push(
          <ul key={`ul-${idx}`}>
            {listItems}
          </ul>
        );
        inList = false;
        listItems = [];
      }

      // Normal paragraph, strip all remaining * and **
      line = line.replace(/\*\*/g, "").replace(/\*/g, "");
      if (line) {
        output.push(
          <p key={idx} style={{
            lineHeight: 1.6,
            fontSize: "1.1rem",
            background: "#f6f8fa",
            borderRadius: "4px",
            padding: "10px 18px",
            margin: "14px 0",
            fontFamily: "Calibri, Arial, sans-serif",
            color: "#222"
          }}>
            {line}
          </p>
        );
      }
    });

    // Render out any unwritten list
    if (inList && listItems.length) {
      output.push(
        <ul key={`ul-final`}>
          {listItems}
        </ul>
      );
    }

    return output;
  };

  if (loading) {
    return <div className="loading">Loading project...</div>;
  }

  if (generating) {
    return (
      <div className="generating-screen">
        <div className="spinner"></div>
        <h2>Generating content with AI...</h2>
        <p>This may take a moment</p>
      </div>
    );
  }

  return (
    <div className="document-editor">
      <header className="editor-header">
        <div>
          <button className="btn-back" onClick={() => navigate("/dashboard")}>
            ← Back
          </button>
          <h1 style={{ fontFamily: "Segoe UI, Calibri, Arial", color: "#1f3864" }}>
            {project?.title || project?.name}
          </h1>
        </div>
        <button className="btn-export" onClick={handleExport}>
          📥 Export {project?.document_type?.toUpperCase()}
        </button>
      </header>

      <div className="editor-layout">
        <aside className="sections-sidebar">
          <h3>Sections</h3>
          <div className="sections-list">
            {content.map((item, index) => (
              <div
                key={index}
                className={`section-item ${selectedSection === index ? "active" : ""}`}
                onClick={() => setSelectedSection(index)}
              >
                <span className="section-number">{index + 1}</span>
                <span className="section-title">{item.title || `Section ${index + 1}`}</span>
              </div>
            ))}
          </div>
        </aside>

        <main className="content-area">
          {content[selectedSection] && (
            <div className="content-viewer">
              <h2 style={{
                color: "#1f3864",
                fontSize: "1.5rem",
                fontFamily: "Segoe UI, Calibri, Arial",
                marginBottom: "22px"
              }}>
                {content[selectedSection].title}
              </h2>
              <div className="content-text">
                {renderSectionContent(content[selectedSection])}
              </div>
            </div>
          )}
        </main>

        <aside className="refinement-panel">
          <h3>Refinement Tools</h3>
          <div className="tool-section">
            <label>AI Refinement</label>
            <textarea
              value={refinementPrompt}
              onChange={(e) => setRefinementPrompt(e.target.value)}
              placeholder="e.g., Make this more formal, convert to bullet points..."
              rows="3"
            />
            <button className="btn-refine" onClick={handleRefine}>
              ✨ Refine
            </button>
          </div>
          <div className="tool-section">
            <label>Feedback</label>
            <div className="feedback-buttons">
              <button
                className="btn-feedback like"
                onClick={() => handleFeedback("like")}
              >
                👍 Like
              </button>
              <button
                className="btn-feedback dislike"
                onClick={() => handleFeedback("dislike")}
              >
                👎 Dislike
              </button>
            </div>
          </div>
          <div className="tool-section">
            <label>Comments</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your notes or comments..."
              rows="3"
            />
            <button className="btn-comment" onClick={handleComment}>
              💬 Save Comment
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DocumentEditor;
