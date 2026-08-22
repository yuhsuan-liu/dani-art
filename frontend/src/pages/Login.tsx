export function Login() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="font-serif text-3xl text-stone-900">Artist Login</h1>
      <p className="mt-4 text-stone-600">
        Google OAuth for Dani will plug in here. Until then, this is a public
        placeholder so the homepage nav has somewhere to go.
      </p>
      <button
        type="button"
        disabled
        className="mt-8 w-full rounded-lg bg-stone-900 px-4 py-3 text-white opacity-60"
      >
        Continue with Google
      </button>
    </div>
  )
}
