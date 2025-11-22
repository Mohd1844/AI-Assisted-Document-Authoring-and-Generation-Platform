import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { generateProjectSections } from "../../api/api";
import "./ProjectConfig.css";

function ProjectConfig() {
  const [step, setStep] = useState(1);
  const [documentType, setDocumentType] = useState("");
  const [projectName, setProjectName] = useState("");
  const [mainTopic, setMainTopic] = useState("");
  const [sections, setSections] = useState([""]);
  const [slides, setSlides] = useState([{ title: "" }]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Utility: clean up section/slide titles
  const cleanSectionTitle = (title) => title.replace(/^#+\s*/, "").trim();

  // AI Suggest
  const handleAISuggest = async () => {
    if (!mainTopic) {
      alert("Please enter a main topic first");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/ai/suggest-outline", {
        topic: mainTopic,
        document_type: documentType,
      });
      if (documentType === "docx") {
        setSections((response.data.sections || [""]).map(cleanSectionTitle));
      } else {
        setSlides(
          (response.data.slides || [{ title: "" }]).map((slide) => ({
            title: cleanSectionTitle(slide.title),
          }))
        );
      }
    } catch (error) {
      alert("Failed to generate AI suggestions");
    } finally {
      setLoading(false);
    }
  };

  // Create project and generate sections/slides
  const handleCreateProject = async () => {
    setLoading(true);
    try {
      let config;
      if (documentType === "docx") {
        config = {
          sections: sections
            .filter((s) => s.trim())
            .map((title, idx) => ({
              title: cleanSectionTitle(title),
              order_index: idx,
            })),
        };
      } else {
        config = {
          slides: slides
            .filter((s) => s.title.trim())
            .map((slide, idx) => ({
              title: cleanSectionTitle(slide.title),
              order_index: idx,
            })),
        };
      }
      const payload = {
        title: projectName,
        topic: mainTopic,
        document_type: documentType,
        config: config,
      };
      console.log("Creating project payload:", payload);

      // Step 1: Create the project
      const response = await api.post("/projects/", payload);
      const projectId = response.data.id;

      // Step 2: Bulk-generate sections/slides
      await generateProjectSections(projectId);

      // Step 3: Go to edit screen
      navigate(`/project/${projectId}/edit`);
    } catch (error) {
      alert("Failed to create or generate project");
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => setSections([...sections, ""]);
  const removeSection = (index) => setSections(sections.filter((_, i) => i !== index));
  const updateSection = (index, value) => {
    const newSections = [...sections];
    newSections[index] = value;
    setSections(newSections);
  };

  const addSlide = () => setSlides([...slides, { title: "" }]);
  const removeSlide = (index) => setSlides(slides.filter((_, i) => i !== index));
  const updateSlide = (index, value) => {
    const newSlides = [...slides];
    newSlides[index].title = value;
    setSlides(newSlides);
  };

  return (
    <div className="project-config">
      <div className="config-container">
        <h1>Create New Project</h1>
        {step === 1 && (
          <div className="config-step">
            <h2>Step 1: Choose Document Type</h2>
            <div className="document-type-selector">
              <div
                className={`type-card ${documentType === "docx" ? "selected" : ""}`}
                onClick={() => setDocumentType("docx")}
              >
                <div className="type-icon">📄</div>
                <h3>Word Document</h3>
                <p>Create structured text documents</p>
              </div>
              <div
                className={`type-card ${documentType === "pptx" ? "selected" : ""}`}
                onClick={() => setDocumentType("pptx")}
              >
                <div className="type-icon">📊</div>
                <h3>PowerPoint</h3>
                <p>Create presentation slides</p>
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={() => setStep(2)}
              disabled={!documentType}
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="config-step">
            <h2>Step 2: Project Details</h2>
            <div className="form-group">
              <label>Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., Market Analysis Report 2025"
              />
            </div>
            <div className="form-group">
              <label>Main Topic / Prompt</label>
              <textarea
                value={mainTopic}
                onChange={(e) => setMainTopic(e.target.value)}
                placeholder="e.g., A comprehensive market analysis of the EV industry in 2025"
                rows="4"
              />
            </div>
            <div className="button-group">
              <button className="btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                className="btn-primary"
                onClick={() => setStep(3)}
                disabled={!projectName || !mainTopic}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="config-step">
            <div className="step-header">
              <h2>Step 3: Define Structure</h2>
              <button
                className="btn-ai"
                onClick={handleAISuggest}
                disabled={loading}
              >
                ✨ AI Suggest
              </button>
            </div>

            {documentType === "docx" ? (
              <div className="sections-editor">
                <label>Document Sections</label>
                {sections.map((section, index) => (
                  <div key={index} className="section-item">
                    <input
                      type="text"
                      value={cleanSectionTitle(section)}
                      onChange={(e) => updateSection(index, cleanSectionTitle(e.target.value))}
                      placeholder={`Section ${index + 1} heading`}
                    />
                    <button onClick={() => removeSection(index)}>✕</button>
                  </div>
                ))}
                <button className="btn-add" onClick={addSection}>
                  + Add Section
                </button>
              </div>
            ) : (
              <div className="slides-editor">
                <label>Slide Titles</label>
                {slides.map((slide, index) => (
                  <div key={index} className="slide-item">
                    <span className="slide-number">{index + 1}</span>
                    <input
                      type="text"
                      value={cleanSectionTitle(slide.title)}
                      onChange={(e) => updateSlide(index, cleanSectionTitle(e.target.value))}
                      placeholder={`Slide ${index + 1} title`}
                    />
                    <button onClick={() => removeSlide(index)}>✕</button>
                  </div>
                ))}
                <button className="btn-add" onClick={addSlide}>
                  + Add Slide
                </button>
              </div>
            )}
            <div className="button-group">
              <button className="btn-secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button
                className="btn-primary"
                onClick={handleCreateProject}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create & Generate"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectConfig;
