export function Blog() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="font-serif text-3xl text-stone-900">Blog</h1>
      <p className="mt-4 text-stone-600">
        Public posts will load from the backend later
        (<code className="text-sm">GET /blog</code>).
      </p>
    </div>
  )
}
