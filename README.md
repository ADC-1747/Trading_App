# Trading App 

## Tech Stack
- Frontend : React
- Backend : FastAPI
- Database : PostgreSQL
- In Memory DB : Redis
- Deployment : Docker


## Setup setps
- Step 1 : Clone the repo main branch.
- Step 2 : Make sure you have docker installed and running.
- Step 3 : Run the command `docker compose up --build -d` in the root directory.
- Step 4 : Go to https://localhost:3000 for using the app.




## Architecture

```mermaid
flowchart TD
    subgraph Frontend
        A[React UI] -->|REST API| B[FastAPI Backend]
        A -->|WebSocket| B
    end

    subgraph Backend
        B -->|SQLAlchemy ORM| C[(PostgreSQL)]
        B -->|Redis Cache / Rate Limiter| D[(Redis)]
    end

    subgraph Database
        C --> Users[Users Table]
        C --> Orders[Orders Table]
        C --> Trades[Trades Table]
        C --> Symbols[Symbols Table]
    end

```
## Test Coverage 
<img width="960" height="540" alt="Test_coverage" src="https://github.com/user-attachments/assets/2b4eac66-526a-47c1-a86b-d158c6de20dd" />
