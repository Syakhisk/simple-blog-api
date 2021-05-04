create table category
(
    id          serial not null
        constraint category_pk
            primary key,
    slug        varchar,
    name        varchar,
    description varchar,
    count       integer,
    created_at  timestamp with time zone default now(),
    updated_at  timestamp with time zone default now()
);

alter table category
    owner to postgres;

INSERT INTO public.category (id, slug, name, description, count, created_at, updated_at) VALUES (1, 'uncategorized', 'Uncategorized', null, null, '2021-05-04 10:19:54.811713', '2021-05-04 10:19:54.811713');