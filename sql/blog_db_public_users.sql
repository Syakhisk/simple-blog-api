create table users
(
    id         serial not null
        constraint users_pk
            primary key,
    username   varchar,
    email      varchar,
    name       varchar,
    role       integer[],
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

alter table users
    owner to postgres;

