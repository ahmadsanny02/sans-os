-- Jalankan sekali di Supabase SQL Editor. Aman diulang.
-- Aplikasi tetap berjalan karena koneksi server memakai role postgres (rolbypassrls = true)
-- dan tidak ada akses tabel langsung dari browser.
begin;

-- 1. Tutup akses publik: RLS tanpa policy menolak anon dan authenticated.
do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
    execute format('revoke all on public.%I from anon, authenticated', t.tablename);
  end loop;
end $$;
alter default privileges in schema public revoke all on tables from anon, authenticated;

-- 2. Index yang ada di skema tetapi belum ada di database.
create index if not exists idx_reading_journal_user on reading_journal (user_id);
create index if not exists idx_reading_progress_book on reading_progress_logs (book_id);
create index if not exists idx_reading_progress_user on reading_progress_logs (user_id);
create index if not exists idx_vision_board_user on vision_board_items (user_id);
create index if not exists idx_vocab_user on vocabulary_logs (user_id);
create index if not exists idx_formulas_user on formulas (user_id);
create index if not exists idx_writing_logs_user on writing_logs (user_id);
create index if not exists idx_writing_logs_vocab on writing_logs (vocab_id);
create index if not exists idx_dialogue_logs_user on dialogue_logs (user_id);
create index if not exists idx_dialogue_logs_vocab on dialogue_logs (vocab_id);
create index if not exists idx_project_tasks_project on project_tasks (project_id);
create index if not exists idx_project_tasks_user on project_tasks (user_id);
create index if not exists idx_project_sub_tasks_task on project_sub_tasks (task_id);
create index if not exists idx_project_sub_tasks_user on project_sub_tasks (user_id);
create index if not exists idx_bucket_list_user on bucket_list (user_id);
create index if not exists idx_learning_materials_subject on learning_materials (subject_id);
create index if not exists idx_learning_tasks_subject on learning_tasks (subject_id);
create index if not exists idx_sub_categories_user on sub_categories (user_id);
create index if not exists idx_habit_logs_habit on habit_logs (habit_id);

-- 3. Cegah duplikat. Pemeriksaan 2 November 2026: tidak ada duplikat.
create unique index if not exists idx_vocab_user_word on vocabulary_logs (user_id, lower(trim(word)));
create unique index if not exists idx_categories_user_name on categories (user_id, lower(name));

-- 4. Tautkan priority lama ke block-nya, karena penghapusan kini hanya mengikuti tautan ini.
--    Hanya pasangan yang tidak ambigu (tepat satu block cocok).
update priorities p
set timetable_block_id = b.id
from timetable_blocks b
where p.timetable_block_id is null
  and b.user_id = p.user_id and b.date = p.date and b.title = p.text
  and (select count(*) from timetable_blocks x
       where x.user_id = p.user_id and x.date = p.date and x.title = p.text) = 1;

commit;
