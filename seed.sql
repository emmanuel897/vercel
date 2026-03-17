-- ============================================================
-- SEED — Données initiales
-- À exécuter dans le SQL Editor de votre projet Supabase
-- ============================================================

-- ============================================================
-- 1. AMIS FICTIFS (sans compte auth — juste pour les données)
-- ============================================================

insert into public.friends (id, display_name, bio, is_active, is_admin, invited_at, joined_at)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Sophie',
    'Passionnée de sciences et de vulgarisation. J''écoute des podcasts dans le métro chaque matin.',
    true, false, now() - interval '30 days', now() - interval '28 days'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Thomas',
    'Fan d''histoire et de politique. Toujours à l''affût d''un bon épisode de Thinkerview.',
    true, false, now() - interval '20 days', now() - interval '18 days'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Léa',
    'Podcasteuse amateur, grande fan d''humour et de culture pop.',
    true, false, now() - interval '10 days', now() - interval '8 days'
  );

-- ============================================================
-- 2. PODCASTS FICTIFS
-- ============================================================

insert into public.podcasts (friend_id, url, title, description, category, duration, created_at)
values
  -- Podcasts de Sophie
  (
    '11111111-1111-1111-1111-111111111111',
    'https://www.radiofrance.fr/franceculture/podcasts/la-methode-scientifique',
    'La Méthode Scientifique — Les trous noirs',
    'Un épisode fascinant sur les trous noirs et ce qu''on sait (ou ne sait pas) d''eux. La présentation est accessible même sans bagage scientifique.',
    'Science', 'moyenne', now() - interval '25 days'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'https://podcast.ausha.co/underscore/ia-generative-le-grand-tournant',
    'Underscore_ — IA générative : le grand tournant',
    'Les meilleurs développeurs francophones débattent de l''impact de l''IA sur nos métiers. Très honnête, pas de hype inutile.',
    'Science', 'longue', now() - interval '15 days'
  ),
  -- Podcasts de Thomas
  (
    '22222222-2222-2222-2222-222222222222',
    'https://www.thinkerview.com/macron-et-la-france-dans-10-ans/',
    'Thinkerview — La France dans 10 ans',
    'Comme toujours avec Thinkerview, une interview sans langue de bois. Peu importe vos opinions politiques, ça vaut le détour.',
    'Société', 'longue', now() - interval '22 days'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'https://www.radiofrance.fr/franceinter/podcasts/affaires-sensibles',
    'Affaires Sensibles — L''affaire du sang contaminé',
    'Fabian Deligne retrace l''un des plus grands scandales sanitaires français. Impeccablement documenté, impossible à lâcher.',
    'Histoire', 'courte', now() - interval '12 days'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'https://www.radiofrance.fr/franceculture/podcasts/serie-1940-la-france-de-la-honte',
    '1940 — La France de la honte',
    'Série documentaire en 5 épisodes sur la débâcle de 1940. Passionnant et bien rythmé.',
    'Histoire', 'courte', now() - interval '5 days'
  ),
  -- Podcasts de Léa
  (
    '33333333-3333-3333-3333-333333333333',
    'https://www.binge.audio/podcast/les-couilles-sur-la-table',
    'Les couilles sur la table — Masculinités en crise',
    'Un épisode qui questionne la masculinité avec intelligence et sans caricature. À écouter en couple ou entre amis pour déclencher un vrai débat.',
    'Société', 'moyenne', now() - interval '7 days'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'https://www.arteradio.com/son/61659591/un_podcast_a_soi_ndeg59_les_transidentites',
    'Kiffe ta race — Racisme ordinaire au bureau',
    'Binge Audio à son meilleur. Grace Ly et Rokhaya Diallo parlent d''expériences concrètes, avec humour et lucidité.',
    'Culture', 'courte', now() - interval '3 days'
  );

-- ============================================================
-- 3. RÉACTIONS FICTIVES (croisées entre amis)
-- ============================================================

-- Sophie réagit aux podcasts de Thomas
insert into public.reactions (friend_id, podcast_id, type)
select '11111111-1111-1111-1111-111111111111', p.id, 'interesse'
from public.podcasts p
where p.friend_id = '22222222-2222-2222-2222-222222222222'
limit 2;

-- Thomas réagit aux podcasts de Sophie
insert into public.reactions (friend_id, podcast_id, type)
select '22222222-2222-2222-2222-222222222222', p.id, 'ecoute'
from public.podcasts p
where p.friend_id = '11111111-1111-1111-1111-111111111111'
limit 1;

insert into public.reactions (friend_id, podcast_id, type)
select '22222222-2222-2222-2222-222222222222', p.id, 'conseille'
from public.podcasts p
where p.friend_id = '11111111-1111-1111-1111-111111111111'
offset 1 limit 1;

-- Léa réagit à tout le monde
insert into public.reactions (friend_id, podcast_id, type)
select '33333333-3333-3333-3333-333333333333', p.id, 'interesse'
from public.podcasts p
where p.friend_id = '11111111-1111-1111-1111-111111111111'
limit 1;

insert into public.reactions (friend_id, podcast_id, type)
select '33333333-3333-3333-3333-333333333333', p.id, 'conseille'
from public.podcasts p
where p.friend_id = '22222222-2222-2222-2222-222222222222'
limit 1;

-- ============================================================
-- 4. VOTRE COMPTE ADMIN — Manu
-- ============================================================

-- Crée le profil admin
insert into public.friends (id, display_name, bio, is_active, is_admin, invited_at)
values (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Manu',
  'Administrateur de la communauté.',
  true, true, now()
);

-- Crée un token d'invitation valable 7 jours (au lieu de 48h)
insert into public.invitations (token, email, friend_id, used, expires_at)
values (
  'manu-admin-invite-2024',
  'emmanuel.ferret@gmail.com',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  false,
  now() + interval '7 days'
);

-- ============================================================
-- RÉSULTAT
-- Votre lien d'invitation pour vous inscrire :
-- https://[votre-domaine]/invitation/manu-admin-invite-2024
-- ============================================================
