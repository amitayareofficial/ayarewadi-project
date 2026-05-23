# db

Run database helpers against the PostgreSQL database used by the server.

## Context

- Database: PostgreSQL via `pg` Pool
- Connection comes from `DATABASE_URL` in the server's `.env` file
- Schema and queries live in `server/index.js` and `server/db.js`

## Common operations

When the user asks for a db operation, choose the right one:

### List all tables
```bash
cd /home/amit/Music/website/aw-project/server && node -e "
require('dotenv').config();
const pool = require('./db');
pool.query(\"SELECT tablename FROM pg_tables WHERE schemaname='public'\")
  .then(r => { console.table(r.rows); pool.end(); });
"
```

### Describe a table (replace TABLE_NAME)
```bash
cd /home/amit/Music/website/aw-project/server && node -e "
require('dotenv').config();
const pool = require('./db');
pool.query(\"SELECT column_name, data_type FROM information_schema.columns WHERE table_name='TABLE_NAME'\")
  .then(r => { console.table(r.rows); pool.end(); });
"
```

### Run a raw SQL query (replace the SQL)
```bash
cd /home/amit/Music/website/aw-project/server && node -e "
require('dotenv').config();
const pool = require('./db');
pool.query('SELECT * FROM TABLE_NAME LIMIT 20')
  .then(r => { console.table(r.rows); pool.end(); });
"
```

### Count rows in a table (replace TABLE_NAME)
```bash
cd /home/amit/Music/website/aw-project/server && node -e "
require('dotenv').config();
const pool = require('./db');
pool.query('SELECT COUNT(*) FROM TABLE_NAME')
  .then(r => { console.log(r.rows[0]); pool.end(); });
"
```

## Notes

- Always call `pool.end()` to close the connection after queries.
- Never run DELETE or DROP without explicit user confirmation.
- If `DATABASE_URL` is missing, ask the user to check `server/.env`.
