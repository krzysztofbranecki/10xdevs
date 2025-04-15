export const validateInputText = (text: string): string | null => {
  if (!text.trim()) {
    return "Tekst nie może być pusty";
  }

  if (text.length < 1000) {
    return "Tekst musi zawierać co najmniej 1000 znaków";
  }

  if (text.length > 10000) {
    return "Tekst nie może przekraczać 10000 znaków";
  }

  return null;
}; 