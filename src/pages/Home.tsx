import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { getFeatured } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import ProductImage from '@/components/ProductImage';
import type { Product } from '@/lib/types';
import { useSiteSettings } from '@/lib/siteSettings';

interface HomeProps {
  navigate: (to: string) => void;
}

export default function Home({ navigate }: HomeProps) {
  const { settings } = useSiteSettings();
  const home = settings.home;
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    let active = true;
    getFeatured().then((data) => {
      if (active) {
        setFeatured(data);
        setLoadingFeatured(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      {/* ────────── Hero full-screen ────────── */}
      <section className="relative h-[88vh] min-h-[600px] w-full overflow-hidden">
        <picture>
          <source media="(min-width: 768px)" srcSet={home.heroDesktopImage} />
          <img
            src={home.heroMobileImage}
            alt="NG Hair — Perruques & mode femme"
            loading="eager"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
        <div className="relative container-ora h-full flex flex-col items-start justify-center text-left text-white">
          {/*
          <p className="eyebrow text-white/80 mb-5">Perruques & mode femme</p>
          */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light leading-[1.05] tracking-tight max-w-3xl">
            <span className="block text-white">{home.heroTitle}</span>
            <span className="block text-nge-gold">{home.heroAccent}</span>
          </h1>
          <div className="mt-6 flex items-center gap-3 w-full max-w-xs">
            <span className="h-px flex-1 bg-white/40" />
            <span className="h-1.5 w-1.5 rotate-45 bg-nge-gold" />
            <span className="h-px flex-1 bg-white/40" />
          </div>
          <p className="mt-6 max-w-xl text-base sm:text-lg text-white/85 font-light leading-relaxed">
            {home.heroSubtitle}
          </p>
          <div className="mt-10 flex flex-wrap justify-start gap-3">
          </div>
        </div>
      </section>
    
      {/* ────────── Category ────────── */}
      <section className="container-ora py-16 sm:py-24">
        {/*
        <div className="max-w-md mx-auto">
          <button onClick={() => navigate('/perruques')} className="group relative aspect-[4/5] overflow-hidden text-left block w-full">
            <ProductImage
              src="https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=900&h=1100&fit=crop"
              alt="Perruques"
              className="absolute inset-0 h-full w-full"
              imgClassName="group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h2 className="font-display text-4xl sm:text-5xl font-light tracking-tight">Perruques</h2>
              <span className="mt-3 text-[11px] font-medium uppercase tracking-[0.25em] flex items-center gap-2 opacity-80 group-hover:opacity-100 group-hover:gap-3 transition-all">
                Explorer <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </button>
        </div>
        */}
      </section>

      {/* ────────── Featured ────────── */}
      <section className="container-ora pb-16 sm:pb-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="eyebrow mb-5">{home.featuredEyebrow}</p>
            <h2 className="font-display text-3xl sm:text-4xl font-light tracking-tight">{home.featuredTitle}</h2>
          </div>
          <button
            onClick={() => navigate('/perruques')}
            className="hidden sm:flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-nge-muted hover:text-nge-black hover:gap-3 transition-all"
          >
            Tout voir <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        {loadingFeatured ? (
          <div className="py-16 text-center text-ora-text-muted">Chargement des produits…</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} navigate={navigate} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ────────── Story ────────── */}
      <section className="bg-nge-bg py-16 sm:py-24">
        <div className="container-ora grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <ProductImage
            src={home.storyImage}
            alt="L'atelier NG Hair"
            className="aspect-[4/3]"
          />
          <div>
            <p className="eyebrow mb-3">{home.storyEyebrow}</p>
            <h2 className="font-display text-3xl sm:text-4xl font-light leading-tight tracking-tight">
              {home.storyTitle}
            </h2>
            <p className="mt-5 text-base text-nge-muted leading-relaxed font-light">
              {home.storyBody}
            </p>
            <button onClick={() => navigate('/a-propos')} className="btn-outline mt-8">
              {home.storyButton} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
