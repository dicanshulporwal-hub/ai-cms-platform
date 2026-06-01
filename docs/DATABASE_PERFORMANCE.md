# Database Performance Guidelines

## Overview

This project uses MySQL with Prisma ORM. Follow these guidelines to maintain database performance as the CMS scales.

## Indexing Strategy

### Existing Indexes

All models follow these indexing patterns:
- Primary key: `@id @default(cuid())`
- Foreign keys: `@@index([foreignKeyField])`
- Status fields: `@@index([status])`
- Soft deletes: `@@index([deletedAt])`
- Unique constraints: `@unique` on slugs, emails, keys

### When to Add Indexes

Add an index when:
- A column is used in `WHERE` clauses frequently
- A column is used in `ORDER BY` clauses
- A column is used in `JOIN` conditions
- A combination of columns is queried together (composite index)

Do NOT add indexes when:
- The table has very few rows (< 1000)
- The column has very low cardinality (e.g., boolean with 50/50 split)
- The column is rarely queried
- Write performance is more critical than read performance

### Composite Index Examples

```prisma
// Good: frequently queried together
@@index([status, deletedAt])
@@index([templateId, isActive])
@@index([sourceType, sourceId])

// Bad: rarely queried together
@@index([createdAt, updatedAt])  // Don't need both
```

## Query Optimization

### Select Only What You Need

```typescript
// Bad - fetches all columns
const pages = await prisma.page.findMany();

// Good - fetches only needed columns
const pages = await prisma.page.findMany({
  select: { id: true, title: true, slug: true, status: true },
});
```

### Always Paginate

```typescript
// Bad - unbounded query
const all = await prisma.page.findMany({ where: { status: 'PUBLISHED' } });

// Good - paginated
const pages = await prisma.page.findMany({
  where: { status: 'PUBLISHED', deletedAt: null },
  take: 20,
  skip: (page - 1) * 20,
  orderBy: { updatedAt: 'desc' },
});
```

### Avoid N+1 Queries

```typescript
// Bad - N+1 pattern
const posts = await prisma.blogPost.findMany();
for (const post of posts) {
  const author = await prisma.user.findUnique({ where: { id: post.authorId } });
}

// Good - eager loading
const posts = await prisma.blogPost.findMany({
  include: { author: { select: { id: true, name: true } } },
});
```

### Use Count Instead of Fetching All

```typescript
// Bad - fetches all records just to count
const items = await prisma.page.findMany({ where: { status: 'PUBLISHED' } });
const count = items.length;

// Good - database-level count
const count = await prisma.page.count({ where: { status: 'PUBLISHED' } });
```

### Batch Operations

```typescript
// Bad - individual creates in a loop
for (const item of items) {
  await prisma.auditLog.create({ data: item });
}

// Good - batch create
await prisma.auditLog.createMany({ data: items });
```

## Soft Delete Pattern

All content models use soft deletes:

```typescript
// Always filter out deleted records
where: { deletedAt: null }

// Soft delete instead of hard delete
await prisma.page.update({
  where: { id },
  data: { deletedAt: new Date() },
});
```

## Connection Management

- Prisma manages connection pooling automatically.
- Default pool size is appropriate for development.
- For production, configure `connection_limit` in DATABASE_URL:
  ```
  DATABASE_URL="mysql://user:pass@host:3306/db?connection_limit=10"
  ```

## Query Monitoring

### Development
- Enable Prisma query logging in development:
  ```typescript
  const prisma = new PrismaClient({ log: ['query', 'warn', 'error'] });
  ```

### Production
- Monitor slow queries (> 100ms)
- Monitor connection pool usage
- Set up alerts for query timeouts

## Table Size Considerations

| Table | Expected Growth | Strategy |
|-------|----------------|----------|
| pages | Low (hundreds) | No special handling |
| blog_posts | Medium (thousands) | Paginate, index status |
| media | High (thousands) | Paginate, index folder/mimeType |
| audit_logs | Very High | Consider archiving old logs |
| ai_usage_logs | High | Consider monthly partitioning |
| chatbot_messages | Very High | Archive old conversations |
| broken_link_issues | Medium | Clean up after fixes |
| accessibility_audit_issues | Medium | Keep latest audit only |

## Migration Best Practices

- Always use `prisma db push` for development.
- Use `prisma migrate` for production deployments.
- Never modify production data directly.
- Test migrations on a copy of production data first.
- Add indexes in separate migrations from schema changes.

## Environment-Specific Settings

| Setting | Development | Production |
|---------|-------------|------------|
| Connection pool | 5 | 10-20 |
| Query logging | Enabled | Disabled (or slow-query only) |
| Prisma metrics | Disabled | Enabled |
| Cache TTL | 0 (no cache) | 60-300 seconds |
