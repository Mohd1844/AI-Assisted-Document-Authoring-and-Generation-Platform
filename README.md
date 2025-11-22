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



