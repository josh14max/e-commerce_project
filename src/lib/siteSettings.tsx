import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from './supabase';

export interface HeaderSettings {
  tickerItems: string[];
}

export interface HomeSettings {
  heroTitle: string;
  heroAccent: string;
  heroSubtitle: string;
  heroDesktopImage: string;
  heroMobileImage: string;
  featuredEyebrow: string;
  featuredTitle: string;
  storyEyebrow: string;
  storyTitle: string;
  storyBody: string;
  storyImage: string;
  storyButton: string;
}

export interface CatalogSettings {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export interface AboutValue {
  title: string;
  description: string;
}

export interface AboutProfile {
  title: string;
  description: string;
  image: string;
}

export interface AboutSettings {
  heroEyebrow: string;
  heroTitle: string;
  heroIntro: string;
  heroImage: string;
  storyTitle: string;
  storyParagraphs: string[];
  values: AboutValue[];
  profilesTitle: string;
  profilesIntro: string;
  profiles: AboutProfile[];
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
}

export interface FooterSettings {
  promiseTitle: string;
  description: string;
  copyright: string;
  signature: string;
}

export type PaymentMethod = 'wave_ci' | 'orange_ci';

export interface CheckoutSettings {
  eyebrow: string;
  title: string;
  customerTitle: string;
  depositLabel: string;
  depositAmount: number;
  depositDescription: string;
  methodsTitle: string;
  paymentButton: string;
  securityText: string;
  paymentMethods: PaymentMethod[];
}

export interface SiteSettings {
  header: HeaderSettings;
  home: HomeSettings;
  catalog: CatalogSettings;
  about: AboutSettings;
  footer: FooterSettings;
  checkout: CheckoutSettings;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  header: {
    tickerItems: ['Livraison soignée', 'Perruques', 'Beauté qui vous ressemble'],
  },
  home: {
    heroTitle: 'La beauté qui',
    heroAccent: 'vous ressemble.',
    heroSubtitle: 'Des perruques pensées pour toutes les femmes.',
    heroDesktopImage: '/image-pres.webp',
    heroMobileImage: '/image-pres1.webp',
    featuredEyebrow: 'Sélection NG Hair',
    featuredTitle: 'Nos pièces phares',
    storyEyebrow: 'NG Hair',
    storyTitle: 'Une histoire de femmes, écrite pour toutes.',
    storyBody: "NG Hair est né d'une conviction simple : aucune femme ne devrait choisir entre esthétique, héritage et confort. Nous réunissons tout type de perruques dans une même maison, pensées pour vous offrir une lumière qui vous appartient, quelle que soit votre histoire.",
    storyImage: 'https://images.pexels.com/photos/3992652/pexels-photo-3992652.jpeg?auto=compress&cs=tinysrgb&w=900&h=700&fit=crop',
    storyButton: 'Notre histoire',
  },
  catalog: {
    eyebrow: 'Perruques',
    title: 'Perruques pour toutes',
    subtitle: 'Lisse, afro, ondulé, tresses — chaque texture a sa place ici. Filtrez pour trouver celle qui vous ressemble.',
  },
  about: {
    heroEyebrow: 'La maison NG',
    heroTitle: 'Une lumière pour chaque femme.',
    heroIntro: "NG Hair, c'est avant tout une maison qui croit que la beauté n'est pas un standard, mais une lueur qui vous appartient — quelle que soit votre histoire, vos cheveux, votre pays.",
    heroImage: 'https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=1600&h=700&fit=crop',
    storyTitle: 'Notre histoire',
    storyParagraphs: [
      "NG Hair est né d'une conversation entre femmes. L'une cherchait une perruque élégante pour le travail. L'autre, fière de ses cheveux afro, voulait des pièces protectrices respectueuses. La troisième traversait un traitement et avait besoin de douceur avant tout.",
      "Trois femmes, trois histoires, une même envie : se sentir belles sans avoir à se justifier. Nous avons décidé qu'aucune ne devrait choisir entre esthétique, héritage et bien-être. Qu'aucune ne soit laissée de côté.",
      "Aujourd'hui, NG Hair réunit tout type de perruques dans une même maison, pensées pour toutes les femmes — et livrées jusqu'à vous.",
    ],
    values: [
      { title: 'Inclusif par essence', description: 'Aucune femme à part. Chaque profil a sa place, chaque histoire est légitime.' },
      { title: 'Beauté & confort', description: 'Des matières douces et des coiffages pensés pour le port prolongé, sans compromis.' },
      { title: 'Choix raisonné', description: 'Des partenaires en qui nous croyons.' },
    ],
    profilesTitle: 'Pensé pour vous, qui que vous soyez.',
    profilesIntro: "Nos univers s'adressent à tous les profils de femmes, sans hiérarchie ni exclusion. Vous êtes à votre place.",
    profiles: [
      { title: 'Le style, simplement', description: 'Vous aimez changer de tête, suivre une envie, vous sentir fraîche. Nos perruques vous accompagnent dans chaque variation de vous.', image: '/perruques/perruque-kiara-rose.jpg' },
      { title: "L'accompagnement", description: 'Vos paiements sont sécurisés, vos commandes sont suivies proprement et la livraison est soignée.', image: 'https://images.pexels.com/photos/3992652/pexels-photo-3992652.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop' },
    ],
    ctaTitle: 'Venez comme vous êtes.',
    ctaBody: 'Explorez nos perruques et trouvez la pièce qui vous fait du bien. On vous attend.',
    ctaButton: 'Voir les perruques',
  },
  footer: {
    promiseTitle: 'Pensé pour chaque femme',
    description: 'Perruques pensées pour toutes les femmes, la beauté qui vous ressemble. Livrée chez vous.',
    copyright: 'NG Hair. Tous droits réservés.',
    signature: 'Conçu avec soin, pour toutes les femmes.',
  },
  checkout: {
    eyebrow: 'Finalisation',
    title: 'Finaliser ma commande',
    customerTitle: 'Vos coordonnées',
    depositLabel: 'Dépôt de validation',
    depositAmount: 2000,
    depositDescription: 'Ce dépôt confirme votre commande. Le solde est réglé à la livraison.',
    methodsTitle: 'Modes de paiement',
    paymentButton: 'Payer avec Wave ou Orange Money',
    securityText: 'Paiement sécurisé. Vous serez redirigé pour régler le dépôt.',
    paymentMethods: ['wave_ci', 'orange_ci'],
  },
};

type SettingsKey = keyof SiteSettings;

interface SiteSettingsContextValue {
  settings: SiteSettings;
  loading: boolean;
  reload: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  settings: DEFAULT_SITE_SETTINGS,
  loading: true,
  reload: async () => undefined,
});

function mergeSettings(rows: { key: string; value: unknown }[]): SiteSettings {
  const merged = { ...DEFAULT_SITE_SETTINGS };
  for (const row of rows) {
    if (!(row.key in DEFAULT_SITE_SETTINGS) || !row.value || typeof row.value !== 'object') continue;
    const key = row.key as SettingsKey;
    merged[key] = {
      ...DEFAULT_SITE_SETTINGS[key],
      ...(row.value as SiteSettings[SettingsKey]),
    } as SiteSettings[SettingsKey] & HeaderSettings & HomeSettings & CatalogSettings & AboutSettings & FooterSettings & CheckoutSettings;
  }
  return merged;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase.from('site_settings').select('key, value');
  if (error) {
    console.error('getSiteSettings error:', error.message);
    return DEFAULT_SITE_SETTINGS;
  }
  return mergeSettings((data ?? []) as { key: string; value: unknown }[]);
}

export async function saveSiteSection<K extends SettingsKey>(
  key: K,
  value: SiteSettings[K],
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  return { error: error?.message ?? null };
}

export async function uploadSiteImage(file: File): Promise<{ url: string | null; error: string | null }> {
  const extension = file.name.split('.').pop() || 'jpg';
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from('site-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) return { url: null, error: error.message };
  const { data } = supabase.storage.from('site-images').getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setSettings(await getSiteSettings());
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, reload }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

