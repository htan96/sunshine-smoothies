import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
  title?: string;
  action?: React.ReactNode;
}

export function Section({
  children,
  className,
  label,
  title,
  action,
}: SectionProps) {
  return (
    <section className={cn("py-14 md:py-16 px-6 md:px-12", className)}>
      {(label || title || action) && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            {label && (
              <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-muted)] mb-1">
                {label}
              </p>
            )}
            {title && (
              <h2 className="text-2xl md:text-3xl font-heading font-semibold text-[var(--color-charcoal)]">
                {title}
              </h2>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
