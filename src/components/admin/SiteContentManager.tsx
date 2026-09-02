import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import {
  saveSiteSection,
  useSiteSettings,
  type AboutSettings,
  type CatalogSettings,
  type FooterSettings,
  type HeaderSettings,
  type HomeSettings,
} from '@/lib/siteSettings';
import { AdminField, AdminImageField, AdminSection } from './AdminFields';

export default function SiteContentManager() {
  const { settings, reload } = useSiteSettings();
  const [header, setHeader] = useState<HeaderSettings>(settings.header);
  const [home, setHome] = useState<HomeSettings>(settings.home);
  const [catalog, setCatalog] = useState<CatalogSettings>(settings.catalog);
  const [about, setAbout] = useState<AboutSettings>(settings.about);
  const [footer, setFooter] = useState<FooterSettings>(settings.footer);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setHeader(settings.header);
    setHome(settings.home);
    setCatalog(settings.catalog);
    setAbout(settings.about);
    setFooter(settings.footer);
  }, [settings]);

  const saveAll = async () => {
    setSaving(true);
    setMessage(null);
    const results = [
      await saveSiteSection('header', header),
      await saveSiteSection('home', home),
      await saveSiteSection('catalog', catalog),
      await saveSiteSection('about', about),
      await saveSiteSection('footer', footer),
    ];
    setSaving(false);
    const error = results.find((result) => result.error)?.error;
    if (error) {
      setMessage(`Impossible d'enregistrer : ${error}`);
      return;
    }
    await reload();
    setMessage('Toutes les sections ont été mises à jour.');
  };

  const updateAboutValue = (index: number, field: 'title' | 'description', value: string) => {
    setAbout((current) => ({
      ...current,
      values: current.values.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }));
  };

  const updateProfile = (index: number, field: 'title' | 'description' | 'image', value: string) => {
    setAbout((current) => ({
      ...current,
      profiles: current.profiles.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-nge-black">Contenu du site</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-nge-muted">
            Modifie les textes et les images des principales sections visibles par les clientes.
          </p>
        </div>
        <button type="button" onClick={saveAll} disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-nge-black px-5 text-xs font-medium uppercase tracking-wide text-white disabled:opacity-60">
          <Save className="h-4 w-4" /> {saving ? 'Enregistrement…' : 'Enregistrer toutes les sections'}
        </button>
      </div>

      {message && <p role="status" className="rounded-sm bg-nge-bg-alt p-3 text-sm text-nge-black">{message}</p>}

      <AdminSection title="Bandeau supérieur">
        <AdminField label="Messages du bandeau" value={header.tickerItems.join('\n')} onChange={(value) => setHeader({ tickerItems: value.split('\n').map((item) => item.trim()).filter(Boolean) })} multiline help="Un message par ligne." />
      </AdminSection>

      <AdminSection title="Accueil — Bannière principale">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Titre" value={home.heroTitle} onChange={(value) => setHome((current) => ({ ...current, heroTitle: value }))} />
          <AdminField label="Titre en couleur" value={home.heroAccent} onChange={(value) => setHome((current) => ({ ...current, heroAccent: value }))} />
        </div>
        <AdminField label="Sous-titre" value={home.heroSubtitle} onChange={(value) => setHome((current) => ({ ...current, heroSubtitle: value }))} />
        <div className="grid gap-5 lg:grid-cols-2">
          <AdminImageField label="Image grand écran" value={home.heroDesktopImage} onChange={(value) => setHome((current) => ({ ...current, heroDesktopImage: value }))} />
          <AdminImageField label="Image mobile" value={home.heroMobileImage} onChange={(value) => setHome((current) => ({ ...current, heroMobileImage: value }))} />
        </div>
      </AdminSection>

      <AdminSection title="Accueil — Produits phares">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Petit titre" value={home.featuredEyebrow} onChange={(value) => setHome((current) => ({ ...current, featuredEyebrow: value }))} />
          <AdminField label="Titre de section" value={home.featuredTitle} onChange={(value) => setHome((current) => ({ ...current, featuredTitle: value }))} />
        </div>
      </AdminSection>

      <AdminSection title="Accueil — Histoire de la marque">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Petit titre" value={home.storyEyebrow} onChange={(value) => setHome((current) => ({ ...current, storyEyebrow: value }))} />
          <AdminField label="Texte du bouton" value={home.storyButton} onChange={(value) => setHome((current) => ({ ...current, storyButton: value }))} />
        </div>
        <AdminField label="Titre" value={home.storyTitle} onChange={(value) => setHome((current) => ({ ...current, storyTitle: value }))} />
        <AdminField label="Texte" value={home.storyBody} onChange={(value) => setHome((current) => ({ ...current, storyBody: value }))} multiline />
        <AdminImageField label="Image" value={home.storyImage} onChange={(value) => setHome((current) => ({ ...current, storyImage: value }))} />
      </AdminSection>

      <AdminSection title="Page catalogue">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Petit titre" value={catalog.eyebrow} onChange={(value) => setCatalog((current) => ({ ...current, eyebrow: value }))} />
          <AdminField label="Titre" value={catalog.title} onChange={(value) => setCatalog((current) => ({ ...current, title: value }))} />
        </div>
        <AdminField label="Introduction" value={catalog.subtitle} onChange={(value) => setCatalog((current) => ({ ...current, subtitle: value }))} multiline />
      </AdminSection>

      <AdminSection title="À propos — Introduction">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Petit titre" value={about.heroEyebrow} onChange={(value) => setAbout((current) => ({ ...current, heroEyebrow: value }))} />
          <AdminField label="Titre" value={about.heroTitle} onChange={(value) => setAbout((current) => ({ ...current, heroTitle: value }))} />
        </div>
        <AdminField label="Introduction" value={about.heroIntro} onChange={(value) => setAbout((current) => ({ ...current, heroIntro: value }))} multiline />
        <AdminImageField label="Image principale" value={about.heroImage} onChange={(value) => setAbout((current) => ({ ...current, heroImage: value }))} />
      </AdminSection>

      <AdminSection title="À propos — Histoire et valeurs">
        <AdminField label="Titre de l'histoire" value={about.storyTitle} onChange={(value) => setAbout((current) => ({ ...current, storyTitle: value }))} />
        <AdminField label="Paragraphes" value={about.storyParagraphs.join('\n\n')} onChange={(value) => setAbout((current) => ({ ...current, storyParagraphs: value.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean) }))} multiline help="Sépare les paragraphes par une ligne vide." />
        <div className="grid gap-4 lg:grid-cols-3">
          {about.values.map((item, index) => (
            <div key={index} className="space-y-3 rounded-sm bg-nge-bg p-4">
              <AdminField label={`Valeur ${index + 1}`} value={item.title} onChange={(value) => updateAboutValue(index, 'title', value)} />
              <AdminField label="Description" value={item.description} onChange={(value) => updateAboutValue(index, 'description', value)} multiline />
            </div>
          ))}
        </div>
      </AdminSection>

      <AdminSection title="À propos — Profils clientes">
        <AdminField label="Titre" value={about.profilesTitle} onChange={(value) => setAbout((current) => ({ ...current, profilesTitle: value }))} />
        <AdminField label="Introduction" value={about.profilesIntro} onChange={(value) => setAbout((current) => ({ ...current, profilesIntro: value }))} multiline />
        <div className="grid gap-5 lg:grid-cols-2">
          {about.profiles.map((profile, index) => (
            <div key={index} className="space-y-4 rounded-sm bg-nge-bg p-4">
              <AdminField label={`Profil ${index + 1}`} value={profile.title} onChange={(value) => updateProfile(index, 'title', value)} />
              <AdminField label="Description" value={profile.description} onChange={(value) => updateProfile(index, 'description', value)} multiline />
              <AdminImageField label="Image" value={profile.image} onChange={(value) => updateProfile(index, 'image', value)} />
            </div>
          ))}
        </div>
      </AdminSection>

      <AdminSection title="À propos — Appel à l'action">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Titre" value={about.ctaTitle} onChange={(value) => setAbout((current) => ({ ...current, ctaTitle: value }))} />
          <AdminField label="Texte du bouton" value={about.ctaButton} onChange={(value) => setAbout((current) => ({ ...current, ctaButton: value }))} />
        </div>
        <AdminField label="Texte" value={about.ctaBody} onChange={(value) => setAbout((current) => ({ ...current, ctaBody: value }))} multiline />
      </AdminSection>

      <AdminSection title="Pied de page">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Promesse" value={footer.promiseTitle} onChange={(value) => setFooter((current) => ({ ...current, promiseTitle: value }))} />
          <AdminField label="Description" value={footer.description} onChange={(value) => setFooter((current) => ({ ...current, description: value }))} multiline />
          <AdminField label="Copyright" value={footer.copyright} onChange={(value) => setFooter((current) => ({ ...current, copyright: value }))} />
          <AdminField label="Signature" value={footer.signature} onChange={(value) => setFooter((current) => ({ ...current, signature: value }))} />
        </div>
      </AdminSection>
    </div>
  );
}

