export default function PublicHomePage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          AI CMS public preview
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
          Published content will render here.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
          This MVP public app includes the chatbot widget and same-origin chatbot
          API proxy. Page and blog rendering can be added next without changing
          the chatbot API contract.
        </p>
      </section>
    </main>
  );
}
