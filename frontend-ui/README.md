# Job Application Tracker

A full-stack application for organizing a job search. Users can register
and log in, manage applications, track application statuses, schedule
interviews, create follow-up reminders, write notes, and review
job-search statistics.

## Objectives

-   Centralize job application information.
-   Secure user-specific data with JWT authentication.
-   Support application CRUD, search, filtering, sorting, and
    pagination.
-   Associate interviews, follow-ups, and notes with applications.
-   Summarize job-search progress in a dashboard.

## Features

-   **Authentication:** Registration, login, JWT bearer-token
    authentication.
-   **Applications:** Create, view, update, delete, search by company,
    filter/sort, paginate.
-   **Statuses:** `SAVED`, `APPLIED`, `SCREENING`, `INTERVIEW`, `OFFER`,
    `ACCEPTED`, `REJECTED`, `WITHDRAWN`.
-   **Interviews:** Create, list, update, and delete interviews linked
    to applications.
-   **Follow-ups:** Create, list, update, and delete reminders.
-   **Notes:** Create, list, update, and delete application notes.
-   **Dashboard:** Total applications, status counts, interviews,
    follow-ups due, and recent applications.
-   **Frontend:** React interface with Dashboard, Applications,
    Interviews, Follow-ups, and Notes pages.

## Technology Stack

  Layer                         Technology
  ----------------------------- ---------------------------------
  Frontend                      React, Vite, JavaScript, CSS
  Icons                         Lucide React
  Backend                       Python, FastAPI
  Validation                    Pydantic
  ORM                           SQLAlchemy
  Database                      PostgreSQL
  Database driver               psycopg2
  Authentication                JWT, `python-jose`, HTTP Bearer
  Environment/package manager   `uv`
  API testing                   FastAPI Swagger UI

## Architecture

``` text
Browser
  |
  v
React + Vite frontend
  | HTTP/JSON + Authorization: Bearer <token>
  v
FastAPI routers
  |-- Authentication
  |-- Applications
  |-- Interviews
  |-- Follow-ups
  |-- Notes
  |-- Dashboard
  |
  v
Dependencies and services
  |-- get_db()
  |-- get_current_user()
  |-- Business logic and ownership checks
  |
  v
SQLAlchemy models / Pydantic schemas
  |
  v
PostgreSQL
```

For protected requests, FastAPI extracts the bearer token, validates the
JWT, retrieves the current user, and then runs the endpoint logic.
Related records should be checked against the authenticated user's
ownership.

## Project Structure

The exact file layout may vary slightly from this outline.

``` text
Job-Application-Tracker/
├── app/
│   ├── main.py
│   ├── database/
│   │   └── connection.py
│   ├── models/
│   │   ├── user.py
│   │   ├── application.py
│   │   ├── interview.py
│   │   ├── followup.py
│   │   └── note.py
│   ├── routers/
│   │   ├── applications.py
│   │   ├── interviews.py
│   │   ├── followups.py
│   │   ├── notes.py
│   │   └── dashboard.py
│   ├── schemas/
│   ├── services/
│   ├── utils/
│   │   └── security.py
│   └── dependencies.py
├── frontend-ui/
│   ├── src/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Applications.jsx
│   │   ├── Interviews.jsx
│   │   ├── Followups.jsx
│   │   └── Notes.jsx
│   └── package.json
├── .env
├── pyproject.toml
└── README.md
```

## Getting Started

### Prerequisites

-   Python version supported by the backend dependencies
-   Node.js and npm
-   PostgreSQL
-   `uv`

### 1. Clone the repository

``` bash
git clone <your-repository-url>
cd Job-Application-Tracker
```

Replace `<your-repository-url>` with your repository URL.

### 2. Create a PostgreSQL database

For example, in `psql`:

``` sql
CREATE DATABASE job_application_tracker;
```

### 3. Configure environment variables

Create or update `.env` using the names expected by your backend
configuration. For example:

``` env
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/job_application_tracker
SECRET_KEY=REPLACE_WITH_A_LONG_RANDOM_SECRET
ALGORITHM=HS256
```

The exact variable names must match your `connection.py` and
`security.py`. Do not commit real credentials or secret keys.

### 4. Install backend dependencies

From the project root:

``` bash
uv sync
```

### 5. Install frontend dependencies

``` bash
cd frontend-ui
npm install
```

## Run the Application

### Backend

From the project root:

``` bash
uv run uvicorn app.main:app --reload
```

-   API base URL: `http://127.0.0.1:8000`
-   Swagger UI: `http://127.0.0.1:8000/docs`
-   OpenAPI JSON: `http://127.0.0.1:8000/openapi.json`

### Frontend

In another terminal:

``` bash
cd frontend-ui
npm run dev
```

Open the local URL shown by Vite. Ensure the backend CORS configuration
allows that frontend origin.

## API Endpoints

These routes reflect the endpoints discussed during development. Confirm
exact prefixes, request schemas, and response shapes in Swagger UI.

### Authentication

  Method   Endpoint      Purpose
  -------- ------------- -----------------------------------
  `POST`   `/register`   Register a user
  `POST`   `/login`      Log in and obtain an access token

### Applications

  ---------------------------------------------------------------------------------------------------------------------------------------
  Method                  Endpoint                                                                                Purpose
  ----------------------- --------------------------------------------------------------------------------------- -----------------------
  `POST`                  `/applications`                                                                         Create an application

  `GET`                   `/applications?page=1&limit=10`                                                         List applications with
                                                                                                                  pagination

  `GET`                   `/applications/{application_id}`                                                        Get one application

  `PUT`                   `/applications/{application_id}`                                                        Update an application

  `DELETE`                `/applications/{application_id}`                                                        Delete an application

  `PATCH`                 `/applications/{application_id}/status`                                                 Update its status

  `GET`                   `/applications/status/{status}`                                                         Filter by status

  `GET`                   `/applications/search/{company_name}`                                                   Search by company

  `GET`                   `/applications/filter-sort?employment_type=FULL_TIME&sort_by=applied_date&order=desc`   Filter and sort
  ---------------------------------------------------------------------------------------------------------------------------------------

### Interviews

  ---------------------------------------------------------------------------------------------
  Method                  Endpoint                                      Purpose
  ----------------------- --------------------------------------------- -----------------------
  `POST`                  `/applications/{application_id}/interviews`   Create an interview

  `GET`                   `/applications/{application_id}/interviews`   List interviews for an
                                                                        application

  `PUT`                   `/interviews/{interview_id}`                  Update an interview

  `DELETE`                `/interviews/{interview_id}`                  Delete an interview
  ---------------------------------------------------------------------------------------------

### Follow-ups

  --------------------------------------------------------------------------------------------
  Method                  Endpoint                                     Purpose
  ----------------------- -------------------------------------------- -----------------------
  `POST`                  `/applications/{application_id}/followups`   Create a follow-up

  `GET`                   `/applications/{application_id}/followups`   List follow-ups for an
                                                                       application

  `PUT`                   `/followups/{followup_id}`                   Update a follow-up

  `DELETE`                `/followups/{followup_id}`                   Delete a follow-up
  --------------------------------------------------------------------------------------------

### Notes

  ----------------------------------------------------------------------------------------
  Method                  Endpoint                                 Purpose
  ----------------------- ---------------------------------------- -----------------------
  `POST`                  `/applications/{application_id}/notes`   Create a note

  `GET`                   `/applications/{application_id}/notes`   List notes for an
                                                                   application

  `PUT`                   `/notes/{note_id}`                       Update a note

  `DELETE`                `/notes/{note_id}`                       Delete a note
  ----------------------------------------------------------------------------------------

### Dashboard

  Method   Endpoint       Purpose
  -------- -------------- -----------------------------
  `GET`    `/dashboard`   Return dashboard statistics

## Sample Requests and Responses

Examples below are illustrative. Use `/docs` to confirm required fields
and exact schemas in your current code.

### Register --- `POST /register`

Example request (adjust to match your `UserCreate` schema):

``` json
{
  "name": "Example User",
  "email": "user@example.com",
  "password": "Use-A-Strong-Password"
}
```

### Login --- `POST /login`

Example request (adjust to match your login schema):

``` json
{
  "email": "user@example.com",
  "password": "Use-A-Strong-Password"
}
```

Example token response:

``` json
{
  "access_token": "<JWT_ACCESS_TOKEN>",
  "token_type": "bearer"
}
```

### Authenticated request header

``` http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

Use the **Authorize** control in Swagger UI to provide the token when
testing protected endpoints.

### Create an application --- `POST /applications`

``` json
{
  "company_name": "Example Technologies",
  "job_title": "Python Developer",
  "location": "Bengaluru",
  "employment_type": "FULL_TIME",
  "source": "Company Website",
  "job_url": "https://example.com/jobs/python-developer",
  "salary_min": 400000,
  "salary_max": 700000,
  "applied_date": "2026-10-01",
  "status": "APPLIED"
}
```

An illustrative response:

``` json
{
  "id": 1,
  "user_id": 1,
  "company_name": "Example Technologies",
  "job_title": "Python Developer",
  "location": "Bengaluru",
  "employment_type": "FULL_TIME",
  "source": "Company Website",
  "job_url": "https://example.com/jobs/python-developer",
  "salary_min": 400000,
  "salary_max": 700000,
  "applied_date": "2026-10-01",
  "status": "APPLIED",
  "created_at": "2026-10-01T10:30:00",
  "updated_at": "2026-10-01T10:30:00"
}
```

IDs and timestamps are examples, not live data.

### Update application status --- `PATCH /applications/1/status`

Example request body (confirm the exact schema in `/docs`):

``` json
{
  "status": "INTERVIEW"
}
```

### Create an interview --- `POST /applications/1/interviews`

``` json
{
  "application_id": 1,
  "interview_type": "Technical Interview",
  "scheduled_at": "2026-10-20",
  "interviewer": "Hiring Manager",
  "meeting_link": "https://example.com/meeting",
  "status": "SCHEDULED"
}
```

The `application_id` in the body must match the ID in the URL.

### Create a follow-up --- `POST /applications/1/followups`

``` json
{
  "application_id": 1,
  "followup_date": "2026-10-15T10:00:00",
  "note": "Follow up with the recruiter about the application."
}
```

### Create a note --- `POST /applications/1/notes`

``` json
{
  "application_id": 1,
  "content": "Recruiter expects to share an update next week."
}
```

### Dashboard --- `GET /dashboard`

Illustrative response based on the assignment example, with
`followups_due` included as an additional project metric:

``` json
{
  "total_applications": 40,
  "saved": 5,
  "applied": 15,
  "screening": 6,
  "interviews": 8,
  "offers": 3,
  "accepted": 1,
  "rejected": 7,
  "withdrawn": 2,
  "followups_due": 4
}
```

The values above are examples. The actual API should calculate
statistics from the database. Keep the meaning of `interviews`
consistent with your implementation: it may count interview records
rather than applications whose status is `INTERVIEW`.

## Authentication Flow

1.  The user registers or logs in.
2.  The backend validates the credentials and returns a JWT access
    token.
3.  The frontend includes the token in `Authorization: Bearer <token>`.
4.  `HTTPBearer` extracts the token.
5.  `verify_access_token()` validates the JWT.
6.  `get_current_user()` reads the user ID from the token and retrieves
    the user from PostgreSQL.
7.  The endpoint performs the requested operation for that user.

## Validation and Error Handling

The backend uses Pydantic schemas to validate request data. Current
application validation includes:

-   Salary minimum must not exceed salary maximum.
-   Application date must not be in the future when creating an
    application.
-   Interview and follow-up records must be associated with the correct
    application.
-   Protected operations check ownership of the relevant records.
-   Authentication failures return HTTP `401`.

Other status codes and validation rules depend on each endpoint. Check
the router and service implementations for exact behavior.

## Security Notes

-   Never commit `.env`, database passwords, or production secret keys.
-   Use a long, random JWT secret key.
-   Store password hashes rather than plaintext passwords.
-   Return only safe user fields from profile endpoints.
-   Enforce authentication and ownership checks on the backend.
-   Use HTTPS and secure deployment configuration outside local
    development.

## Possible Future Improvements

-   Automated backend and frontend tests.
-   Charts for application-status breakdowns.
-   Interview reminders and follow-up completion tracking.
-   CSV export.
-   Production deployment configuration.
-   Accessibility and mobile-layout improvements.

## Author and License

Add your name, repository URL, and license here if required by your
assignment.

------------------------------------------------------------------------

**Before submitting:** compare route paths, request schemas, environment
variable names, and response fields with your current code and
`http://127.0.0.1:8000/docs`.
