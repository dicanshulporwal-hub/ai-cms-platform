import { ContentImporterPage } from '../../content-importer-client';

export default function Page({ params }: { params: { jobId: string } }) {
  return <ContentImporterPage mode="review" jobId={params.jobId} />;
}
