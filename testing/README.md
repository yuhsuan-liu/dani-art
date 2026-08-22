# Backend CRUD Tests

Run the full backend CRUD test suite:

```bash
cd backend
source venv/bin/activate
python ../testing/run_crud_tests.py
```

Requires `backend/.env` with `SUPABASE_URL` and `SUPABASE_KEY` (service role).

Exit code `0` means all tests passed; `1` means at least one failure.
