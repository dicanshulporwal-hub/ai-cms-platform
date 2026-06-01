import { fetchGlobalSchema } from '@/lib/api-client';

export async function StructuredDataInjector() {
  const schemas = await fetchGlobalSchema();

  if (!schemas || schemas.length === 0) return null;

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
