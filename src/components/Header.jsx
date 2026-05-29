import { Tags } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-steam-dark py-4 px-6 shadow-md border-b border-steam-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center">
        <Tags className="text-steam-accent text-2xl mr-3 w-6 h-6" />
        <h1 className="text-2xl font-bold tracking-tight text-white">
          GamePrice<span className="text-steam-accent">Tracker</span>
        </h1>
      </div>
    </header>
  );
}
