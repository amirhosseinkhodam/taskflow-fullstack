# ADR-0001: Use Raw pg Pool Instead of Prisma

## Status

Accepted

## Context

TaskFlow needs a data access layer for PostgreSQL. The options considered were:

1. **Prisma ORM** — Type-safe queries, schema migrations, auto-generated client.
2. **Raw `pg` Pool** — Direct SQL queries, no abstraction layer.
3. **TypeORM** — Active Record pattern, migrations, entity decorators.
4. **Knex.js** — Query builder, migrations, but not a full ORM.

## Decision

Use raw `pg` Pool for database access.

## Consequences

### Easier

- No schema migration overhead.
- Full control over SQL queries.
- Simpler debugging (direct SQL visibility).
- No ORM version upgrades or breaking changes.

### Harder

- No type-safe query builder.
- Manual SQL query writing and maintenance.
- No automatic schema synchronization.
- Manual result mapping to TypeScript interfaces.

### Trade-offs

- **Prisma**: More setup, but type-safe and migration-friendly. Overhead for a small app.
- **Raw `pg`**: Less setup, but requires manual SQL. Simpler for a small app with known queries.
- **TypeORM**: Active Record pattern doesn't fit the NestJS module pattern well.
- **Knex.js**: Query builder is nice, but adds a dependency without full ORM benefits.

## Alternatives Considered

- **Prisma**: Rejected due to migration overhead and generated client complexity.
- **TypeORM**: Rejected due to Active Record pattern mismatch.
- **Knex.js**: Considered but raw `pg` is simpler for this use case.

## Notes

- `@prisma/client` is installed but unused. Can be removed from `package.json`.
- All camelCase columns in SQL must be quoted (e.g., `"projectId"`, `"createdAt"`).
- Tables auto-create on app startup via `ensureTables()`.
