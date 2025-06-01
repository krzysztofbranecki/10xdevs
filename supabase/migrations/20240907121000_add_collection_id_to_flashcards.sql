-- Dodaje kolumnę collection_id do flashcards
ALTER TABLE public.flashcards
  ADD COLUMN collection_id uuid REFERENCES public.collections(id) ON DELETE SET NULL;

-- Indeks na collection_id
CREATE INDEX idx_flashcards_collection_id ON public.flashcards(collection_id); 