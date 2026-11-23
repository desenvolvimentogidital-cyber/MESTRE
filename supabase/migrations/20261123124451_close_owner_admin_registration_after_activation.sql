-- First owner claimed the only invitation; retire further self-activation.
-- The existing authorized administrator remains unchanged.
revoke execute on function public.activate_admin_with_invite(text) from authenticated, anon, public;
