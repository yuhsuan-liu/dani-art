const steps = [
  {
    title: 'See the room',
    body: 'Each piece of furniture is something the artist actually wants. Price tags are artworks for sale.',
  },
  {
    title: 'Buy the artwork',
    body: 'When you purchase a painting, that furniture lights up as funded. You know exactly what your support provides.',
  },
  {
    title: 'Dani gets the couch',
    body: 'Sold pieces turn colorful on the floor map. The goal is simple: buy this painting, Dani gets a new mattress.',
  },
]

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-center font-serif text-2xl text-stone-900 sm:text-3xl">
        How it works
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-stone-600">
        Not a typical gallery. It is an art registry with a floor plan: muted furniture
        is still available, colorful furniture is already purchased.
      </p>
      <ol className="mt-10 grid gap-6 sm:grid-cols-3">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="rounded-2xl border border-stone-200 bg-white p-6"
          >
            <span className="text-xs font-medium tracking-widest text-amber-700">
              STEP {index + 1}
            </span>
            <h3 className="mt-2 font-medium text-stone-900">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
