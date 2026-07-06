-- Аватарки користувачів: публічний bucket "avatars" у Supabase Storage.
-- Запусти ОДИН раз у Supabase → SQL Editor → New query → Run.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Кожен користувач може писати/оновлювати ТІЛЬКИ у свою папку (uid/...)
create policy "avatars insert own"
on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars update own"
on storage.objects for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars delete own"
on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Читати аватарки можуть усі (публічні картинки)
create policy "avatars public read"
on storage.objects for select to public
using (bucket_id = 'avatars');
