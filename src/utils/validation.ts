export const validateInputText = (text: string): string | null => {
  if (!text.trim()) {
    return "Tekst nie może być pusty";
  }

  if (text.length > 1000) {
    return "Tekst nie może być dłuższy niż 1000 znaków";
  }

  return null;
}; 