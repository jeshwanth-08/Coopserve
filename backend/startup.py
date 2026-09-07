import os
import socket
import time
from urllib.parse import urlparse


database_url = os.environ["DATABASE_URL"]
database = urlparse(database_url)
host = database.hostname or "localhost"
port = database.port or 5432
deadline = time.time() + 60

while time.time() < deadline:
    try:
        socket.create_connection((host, port), 2).close()
        break
    except OSError:
        time.sleep(1)
else:
    raise SystemExit(f"PostgreSQL did not become reachable at {host}:{port}")