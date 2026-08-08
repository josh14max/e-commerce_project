interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export default function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <div className="pt-10 pb-6 sm:pt-14 sm:pb-10">
      {eyebrow && (
        <p className="eyebrow mb-3">{eyebrow}</p>
      )}
      <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-ora-text leading-[1.1] tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-4 max-w-2xl text-base sm:text-lg text-ora-text-muted leading-relaxed font-light">
          {subtitle}
        </p>
      )}
    </div>
  );
}
