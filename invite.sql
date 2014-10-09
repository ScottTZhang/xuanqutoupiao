CREATE table rwb_invitations (
email varchar(256) not null,
code varchar(256),
permissions varchar(256),
referer varchar(256) not null references rwb_users(name),
expire varchar(16) not null check(expire='no' or expire='yes')
);
