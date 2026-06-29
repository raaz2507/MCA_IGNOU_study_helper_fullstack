# File-driven content

`content.setup.ts` is the hand-maintained bootstrap source for program,
semester, subject, folder and fallback-image configuration. Individual PDFs
are never listed there.

Run `npm run content:scan` after adding or replacing PDFs. The scanner walks
program guides, assignments, semester study material and question-paper
folders, then writes `backend/data/content.manifest.json`. Entries have stable
path IDs, SHA-256 checksums and normalized subject/semester metadata.

The manifest is derived data and can be rebuilt. Application metadata belongs
behind repository ports; PDF bytes remain in file/object storage.

`DATABASE_ADAPTER=prisma` selects the relational adapter. PostgreSQL, MySQL and
SQLite use provider-specific Prisma schemas/migrations. The Firestore port is
present but deliberately fails fast until Firebase Admin credentials, indexes
and its repository implementation are configured.
