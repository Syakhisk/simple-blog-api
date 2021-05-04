create table posts
(
    id         serial not null
        constraint posts_pk
            primary key,
    title      varchar,
    slug       varchar,
    content    varchar,
    excerpt    varchar,
    author     integer
        constraint posts_users_id_fk
            references users,
    categories integer
        constraint posts_category_id_fk
            references category,
    tags       character varying[],
    thumbnail  varchar,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

alter table posts
    owner to postgres;

create unique index posts_slug_uindex
    on posts (slug);

