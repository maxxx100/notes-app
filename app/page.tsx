import NotesGrid from './components/NotesGrid';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F5F0E8]">
      <div className="max-w-5xl mx-auto px-16 py-20">
        <NotesGrid />
      </div>
    </main>
  );
}
