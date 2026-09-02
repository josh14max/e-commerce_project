import { Heart, Sparkles, Leaf, ArrowRight } from 'lucide-react';
import ProductImage from '@/components/ProductImage';
import { useSiteSettings } from '@/lib/siteSettings';

interface AboutProps {
  navigate: (to: string) => void;
}

const valueIcons = [Heart, Sparkles, Leaf];

export default function About({ navigate }: AboutProps) {
  const { settings } = useSiteSettings();
  const about = settings.about;
  return (
    <div>
      {/* Hero */}
      <section className="container-ora pt-10 sm:pt-16 pb-8">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">{about.heroEyebrow}</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light text-ora-text leading-[1.1] tracking-tight">
            {about.heroTitle}
          </h1>
          <p className="mt-5 text-lg text-ora-text-muted leading-relaxed">
            {about.heroIntro}
          </p>
        </div>
      </section>

      {/* Image band */}
      <section className="container-ora pb-12">
        <ProductImage
          src={about.heroImage}
          alt="L'univers NG Hair"
          eager
          className="aspect-[16/7] rounded-sm shadow-soft"
        />
      </section>

      {/* Story */}
      <section className="container-ora py-10 sm:py-14">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-light text-ora-text mb-4 tracking-tight">{about.storyTitle}</h2>
            <div className="space-y-4 text-ora-text-muted leading-relaxed">
              {about.storyParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {about.values.map((value, index) => {
              const Icon = valueIcons[index % valueIcons.length];
              return (
              <div key={`${value.title}-${index}`} className="rounded-2xl border border-ora-line bg-white p-5">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-ora-accent/10 text-ora-accent mb-3">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-base font-normal text-ora-text mb-1">{value.title}</h3>
                <p className="text-sm text-ora-text-muted leading-relaxed">{value.description}</p>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* Three profiles */}
      <section className="bg-ora-accent text-ora-bg">
        <div className="container-ora py-14 sm:py-20">
          <h2 className="font-display text-3xl sm:text-4xl font-light mb-3 max-w-2xl leading-tight tracking-tight">
            {about.profilesTitle}
          </h2>
          <p className="text-ora-bg/80 max-w-2xl mb-10 leading-relaxed">
            {about.profilesIntro}
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {about.profiles.map((profile, index) => (
              <div key={`${profile.title}-${index}`} className="rounded-2xl overflow-hidden bg-white/10">
                <ProductImage src={profile.image} alt={profile.title} className="aspect-[3/2]" />
                <div className="p-5">
                  <h3 className="font-display text-lg font-normal mb-2">{profile.title}</h3>
                  <p className="text-sm text-ora-bg/80 leading-relaxed font-light">{profile.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-ora py-14 sm:py-20 text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-light text-ora-text mb-3 tracking-tight">
          {about.ctaTitle}
        </h2>
        <p className="text-ora-text-muted max-w-xl mx-auto mb-7 leading-relaxed">
          {about.ctaBody}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => navigate('/perruques')} className="btn-primary">
            {about.ctaButton} <ArrowRight className="h-4 w-4" />
          </button>
          {/*
          <button onClick={() => navigate('/vetements')} className="btn-outline">
            Voir les vêtements
          </button>
          */}
        </div>
      </section>
    </div>
  );
}
