# CampusResolve — AI-Enabled Cloud Grievance Management System

CampusResolve is a web-based grievance management platform designed to help educational institutions manage student complaints in a structured, transparent, and efficient manner.

The system organizes grievances, supports role-based access, tracks complaint statuses, and provides dashboards for monitoring and administration. It is being developed with cloud integration and AI-enabled capabilities in mind.

## 🎯 Project Objectives

- Simplify grievance submission and tracking.
- Organize complaints by category and responsible department.
- Improve transparency through status updates and notifications.
- Support staff and management in handling grievances.
- Track pending complaints and escalation timelines.
- Prepare the platform for cloud-based storage and future AI integration.

## ✨ Key Features

- **Grievance Submission:** Submit complaints with supporting attachments.
- **Role-Based Access:** Separate interfaces and functionality for students, staff, managers, and administrators.
- **Grievance Tracking:** Monitor complaint statuses, including Pending, In Progress, Resolved, and Rejected.
- **Department Management:** Organize grievances according to their categories and responsible departments.
- **Escalation and SLA Monitoring:** Support monitoring of delayed grievances and escalation workflows.
- **Notifications:** Provide a dedicated notification interface for grievance-related updates.
- **Admin Dashboard:** Manage users and monitor grievance activity.
- **Reports and Audit History:** Support administrative reporting and activity tracking.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Python, FastAPI |
| Database | MongoDB / MongoDB Atlas |
| Authentication | JWT |
| Cloud Storage Support | AWS S3 integration code |
| Cloud SDK | Boto3 |
| API Communication | HTTP / REST APIs |

**Cloud development roadmap:** AWS EC2 deployment, S3-based attachment storage, Amazon SNS notifications, and additional AI-powered grievance assistance.

*Note: Features listed in the roadmap may require further implementation and testing.*

## 🏗️ System Architecture

```text
Student / Staff / Manager / Admin
                |
                v
      React + TypeScript UI
                |
                v
          REST API
          FastAPI
                |
        +-------+-------+
        |               |
        v               v
    MongoDB         AWS Services
                    (Integration
                     / Roadmap)
```

## 📂 Project Structure

```text
ai-grievance-management-system/
│
├── backend/
│   ├── main.py
│   ├── cloud_storage.py
│   ├── create_admin.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   └── api.ts
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Install the following before running the project:

- Python 3.10 or a compatible version
- Node.js and npm
- MongoDB Atlas account or an accessible MongoDB instance
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/PrachiSinghOfficial/ai-grievance-management-system.git
cd ai-grievance-management-system
```

### 2. Configure the Backend

Create and activate a Python virtual environment:

**Windows PowerShell**

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create a `backend/.env` file and configure the environment variables required by `main.py` and `cloud_storage.py`, including database connectivity, authentication secrets, and AWS settings when needed.

Do not upload `.env` or any credentials to GitHub.

### 3. Start the Backend

From the `backend` directory, run:

```bash
uvicorn main:app --reload
```

The backend should be available at:

`http://127.0.0.1:8000`

FastAPI API documentation:

`http://127.0.0.1:8000/docs`

### 4. Configure the Frontend

Open a second terminal at the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in the terminal.

### 5. Build the Frontend

To verify and generate the production frontend build:

```bash
npm run build
```

The generated production files are placed in the `frontend/dist` directory.

## 🔐 Security Notes

- Store passwords, JWT secrets, database connection strings, and AWS credentials in environment variables.
- Never commit `.env` files, private keys, or access credentials.
- Use appropriate MongoDB permissions and AWS IAM permissions.
- Enable HTTPS and apply suitable access controls before production deployment.

## ☁️ Deployment Roadmap

The planned deployment and enhancement stages include:

1. Deploy the FastAPI backend on AWS EC2.
2. Serve the production frontend through a web server.
3. Configure MongoDB Atlas connectivity for the deployed application.
4. Complete and verify AWS S3 attachment storage.
5. Integrate Amazon SNS for notifications.
6. Evaluate AI-powered grievance categorization and assistance.
7. Perform security, integration, and end-to-end testing.

## 🎓 Academic Project

**Project Name:** CampusResolve — AI-Enabled Cloud Grievance Management System

**Purpose:** MCA academic project focused on web development, database management, grievance workflows, and cloud integration.

## 👩‍💻 Author

**Prachi Singh**

GitHub: [PrachiSinghOfficial](https://github.com/PrachiSinghOfficial)

---

*CampusResolve aims to make grievance management more organized, transparent, and accessible through modern web technologies and cloud-ready architecture.*
