# Relational database providers

`backend/prisma/schema.prisma` is the canonical PostgreSQL-compatible model.
Run `npm run prisma:schemas` after every model change. It generates provider
schemas under `providers/postgresql`, `providers/mysql`, and `providers/sqlite`.

SQLite does not support Prisma enums, so generated SQLite models store those
fields as strings with the same defaults. Application validation remains in
the domain/schema layer.

Select the runtime configuration and generate the matching client before
starting or deploying:

```text
DATABASE_ADAPTER=prisma
DATABASE_PROVIDER=postgresql | mysql | sqlite
DATABASE_URL=<provider URL>
```

Commands:

```text
npm run prisma:generate:postgresql
npm run prisma:generate:mysql
npm run prisma:generate:sqlite
npm run prisma:validate:providers
```

Migration commands follow the same suffix, for example
`npm run prisma:migrate:mysql` during development and
`npm run prisma:deploy:mysql` during deployment. Always generate the matching
client before starting the application.

Provider migrations live beside each generated schema. Never apply the
PostgreSQL migration directory to MySQL or SQLite. Generate/review a migration
for the selected provider, test it against a disposable database, and only
then deploy it.

Generated MySQL/SQLite schemas contain non-secret placeholder URLs for CLI
validation. `PrismaClient` overrides the placeholder with `DATABASE_URL` at
runtime.
