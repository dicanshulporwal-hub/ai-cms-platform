import { ContentImporterPage } from '../../content-importer-client';

export default function Page({ params }: { params: { id: string } }) {
  return <ContentImporterPage mode="job-detail" jobId={params.id} />;
}
