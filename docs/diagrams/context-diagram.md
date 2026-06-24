# Context Diagram / User-Based Diagram

## Explanation

This context diagram shows how the main users interact with the GyanPath MCA Study Helper system. The system serves study pages, question banks, previous-year papers, authentication, progress tracking, admin management and editable content APIs.

```mermaid
flowchart LR
    Student["Student / Learner"]
    Editor["Editor"]
    Admin["Administrator"]
    Browser["Web Browser"]
    System["GyanPath MCA Study Helper<br/>Express + Static Frontend"]
    Database[("PostgreSQL Database<br/>via Prisma ORM")]
    Files[("Frontend Static Assets<br/>PDFs, images, HTML pages")]
    YouTube["YouTube oEmbed<br/>for lecture metadata"]

    Student -->|"View subjects, papers, study material, questions"| Browser
    Student -->|"Login, manage profile, save progress"| Browser
    Editor -->|"Manage banners, lectures, contributors"| Browser
    Admin -->|"Manage users, subjects, semesters, assignments, reports, settings"| Browser

    Browser -->|"Page requests and REST API calls"| System
    System -->|"Serve pages and assets"| Browser
    System -->|"Read/write application data"| Database
    System -->|"Serve PDFs, images and page assets"| Files
    System -->|"Fetch lecture metadata when Editor/Admin requests it"| YouTube
```

## Notes / Assumptions

- The application is currently an Express + TypeScript modular monolith that serves the frontend and REST APIs.
- Student-facing discussion and chat pages exist, but implemented backend routes for discussion and chat are not present in the current route registration.
- The Prisma schema includes `MODERATOR`, but current backend route guards mainly use `USER`, `EDITOR` and `ADMIN`.
- Redis, BullMQ and Socket.IO are present as foundations/dependencies, but the active documented flows are based on implemented REST routes.
