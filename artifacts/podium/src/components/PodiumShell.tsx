import { ArrowUpRight, History, Home, Mic2 } from 'lucide-react';
import { Link, useLocation } from 'wouter';

const navItems = [
  { href: '/', label: 'Practice room', icon: Home },
  { href: '/history', label: 'Your sessions', icon: History },
];

export function PodiumShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[244px] flex-col bg-[hsl(var(--sidebar))] px-5 py-7 text-[hsl(var(--sidebar-foreground))] lg:flex">
        <Link href="/" className="mb-16 flex items-center gap-3" data-testid="link-brand">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]">
            <Mic2 size={20} strokeWidth={2.5} />
          </span>
          <span className="font-serif text-2xl font-semibold tracking-[-0.04em]">podium</span>
        </Link>
        <p className="mb-4 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--sidebar-foreground)/.54)]">Your stage</p>
        <nav className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} className={`flex items-center justify-between rounded-xl px-3 py-3 text-sm transition-colors ${location === href ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-primary))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`}>
              <span className="flex items-center gap-3"><Icon size={17} />{label}</span>
              {location === href && <ArrowUpRight size={15} />}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-[hsl(var(--sidebar-border))] pt-5">
          <p className="px-3 text-xs leading-5 text-[hsl(var(--sidebar-foreground)/.56)]">A quiet place to find your voice.</p>
          <div className="mt-5 flex items-center gap-2 px-3"><span className="h-2 w-2 rounded-full bg-[hsl(var(--sidebar-primary))]" /><span className="font-mono text-[10px] uppercase tracking-[.12em] text-[hsl(var(--sidebar-foreground)/.54)]">private session</span></div>
        </div>
      </aside>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border/70 bg-background/90 px-5 py-4 backdrop-blur lg:hidden">
        <Link href="/" className="flex items-center gap-2.5" data-testid="link-mobile-brand"><span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground"><Mic2 size={16} /></span><span className="font-serif text-xl font-semibold">podium</span></Link>
        <Link href="/history" className="rounded-lg p-2 text-muted-foreground hover:bg-secondary" data-testid="link-mobile-history"><History size={19} /></Link>
      </header>
      <main className="lg:pl-[244px]">{children}</main>
    </div>
  );
}

export function PageLoading({ label = 'Preparing your room' }: { label?: string }) {
  return <div className="mx-auto max-w-6xl px-5 py-12 lg:px-12"><div className="h-3 w-24 animate-pulse rounded bg-secondary" /><div className="mt-8 h-14 max-w-xl animate-pulse rounded bg-secondary" /><p className="mt-5 font-mono text-xs uppercase tracking-[.16em] text-muted-foreground">{label}</p></div>;
}

export function PageError({ onRetry }: { onRetry?: () => void }) {
  return <div className="mx-auto max-w-xl px-5 py-24 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[hsl(var(--accent)/.14)] text-accent"><Mic2 size={22} /></div><h2 className="mt-6 font-serif text-3xl">The room is quiet.</h2><p className="mt-3 text-muted-foreground">We couldn't reach your practice library. Check your connection, then try again.</p>{onRetry && <button onClick={onRetry} className="mt-7 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground" data-testid="button-retry">Try again</button>}</div>;
}