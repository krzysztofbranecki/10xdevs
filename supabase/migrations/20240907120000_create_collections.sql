-- Tworzy tabelę collections
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  description text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Indeks na user_id
CREATE INDEX idx_collections_user_id ON public.collections(user_id);

-- RLS: tylko właściciel ma dostęp
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Collections are only viewable by owner" ON public.collections
  USING (user_id = auth.uid()); 