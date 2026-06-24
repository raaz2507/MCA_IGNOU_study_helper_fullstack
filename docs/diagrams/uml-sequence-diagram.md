# UML Sequence Diagram

## Explanation

This sequence diagram shows a common implemented user flow: login, browse the question bank, open a question and save progress. It follows the frontend REST client, Express controllers/services/repositories, Prisma and PostgreSQL.

```mermaid
sequenceDiagram
    actor Student as Student / Learner
    participant Browser as Frontend Page
    participant API as Express REST API
    participant Auth as Auth Module
    participant Questions as Questions Module
    participant Progress as Progress Module
    participant Prisma as Prisma ORM
    participant DB as PostgreSQL

    Student->>Browser: Enter username and password
    Browser->>API: POST /api/auth/login
    API->>Auth: Validate credentials
    Auth->>Prisma: Find user and create refresh session
    Prisma->>DB: Read User and write Session
    DB-->>Prisma: User and session data
    Prisma-->>Auth: Authenticated user
    Auth-->>API: Access and refresh tokens
    API-->>Browser: Set secure cookies and return user

    Student->>Browser: Open question bank for a subject
    Browser->>API: GET /api/questions/manifest?subject=code
    API->>Questions: Load question manifest
    Questions->>Prisma: Query questions for subject
    Prisma->>DB: Read Subject and Question records
    DB-->>Prisma: Question list
    Prisma-->>Questions: Manifest data
    Questions-->>API: Question manifest
    API-->>Browser: Display question list

    Student->>Browser: Select a question
    Browser->>API: GET /api/questions/item?subject=code&file=id
    API->>Questions: Load question item
    Questions->>Prisma: Query question and answers
    Prisma->>DB: Read Question and Answer records
    DB-->>Prisma: Question details
    Prisma-->>Questions: Question data
    Questions-->>API: Question with answer modes
    API-->>Browser: Display question and answer

    Student->>Browser: Mark completed, bookmark or revision
    Browser->>API: PUT /api/progress?subject=code
    API->>Progress: Verify authenticated user and save state
    Progress->>Prisma: Upsert Progress records
    Prisma->>DB: Write progress state
    DB-->>Prisma: Saved records
    Prisma-->>Progress: Saved progress
    Progress-->>API: Updated state
    API-->>Browser: Show saved progress
```

## Notes / Assumptions

- Authentication uses HTTP-only cookies named by the backend for access and refresh tokens.
- The frontend API client retries once through `/api/auth/refresh` when an authenticated request receives `401`.
- The diagram shows the database-backed flow; static resource pages and PDF viewing use served frontend assets in addition to API data.
