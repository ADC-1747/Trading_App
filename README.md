# Trading App 





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
