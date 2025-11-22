Brief Description
An AI-powered web application automating the creation of professional Word documents (.docx) and PowerPoint presentations (.pptx). Users can register, log in, configure and generate documents or slides with AI-generated content, refine text via feedback, and export finished files. Built with FastAPI (backend) and React (frontend), the system features user-friendly design and intelligent slide-splitting to prevent overflow. Suitable for business, education, and marketing workflows.

FEATURES

User registration and login
Configuring projects for .docx or .pptx generation
AI-powered content generation
Refinement: AI-assisted edits, like/dislike, comments
Export of documents and presentations (.docx, .pptx)



INTSALLATION AND SETUP 
Prerequisites

* Python 3.9 or newer
* Node.js 16 or newer
* Git
* PostgreSQL

Backend
1.Clone the repository and open backend directory

git clone <your-repo-url>
cd backend

2.Create a virtual environment, activate it, and install dependencies
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt

3.Configure environment
cp .env.example .env

4.Neon postgresql
Login and set the credientials

5.Start backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000


Frontend

1.Change directory to frontend
cd frontend

2.Install dependencies
npm install

3.Create .env file
REACT_APP_API_URL=http://localhost:8000
REACT_APP_API_TIMEOUT=30000

4.Start frontend
npm start

How to Run Backend and Frontend ?
Backend:
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000

Frontend:
cd frontend
npm start

How to Use
1. Register and Login
Open the frontend in your browser (http://localhost:3000).

Click "Register" to create a new account with your email and password.

After registration, log in using your credentials to access the dashboard.

2. Create a New Project
Click "Create New Project".

Choose your document type: "Word Document" for .docx or "PowerPoint" for .pptx.

Enter a project name and provide the main topic or prompt.

3. Configure Document Structure
For Word:

Define section headings (e.g., Introduction, Overview, Conclusion).

For PowerPoint:

Define slide titles (e.g., Introduction, Main Points, Summary).

Optionally, use the "AI Suggest" feature to auto-generate sections or slide titles based on your topic.

4. Generate Content
Click "Create & Generate" to let the AI fill in the content for each section or slide.

Wait for the generation process to complete; content will appear for each section/slide in the editor.

5. Refine Content
Select any section or slide to view its content.

Use refinement tools:

Edit text directly or via AI-powered suggestions ("Refine" button).

Provide feedback using Like/Dislike buttons.

Add comments or notes for each section or slide.

6. Export Document or Presentation
When satisfied with the content, click the "Export" button.

For Word documents:

A .docx file will download, ready to open in Microsoft Word or compatible processors.

For PowerPoint presentations:

A .pptx file will download, optimized to prevent content overflow or overlap. Open in PowerPoint or compatible software.

