# Trading App







+-------------------+         REST API         +------------------+
|                   | ----------------------> |                  |
|     React UI      |                          |   FastAPI App    |
|                   | <---------------------- |                  |
+-------------------+       JSON Response     +------------------+
       |                                      |       |
       | WebSocket (live orderbook)           |       | SQLAlchemy
       v                                      v       v
+-------------------+                      +------------------+
|  WebSocket Client |                      |   PostgreSQL DB  |
+-------------------+                      |  users, orders,  |
                                           |  trades, symbols |
                                           +------------------+
                                                  |
                                                  | Redis
                                                  v
                                           +------------------+
                                           |   Redis Cache /  |
                                           |  Rate Limiter    |
                                           +------------------+
