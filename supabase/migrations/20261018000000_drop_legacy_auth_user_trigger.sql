-- Legacy trigger from an earlier app inserted into public.users/public.profiles,
-- which do not exist here, breaking every sign-up ("Database error saving new user").
drop trigger if exists on_auth_user_created on auth.users;
