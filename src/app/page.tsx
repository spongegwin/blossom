export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-semibold">Blossom</h1>
      <p className="mt-2 text-muted-foreground">Find a coach-in-training</p>
      <div className="mt-6 flex gap-3">
        <a href="/client/intake" className="underline">Find a coach</a>
        <a href="/coach/apply" className="underline">Become our coach-in-training partner</a>
      </div>
    </main>
  )
}