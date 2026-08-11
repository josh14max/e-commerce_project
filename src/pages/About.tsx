import { Heart, Sparkles, Leaf, ArrowRight } from 'lucide-react';
import ProductImage from '@/components/ProductImage';

interface AboutProps {
  navigate: (to: string) => void;
}

export default function About({ navigate }: AboutProps) {
  return (
    <div>
      {/* Hero */}
      <section className="container-ora pt-10 sm:pt-16 pb-8">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">La maison NG</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light text-ora-text leading-[1.1] tracking-tight">
            Une lumière pour chaque femme.
          </h1>
          <p className="mt-5 text-lg text-ora-text-muted leading-relaxed">
            NG Hair, c'est avant tout une maison qui croit que la beauté n'est pas un standard, mais une
            lueur qui vous appartient — quelle que soit votre histoire, vos cheveux, votre pays.
          </p>
        </div>
      </section>

      {/* Image band */}
      <section className="container-ora pb-12">
        <ProductImage
          src="https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=1600&h=700&fit=crop"
          alt="L'univers NG Hair"
          eager
          className="aspect-[16/7] rounded-sm shadow-soft"
        />
      </section>

      {/* Story */}
      <section className="container-ora py-10 sm:py-14">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-light text-ora-text mb-4 tracking-tight">Notre histoire</h2>
            <div className="space-y-4 text-ora-text-muted leading-relaxed">
              <p>
                NG Hair est né d'une conversation entre femmes. L'une cherchait une perruque élégante pour le travail.
                L'autre, fière de ses cheveux afro, voulait des pièces protectrices respectueuses. La troisième
                traversait un traitement et avait besoin de douceur avant tout.
              </p>
              <p>
                Trois femmes, trois histoires, une même envie : se sentir belles sans avoir à se justifier. Nous
                avons décidé qu'aucune ne devrait choisir entre esthétique, héritage et bien-être. Qu'aucune ne
                soit laissée de côté.
              </p>
              <p>
                Aujourd'hui, NG Hair réunit tout type de perruques dans une même maison, pensés pour toutes les femmes —
                et livrés jusqu'à vous.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Heart, t: 'Inclusif par essence', d: 'Aucune femme à part. Chaque profil a sa place, chaque histoire est légitime.' },
              { icon: Sparkles, t: 'Beauté & confort', d: 'Des matières douces, des capillages pensés pour le port prolongé, sans compromis.' },
              { icon: Leaf, t: 'Choix raisonné', d: 'des partenaires en qui nous croyons.' },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-ora-line bg-white p-5">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-ora-accent/10 text-ora-accent mb-3">
                  <c.icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-base font-normal text-ora-text mb-1">{c.t}</h3>
                <p className="text-sm text-ora-text-muted leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three profiles */}
      <section className="bg-ora-accent text-ora-bg">
        <div className="container-ora py-14 sm:py-20">
          <h2 className="font-display text-3xl sm:text-4xl font-light mb-3 max-w-2xl leading-tight tracking-tight">
            Pensé pour vous, qui que vous soyez.
          </h2>
          <p className="text-ora-bg/80 max-w-2xl mb-10 leading-relaxed">
            Nos univers s'adressent à tout les profils de femmes, sans hiérarchie ni exclusion. Vous vous reconnaissez
            dans l'un ? Dans plusieurs ? Vous êtes à votre place.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                t: 'Le style, simplement',
                d: "Vous aimez changer de tête, suivre une envie, vous sentir fraîche. Nos perruques vous accompagnent dans chaque variation de vous.",
                img: '/public/perruques/perruque-kiara-rose.jpg',
              },
              {
                t: "L'accompagnement",
                d: "Vos paiements sont 100% sécurisés, vos commandes sont gérés et suivis proprement et la livraison est soignée.",
                img: 'https://images.pexels.com/photos/3992652/pexels-photo-3992652.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
              },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl overflow-hidden bg-white/10">
                <ProductImage src={c.img} alt={c.t} className="aspect-[3/2]" />
                <div className="p-5">
                  <h3 className="font-display text-lg font-normal mb-2">{c.t}</h3>
                  <p className="text-sm text-ora-bg/80 leading-relaxed font-light">{c.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-ora py-14 sm:py-20 text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-light text-ora-text mb-3 tracking-tight">
          Venez comme vous êtes.
        </h2>
        <p className="text-ora-text-muted max-w-xl mx-auto mb-7 leading-relaxed">
          Explorez nos perruques, et trouvez la pièce qui vous fait du bien. On vous attend.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => navigate('/perruques')} className="btn-primary">
            Voir les perruques <ArrowRight className="h-4 w-4" />
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
