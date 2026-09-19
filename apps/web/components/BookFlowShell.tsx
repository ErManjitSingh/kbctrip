import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BookStepper } from './BookStepper';
import { CatalogHeader } from './CatalogHeader';
import { SiteFooter } from './SiteFooter';

export function BookFlowShell({
  step,
  kicker,
  title,
  backHref,
  backLabel,
  children,
  confirm,
}: {
  step: 1 | 2 | 3;
  kicker: string;
  title: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
  confirm?: boolean;
}) {
  return (
    <>
      <main className="discover-page">
        <CatalogHeader />
        <section className="book-hero">
          <div className="book-hero-photo" aria-hidden="true" />
          <div className="page-width book-hero-inner">
            {backHref && (
              <Link href={backHref} className="discover-back book-hero-back">
                <ArrowLeft size={15} /> {backLabel ?? 'Back'}
              </Link>
            )}
            <p>{kicker}</p>
            <h1>{title}</h1>
            <BookStepper step={step} />
          </div>
        </section>
        <section className={`page-width book-flow${confirm ? ' book-flow-confirm' : ''}`}>{children}</section>
      </main>
      <SiteFooter />
    </>
  );
}
