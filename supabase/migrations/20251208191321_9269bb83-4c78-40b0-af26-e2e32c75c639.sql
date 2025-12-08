-- Grant admin role to Erosynth Labs
INSERT INTO public.user_roles (user_id, role)
VALUES ('c75cfca4-8d6f-479a-bed5-0a7362541998', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Grant admin role to Golden Gleich
INSERT INTO public.user_roles (user_id, role)
VALUES ('42fb3aaa-4ddb-41a1-adc4-75c9f0da99d6', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;