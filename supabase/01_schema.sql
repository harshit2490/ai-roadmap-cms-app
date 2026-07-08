-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- 1. Profiles table linked to auth.users
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  "firstName" text,
  "lastName" text,
  "fullName" text,
  role text not null default 'user' check (role in ('user', 'staff', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- 2. Phases table
create table public.phases (
  id bigint primary key,
  label text not null,
  title text not null,
  weeks text not null,
  color text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.phases enable row level security;

-- 3. Weeks table
create table public.weeks (
  id bigint primary key,
  course_id bigint not null default 1,
  phase_no bigint references public.phases(id) on delete cascade not null,
  week_no bigint not null unique,
  title text not null,
  slug text not null unique,
  order_no bigint not null,
  focus text not null,
  revision_checkpoint text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.weeks enable row level security;

-- 4. Lessons table
create table public.lessons (
  id bigint primary key,
  week_id bigint references public.weeks(id) on delete cascade not null,
  lesson_no bigint not null,
  order_no bigint not null,
  slug text not null,
  title text not null,
  estimated_minutes bigint not null,
  difficulty text not null,
  exercise text not null,
  interview_question text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.lessons enable row level security;

-- 5. Explanation Sections table
create table public.explanation_sections (
  id bigint primary key generated always as identity,
  lesson_id bigint references public.lessons(id) on delete cascade not null,
  order_no bigint not null,
  heading text not null,
  body text not null,
  example text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.explanation_sections enable row level security;

-- 6. Weekend Projects table
create table public.weekend_projects (
  id bigint primary key,
  week_id bigint references public.weeks(id) on delete cascade not null,
  order_no bigint not null,
  slug text not null,
  title text not null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.weekend_projects enable row level security;

-- 7. Project Milestones table
create table public.project_milestones (
  id bigint primary key,
  weekend_project_id bigint references public.weekend_projects(id) on delete cascade not null,
  order_no bigint not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.project_milestones enable row level security;

-- 8. Mock Interviews table
create table public.mock_interviews (
  id bigint primary key,
  week_id bigint references public.weeks(id) on delete cascade not null,
  order_no bigint not null,
  format text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.mock_interviews enable row level security;

-- 9. Mock Interview Questions table
create table public.mock_interview_questions (
  id bigint primary key,
  mock_interview_id bigint references public.mock_interviews(id) on delete cascade not null,
  order_no bigint not null,
  question text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.mock_interview_questions enable row level security;

-- 10. User Progress table
create table public.user_progress (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id) on delete cascade not null,
  key text not null,
  value boolean not null default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, key)
);

alter table public.user_progress enable row level security;

-- 11. User Bookmarks table
create table public.user_bookmarks (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id) on delete cascade not null,
  question_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, question_id)
);

alter table public.user_bookmarks enable row level security;


------------------
-- RLS POLICIES --
------------------

-- Profiles Policies
create policy "Allow users to read their own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Allow users to update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Helper function to check if the current user is an admin, avoiding infinite recursion in RLS
create or replace function public.is_admin()
returns boolean
language sql security definer
as $$
  select exists(
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create policy "Allow admins to read all profiles"
  on public.profiles for select using ( public.is_admin() );

create policy "Allow admins to update all profiles"
  on public.profiles for update using ( public.is_admin() );

-- Content Tables select policies (Everyone can read content, but freemium gating will be implemented on the front end)
create policy "Allow public read access to phases" on public.phases for select using (true);
create policy "Allow public read access to weeks" on public.weeks for select using (true);
create policy "Allow public read access to lessons" on public.lessons for select using (true);
create policy "Allow public read access to explanation_sections" on public.explanation_sections for select using (true);
create policy "Allow public read access to weekend_projects" on public.weekend_projects for select using (true);
create policy "Allow public read access to project_milestones" on public.project_milestones for select using (true);
create policy "Allow public read access to mock_interviews" on public.mock_interviews for select using (true);
create policy "Allow public read access to mock_interview_questions" on public.mock_interview_questions for select using (true);

-- Admin CRUD write policies for all content tables
create policy "Allow admin write to phases" on public.phases for all using ( public.is_admin() );
create policy "Allow admin write to weeks" on public.weeks for all using ( public.is_admin() );
create policy "Allow admin write to lessons" on public.lessons for all using ( public.is_admin() );
create policy "Allow admin write to explanation_sections" on public.explanation_sections for all using ( public.is_admin() );
create policy "Allow admin write to weekend_projects" on public.weekend_projects for all using ( public.is_admin() );
create policy "Allow admin write to project_milestones" on public.project_milestones for all using ( public.is_admin() );
create policy "Allow admin write to mock_interviews" on public.mock_interviews for all using ( public.is_admin() );
create policy "Allow admin write to mock_interview_questions" on public.mock_interview_questions for all using ( public.is_admin() );

-- User Progress Policies
create policy "Allow users to read their own progress"
  on public.user_progress for select using (auth.uid() = user_id);

create policy "Allow users to insert/update their own progress"
  on public.user_progress for all using (auth.uid() = user_id);

-- User Bookmarks Policies
create policy "Allow users to read their own bookmarks"
  on public.user_bookmarks for select using (auth.uid() = user_id);

create policy "Allow users to insert/delete their own bookmarks"
  on public.user_bookmarks for all using (auth.uid() = user_id);


------------------------------
-- TRIGGERS FOR PROFILE CREATION
------------------------------

-- Trigger function to automatically create a profile for new auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, "firstName", "lastName", "fullName", role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'firstName',
    new.raw_user_meta_data->>'lastName',
    new.raw_user_meta_data->>'fullName',
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
