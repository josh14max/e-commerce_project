/*
# Seed du catalogue produits (11 perruques)

Insère les 11 produits actuellement définis dans src/lib/products.ts.
Après cette migration, le fichier de code n'est plus la source de vérité —
le frontend lit désormais directement cette table (voir commit suivant).

Utilise ON CONFLICT pour rester rejouable sans erreur si exécutée deux fois.
*/

INSERT INTO products (
  id, slug, name, category, universe, price, compare_at_price,
  short_description, description, images, texture, length, color,
  colors, lengths, textures, badge, profiles, featured
) VALUES
(
  'w-jade', 'perruque-jade-emeraude', 'Perruque Jade — Ondulée Émeraude', 'wigs', 'perruques', 58000, 68000,
  'Vert émeraude profond, racines dégradées, ondulations glamour.', 'Jade ose la couleur avec élégance : un vert émeraude intense qui s''éclaircit en dégradé depuis des racines naturelles. Ses ondulations souples et son lace front finement plumé offrent un résultat spectaculaire, pour celles qui veulent se démarquer sans compromis sur le naturel de l''implantation.', '["/perruques/perruque-jade-emeraude.jpg"]'::jsonb, 'Ondulé', 'Longue', 'Émeraude',
  '["Émeraude", "Noir", "Bordeaux"]'::jsonb, '["12", "16", "20", "22", "28", "30", "32"]'::jsonb, '["Ondulé"]'::jsonb, 'Nouveau', '["mode"]'::jsonb, true
),
(
  'w-scarlett', 'perruque-scarlett-bordeaux', 'Perruque Scarlett — Lisse Bordeaux', 'wigs', 'perruques', 52000, NULL,
  'Rouge bordeaux profond, chute lisse et brillante.', 'Scarlett affirme un rouge bordeaux riche et lumineux, porté par une chute parfaitement lisse. Coiffée en demi-attache ou lâchée, elle capte la lumière à chaque mouvement. Une couleur affirmée pour celles qui n''ont pas peur d''attirer les regards.', '["/perruques/perruque-scarlett-bordeaux.jpg"]'::jsonb, 'Lisse', 'Longue', 'Bordeaux',
  '["Bordeaux", "Noir", "Auburn", "Châtain"]'::jsonb, '["12", "16", "20", "22", "28", "30", "32"]'::jsonb, '["Lisse"]'::jsonb, 'Nouveau', '["mode"]'::jsonb, false
),
(
  'w-imani', 'perruque-imani-carre-lisse', 'Perruque Imani — Carré Lisse', 'wigs', 'perruques', 42000, NULL,
  'Carré noir intense, coupe nette, brillance miroir.', 'Imani revisite le carré classique avec une coupe nette et une brillance miroir. Sa densité généreuse et sa raie modulable en font une base polyvalente, parfaite au quotidien comme pour un look plus sophistiqué en un geste.', '["/perruques/perruque-imani-carre-noir.jpg"]'::jsonb, 'Lisse', 'Courte', 'Noir',
  '["Noir", "Châtain", "Brun foncé"]'::jsonb, '["12", "16", "20", "22", "28", "30", "32"]'::jsonb, '["Lisse"]'::jsonb, NULL, '["mode", "perte"]'::jsonb, false
),
(
  'w-zaria', 'perruque-zaria-ondulee-longue', 'Perruque Zaria — Ondulée Longue', 'wigs', 'perruques', 46000, NULL,
  'Noir profond à reflets chauds, ondulations souples et longues.', 'Zaria déroule de longues ondulations souples, dans un noir profond réchauffé de reflets subtils. Une chevelure généreuse et vivante, pensée pour un port confortable même en longueur, avec un tombé naturel du début à la pointe.', '["/perruques/perruque-zaria-ondulee-noir.jpg"]'::jsonb, 'Ondulé', 'Longue', 'Noir',
  '["Noir", "Brun foncé", "Châtain"]'::jsonb, '["12", "16", "20", "22", "28", "30", "32"]'::jsonb, '["Ondulé"]'::jsonb, NULL, '["afro", "mode"]'::jsonb, false
),
(
  'w-yasmine', 'perruque-yasmine-lisse-longue', 'Perruque Yasmine — Lisse Longue', 'wigs', 'perruques', 46000, 54000,
  'Noir intense, chute lisse XXL, brillance soyeuse.', 'Yasmine, c''est la longueur assumée : une chevelure lisse et soyeuse qui descend jusqu''au bas du dos, dans un noir profond et uniforme. Sa texture fine et sa légèreté en font une perruque qui se porte toute la journée sans jamais peser.', '["/perruques/perruque-yasmine-lisse-noir.jpg"]'::jsonb, 'Lisse', 'Longue', 'Noir',
  '["Noir", "Châtain", "Auburn"]'::jsonb, '["12", "16", "20", "22", "28", "30", "32"]'::jsonb, '["Lisse"]'::jsonb, 'Best-seller', '["mode", "perte"]'::jsonb, true
),
(
  'w-aria', 'perruque-aria-frange-grise', 'Perruque Aria — Frange Grise', 'wigs', 'perruques', 56000, NULL,
  'Gris cendré moderne, frange structurée, mèches lissées.', 'Aria mise sur un gris cendré sophistiqué et une frange structurée qui encadre le visage. Coupe dégradée sur les longueurs pour un mouvement naturel — une teinte tendance qui change tout sans jamais paraître artificielle.', '["/perruques/perruque-aria-frange-grise.jpg"]'::jsonb, 'Lisse', 'Mi-longue', 'Gris argenté',
  '["Gris argenté", "Blond platine", "Noir"]'::jsonb, '["12", "16", "20", "22", "28", "30", "32"]'::jsonb, '["Lisse"]'::jsonb, 'Nouveau', '["mode"]'::jsonb, false
),
(
  'w-kessy', 'perruque-kessy-balayage-miel', 'Perruque Kessy — Ondulée Balayage', 'wigs', 'perruques', 54000, NULL,
  'Balayage miel vers châtain, ondulations souples et lumineuses.', 'Kessy joue le dégradé le plus demandé du moment : des racines miel lumineuses qui filent vers un châtain profond en pointes. Ses ondulations amples donnent du mouvement à chaque mèche, pour un effet salon sans détour.', '["/perruques/perruque-kessy-balayage.jpg"]'::jsonb, 'Ondulé', 'Longue', 'Miel',
  '["Miel", "Châtain", "Auburn"]'::jsonb, '["12", "16", "20", "22", "28", "30", "32"]'::jsonb, '["Ondulé"]'::jsonb, 'Tendance', '["mode"]'::jsonb, true
),
(
  'w-kiara', 'perruque-kiara-rose', 'Perruque Kiara — Carré Rose', 'wigs', 'perruques', 59000, NULL,
  'Rose pastel, carré ondulé, frange effilée sur le côté.', 'Kiara assume la couleur fantaisie avec un rose délicat et lumineux. Son carré ondulé et sa frange effilée créent un look à la fois doux et affirmé, idéal pour un événement ou pour changer totalement de style le temps d''une soirée.', '["/perruques/perruque-kiara-rose.jpg"]'::jsonb, 'Ondulé', 'Courte', 'Rose',
  '["Rose", "Blond platine", "Noir"]'::jsonb, '["12", "16", "20", "22", "28", "30", "32"]'::jsonb, '["Ondulé"]'::jsonb, 'Nouveau', '["mode"]'::jsonb, false
),
(
  'w-ivy', 'perruque-ivy-platine', 'Perruque Ivy — Lisse Platine', 'wigs', 'perruques', 50000, NULL,
  'Blond platine froid, chute lisse XXL, racine parfaite.', 'Ivy, c''est le blond platine dans toute sa pureté : une chevelure lisse et dense qui tombe jusqu''à la taille, avec une implantation qui suit la ligne naturelle du crâne. Une transformation totale, sans le moindre entretien de coloration.', '["/perruques/perruque-ivy-platine.jpg"]'::jsonb, 'Lisse', 'Longue', 'Blond platine',
  '["Blond platine", "Noir", "Châtain"]'::jsonb, '["12", "16", "20", "22", "28", "30", "32"]'::jsonb, '["Lisse"]'::jsonb, NULL, '["mode"]'::jsonb, false
),
(
  'w-luna', 'perruque-luna-argentee', 'Perruque Luna — Ondulée Argentée', 'wigs', 'perruques', 58000, 66000,
  'Gris argenté glamour, volume XXL, ondulations hollywoodiennes.', 'Luna déploie un volume spectaculaire en gris argenté lumineux, avec des ondulations amples façon glamour hollywoodien. Une perruque statement pour les occasions où on ne veut vraiment pas passer inaperçue.', '["/perruques/perruque-luna-argentee.jpg"]'::jsonb, 'Ondulé', 'Longue', 'Gris argenté',
  '["Gris argenté", "Blond platine", "Noir"]'::jsonb, '["12", "16", "20", "22", "28", "30", "32"]'::jsonb, '["Ondulé"]'::jsonb, 'Tendance', '["mode"]'::jsonb, true
),
(
  'w-camille', 'perruque-camille-chatain', 'Perruque Camille — Ondulée Châtain', 'wigs', 'perruques', 44000, NULL,
  'Châtain chaud acajou, ondulations souples, teinte naturelle.', 'Camille propose un châtain chaud aux reflets acajou, dans une teinte qui se fond parfaitement dans une carnation naturelle. Ses ondulations discrètes apportent du corps sans excès, pour un rendu élégant au quotidien.', '["/perruques/perruque-camille-chatain.jpg"]'::jsonb, 'Ondulé', 'Longue', 'Châtain',
  '["Châtain", "Auburn", "Brun foncé"]'::jsonb, '["12", "16", "20", "22", "28", "30", "32"]'::jsonb, '["Ondulé"]'::jsonb, NULL, '["mode", "afro"]'::jsonb, false
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  universe = EXCLUDED.universe,
  price = EXCLUDED.price,
  compare_at_price = EXCLUDED.compare_at_price,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  texture = EXCLUDED.texture,
  length = EXCLUDED.length,
  color = EXCLUDED.color,
  colors = EXCLUDED.colors,
  lengths = EXCLUDED.lengths,
  textures = EXCLUDED.textures,
  badge = EXCLUDED.badge,
  profiles = EXCLUDED.profiles,
  featured = EXCLUDED.featured;
