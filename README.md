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


## Screenshots
<img width="960" height="540" alt="HomePage" src="https://github.com/user-attachments/assets/8d7ec6c6-12ac-4ede-99c9-2126903ad6b0" />
<img width="960" height="540" alt="RegisterPage" src="https://github.com/user-attachments/assets/17edadb1-4923-4562-8b7b-198ec0ccc74c" />
<img width="960" height="540" alt="LoginPage" src="https://github.com/user-attachments/assets/1c2e1838-44e7-4fd1-92e8-7a72e7644acf" />
<img width="960" height="540" alt="UserPage" src="https://github.com/user-attachments/assets/4c7aeb66-3144-40d9-82db-d2ead3bb9195" />
<img width="960" height="540" alt="AdminPage" src="https://github.com/user-attachments/assets/d21c017c-0aa0-4648-b41f-edf42fcec6e7" />
<img width="960" height="540" alt="SymbolsPage" src="https://github.com/user-attachments/assets/4c9760a9-25f9-4a8b-a16a-89329dd0c3de" />
<img width="960" height="540" alt="OrderForm" src="https://github.com/user-attachments/assets/9934f9b4-9655-47a5-8bd7-5a94f4d61a51" />
<img width="960" height="540" alt="OrderBook" src="https://github.com/user-attachments/assets/8029377a-3296-434d-8c3f-f36f98f313e6" />

## Approaches for scaling backend concurrency
- Simple approach could be using row-level locks for transactions to avoid race conditions.
- Implementing a priority queue for incoming requests for a smooth and sequential execution.
- Nginx for load balancing incase of high number of requests.
- Implementing the matching engine and the queue on a single thread hence no chance of leakage or locking problems.
