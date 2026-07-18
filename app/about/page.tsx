export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <p className="lab-label">About the Lab</p>

      <h1 className="lab-heading mt-3 max-w-3xl text-7xl sm:text-8xl">
        Small ideas, properly made.
      </h1>

      <p className="font-handwritten mt-5 rotate-[-1deg] text-2xl text-[var(--accent-strong)]">
        pleasantly unnecessary counts as necessary around here
      </p>

      <div className="mt-10 grid gap-6 text-lg leading-8 text-[var(--muted)] md:grid-cols-2">
        <div className="lab-card p-7">
          <p className="font-display text-4xl text-[var(--foreground)]">
            What we make
          </p>
          <p className="mt-4">
            Nice Little Click Lab makes useful, playful internet things for
            oddly specific moments.
          </p>
        </div>

        <div className="lab-card p-7">
          <p className="font-display text-4xl text-[var(--foreground)]">
            How we make them
          </p>
          <p className="mt-4">
            Every Click should be quick to understand, pleasant to use, and
            finished before it grows into a giant platform nobody asked for.
          </p>
        </div>
      </div>
    </section>
  );
}
