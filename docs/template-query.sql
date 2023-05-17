-- CREATE DATABASE

create database template;
\l
\c template

-- CREATE TABLE

create table users(
    id varchar(36) not null primary key,
    fullname varchar(40) not null,
    email varchar(80) not null unique,
    password varchar(128) not null,
    role varchar default('user'),
    image varchar,
    phone_number varchar(16),
    address varchar,
    email_verified boolean default(false),
    created_at timestamptz,
    updated_at timestamptz
);

create table products(
    id varchar(36) not null primary key,
    id_user varchar(36) references users on update cascade on delete cascade,
    foreign key (id_user) references users(id),
    name varchar(40) not null,
    stock int not null,
    price bigint not null,
    image varchar,
    description text,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create table transactions(
    id varchar(36) not null primary key,
    id_user varchar(36) references users on update cascade on delete cascade,
    foreign key (id_user) references users(id),
    paid_amount bigint not null,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create table transactions_products(
    id varchar(36) not null primary key,
    id_user varchar(36) references users on update cascade on delete cascade,
    foreign key (id_user) references users(id),
    id_transaction varchar(36) references transactions on update cascade on delete cascade,
    foreign key (id_transaction) references transactions(id),
    created_at timestamptz
);