-- Careers: job postings, applications, and a private resume bucket.
-- Project: Copperhead (qvabjacptkqarpvzjexf)
-- Idempotent: safe to run more than once in the Supabase SQL editor or via the CLI.
--
-- Access model (matches the existing updates admin: any signed-in Supabase Auth user is staff):
--   anon          read published job postings only
--   anon          insert applications and upload resumes (insert only, no read/list)
--   authenticated read every posting, manage postings, read applications, download resumes
--
-- Resumes live in the private "resumes" bucket. Download them with short-lived signed URLs
-- from careers-admin.html. Do not make this bucket public.

create schema if not exists private;

revoke all on schema private from public;
-- USAGE lets the insert trigger run as anon/authenticated. The schema is not
-- exposed through the Data API, and the function returns trigger (not a value
-- PostgREST can call).
grant usage on schema private to postgres, service_role, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.job_postings (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    location text not null,
    employment_type text not null,
    pay_min numeric(12, 2),
    pay_max numeric(12, 2),
    pay_period text,
    description text not null,
    requirements text,
    status text not null default 'draft',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.job_applications (
    id uuid primary key default gen_random_uuid(),
    job_id uuid,
    job_title_snapshot text not null,
    applicant_name text not null,
    email text not null,
    phone text not null,
    message text,
    resume_path text not null,
    resume_filename text not null,
    company_website text,
    reviewed boolean not null default false,
    created_at timestamptz not null default now()
);

-- Columns added after the first version of this migration stay in sync.
alter table public.job_postings add column if not exists pay_min numeric(12, 2);
alter table public.job_postings add column if not exists pay_max numeric(12, 2);
alter table public.job_postings add column if not exists pay_period text;
alter table public.job_postings add column if not exists requirements text;
alter table public.job_postings add column if not exists status text not null default 'draft';
alter table public.job_postings add column if not exists created_at timestamptz not null default now();
alter table public.job_postings add column if not exists updated_at timestamptz not null default now();

alter table public.job_applications add column if not exists job_id uuid;
alter table public.job_applications add column if not exists job_title_snapshot text;
alter table public.job_applications add column if not exists applicant_name text;
alter table public.job_applications add column if not exists email text;
alter table public.job_applications add column if not exists phone text;
alter table public.job_applications add column if not exists message text;
alter table public.job_applications add column if not exists resume_path text;
alter table public.job_applications add column if not exists resume_filename text;
alter table public.job_applications add column if not exists company_website text;
alter table public.job_applications add column if not exists reviewed boolean not null default false;
alter table public.job_applications add column if not exists created_at timestamptz not null default now();

-- ---------------------------------------------------------------------------
-- Constraints (dropped and recreated so a re-run picks up definition changes)
-- ---------------------------------------------------------------------------

alter table public.job_postings drop constraint if exists job_postings_employment_type_check;
alter table public.job_postings drop constraint if exists job_postings_status_check;
alter table public.job_postings drop constraint if exists job_postings_pay_check;
alter table public.job_postings drop constraint if exists job_postings_title_check;
alter table public.job_postings drop constraint if exists job_postings_location_check;
alter table public.job_postings drop constraint if exists job_postings_description_check;
alter table public.job_postings drop constraint if exists job_postings_requirements_check;

alter table public.job_postings
    add constraint job_postings_employment_type_check
    check (employment_type in ('full-time', 'part-time', 'contract', 'temporary', 'internship'));

alter table public.job_postings
    add constraint job_postings_status_check
    check (status in ('draft', 'published', 'closed'));

alter table public.job_postings
    add constraint job_postings_pay_check
    check (
        (pay_min is null and pay_max is null and pay_period is null)
        or (
            pay_period in ('hour', 'year')
            and (pay_min is not null or pay_max is not null)
            and (pay_min is null or pay_min >= 0)
            and (pay_max is null or pay_max >= 0)
            and (pay_min is null or pay_max is null or pay_min <= pay_max)
        )
    );

alter table public.job_postings
    add constraint job_postings_title_check
    check (char_length(btrim(title)) between 2 and 160);

alter table public.job_postings
    add constraint job_postings_location_check
    check (char_length(btrim(location)) between 2 and 120);

alter table public.job_postings
    add constraint job_postings_description_check
    check (char_length(btrim(description)) between 1 and 20000);

alter table public.job_postings
    add constraint job_postings_requirements_check
    check (requirements is null or char_length(requirements) <= 20000);

alter table public.job_applications drop constraint if exists job_applications_job_id_fkey;
alter table public.job_applications
    add constraint job_applications_job_id_fkey
    foreign key (job_id) references public.job_postings (id) on delete set null;

alter table public.job_applications drop constraint if exists job_applications_email_check;
alter table public.job_applications drop constraint if exists job_applications_name_check;
alter table public.job_applications drop constraint if exists job_applications_phone_check;
alter table public.job_applications drop constraint if exists job_applications_message_check;
alter table public.job_applications drop constraint if exists job_applications_resume_path_check;
alter table public.job_applications drop constraint if exists job_applications_resume_filename_check;
alter table public.job_applications drop constraint if exists job_applications_honeypot_check;
alter table public.job_applications drop constraint if exists job_applications_snapshot_check;

alter table public.job_applications
    add constraint job_applications_email_check
    check (
        char_length(email) between 6 and 254
        and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    );

alter table public.job_applications
    add constraint job_applications_name_check
    check (char_length(btrim(applicant_name)) between 2 and 120);

alter table public.job_applications
    add constraint job_applications_phone_check
    check (char_length(btrim(phone)) between 7 and 40);

alter table public.job_applications
    add constraint job_applications_message_check
    check (message is null or char_length(message) between 1 and 5000);

alter table public.job_applications
    add constraint job_applications_resume_path_check
    check (
        resume_path ~* '^applications/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|doc|docx)$'
    );

alter table public.job_applications
    add constraint job_applications_resume_filename_check
    check (
        char_length(btrim(resume_filename)) between 1 and 255
        and resume_filename !~ '[/\\]'
    );

alter table public.job_applications
    add constraint job_applications_honeypot_check
    check (
        company_website is null
        or (char_length(company_website) <= 200 and btrim(company_website) = '')
    );

alter table public.job_applications
    add constraint job_applications_snapshot_check
    check (char_length(btrim(job_title_snapshot)) between 2 and 160);

-- ---------------------------------------------------------------------------
-- Guards: honeypot, open-job check, snapshot, and a per-email hourly cap.
-- Lives in schema "private" so PostgREST does not expose it as an RPC.
-- SECURITY DEFINER is required so the cap can see rows the applicant cannot.
-- ---------------------------------------------------------------------------

create or replace function private.enforce_job_application_guards()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    recent_count integer;
    open_title text;
begin
    if new.company_website is not null and btrim(new.company_website) <> '' then
        raise exception 'Invalid submission'
            using errcode = '22023';
    end if;

    new.applicant_name := btrim(new.applicant_name);
    new.email := lower(btrim(new.email));
    new.phone := btrim(new.phone);
    new.message := nullif(btrim(coalesce(new.message, '')), '');
    new.resume_filename := btrim(new.resume_filename);
    new.reviewed := false;
    new.created_at := pg_catalog.now();

    if new.job_id is null then
        new.job_title_snapshot := 'General application';
    else
        select title
        into open_title
        from public.job_postings
        where id = new.job_id
          and status = 'published';

        if open_title is null then
            raise exception 'This position is not open for applications.'
                using errcode = 'P0001';
        end if;

        new.job_title_snapshot := open_title;
    end if;

    select count(*)
    into recent_count
    from public.job_applications
    where lower(email) = new.email
      and created_at > pg_catalog.now() - interval '1 hour';

    if recent_count >= 5 then
        raise exception 'Too many applications from this email. Please try again later.'
            using errcode = 'P0001';
    end if;

    return new;
end;
$$;

revoke all on function private.enforce_job_application_guards() from public;
grant execute on function private.enforce_job_application_guards() to anon, authenticated, service_role;

drop trigger if exists job_applications_guard on public.job_applications;
create trigger job_applications_guard
    before insert on public.job_applications
    for each row
    execute function private.enforce_job_application_guards();

create or replace function public.touch_job_posting_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at := pg_catalog.now();
    return new;
end;
$$;

revoke all on function public.touch_job_posting_updated_at() from public;
grant execute on function public.touch_job_posting_updated_at() to authenticated, service_role;

drop trigger if exists job_postings_touch_updated_at on public.job_postings;
create trigger job_postings_touch_updated_at
    before update on public.job_postings
    for each row
    execute function public.touch_job_posting_updated_at();

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists job_postings_published_created_idx
    on public.job_postings (created_at desc)
    where status = 'published';

create index if not exists job_postings_status_idx
    on public.job_postings (status, created_at desc);

create index if not exists job_applications_created_idx
    on public.job_applications (created_at desc);

create index if not exists job_applications_job_id_idx
    on public.job_applications (job_id);

create index if not exists job_applications_email_created_idx
    on public.job_applications (lower(email), created_at desc);

-- ---------------------------------------------------------------------------
-- Privileges. RLS is the second layer; grants are the first.
-- Anon can insert an application and cannot read any of them back.
-- ---------------------------------------------------------------------------

revoke all on table public.job_postings from public, anon, authenticated;
revoke all on table public.job_applications from public, anon, authenticated;

grant select on table public.job_postings to anon;
grant select, insert, update, delete on table public.job_postings to authenticated;
grant all on table public.job_postings to service_role;

grant insert on table public.job_applications to anon;
grant select, insert, update, delete on table public.job_applications to authenticated;
grant all on table public.job_applications to service_role;

alter table public.job_postings enable row level security;
alter table public.job_applications enable row level security;

drop policy if exists "Public can view published jobs" on public.job_postings;
drop policy if exists "Authenticated users can view all jobs" on public.job_postings;
drop policy if exists "Authenticated users can insert jobs" on public.job_postings;
drop policy if exists "Authenticated users can update jobs" on public.job_postings;
drop policy if exists "Authenticated users can delete jobs" on public.job_postings;

create policy "Public can view published jobs"
    on public.job_postings
    for select
    to anon
    using (status = 'published');

create policy "Authenticated users can view all jobs"
    on public.job_postings
    for select
    to authenticated
    using (true);

create policy "Authenticated users can insert jobs"
    on public.job_postings
    for insert
    to authenticated
    with check (true);

create policy "Authenticated users can update jobs"
    on public.job_postings
    for update
    to authenticated
    using (true)
    with check (true);

create policy "Authenticated users can delete jobs"
    on public.job_postings
    for delete
    to authenticated
    using (true);

drop policy if exists "Anyone can submit an application" on public.job_applications;
drop policy if exists "Authenticated users can view applications" on public.job_applications;
drop policy if exists "Authenticated users can update applications" on public.job_applications;
drop policy if exists "Authenticated users can delete applications" on public.job_applications;

create policy "Anyone can submit an application"
    on public.job_applications
    for insert
    to anon, authenticated
    with check (
        (company_website is null or btrim(company_website) = '')
        and (
            job_id is null
            or job_id in (
                select id from public.job_postings where status = 'published'
            )
        )
    );

create policy "Authenticated users can view applications"
    on public.job_applications
    for select
    to authenticated
    using (true);

create policy "Authenticated users can update applications"
    on public.job_applications
    for update
    to authenticated
    using (true)
    with check (true);

create policy "Authenticated users can delete applications"
    on public.job_applications
    for delete
    to authenticated
    using (true);

comment on table public.job_postings is
    'Career postings. status published is the only state visible to anonymous visitors.';
comment on table public.job_applications is
    'Job applications. Anonymous users may insert only. Resume objects are paths in the private resumes bucket.';
comment on column public.job_applications.company_website is
    'Honeypot. Must be empty. Filled values are rejected.';
comment on column public.job_applications.resume_path is
    'Object key inside the private resumes bucket, not a public URL.';

-- ---------------------------------------------------------------------------
-- Private storage bucket for resumes (10 MB, PDF/DOC/DOCX).
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'resumes',
    'resumes',
    false,
    10485760,
    array[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]::text[]
)
on conflict (id) do update
set
    name = excluded.name,
    public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can upload resumes" on storage.objects;
drop policy if exists "Admins can read resumes" on storage.objects;
drop policy if exists "Admins can delete resumes" on storage.objects;

create policy "Anyone can upload resumes"
    on storage.objects
    for insert
    to anon, authenticated
    with check (
        bucket_id = 'resumes'
        and name ~* '^applications/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|doc|docx)$'
    );

create policy "Admins can read resumes"
    on storage.objects
    for select
    to authenticated
    using (bucket_id = 'resumes');

create policy "Admins can delete resumes"
    on storage.objects
    for delete
    to authenticated
    using (bucket_id = 'resumes');
