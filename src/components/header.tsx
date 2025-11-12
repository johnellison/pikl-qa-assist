import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-3">
            <div className="flex flex-col">
              <span className="font-bold text-xl leading-none">Pikl</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">QA Assist</span>
            </div>
          </Link>
        </div>

        <nav className="flex items-center gap-6 text-sm flex-1">
          <Link
            href="/"
            className="transition-colors hover:text-foreground/80 text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/calls"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Calls
          </Link>
          <Link
            href="/agents"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Agents
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" asChild>
            <Link href="/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
