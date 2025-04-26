import { describe, it, expect } from 'vitest';
import { validateInputText } from './validation';

describe('validateInputText', () => {
  // Test for empty text
  it('should return error message for empty text', () => {
    // Arrange
    const emptyText = '';
    const whitespaceText = '   ';
    
    // Act & Assert
    expect(validateInputText(emptyText)).toBe('Tekst nie może być pusty');
    expect(validateInputText(whitespaceText)).toBe('Tekst nie może być pusty');
  });

  // Test for text shorter than required
  it('should return error message for text with less than 1000 characters', () => {
    // Arrange
    const shortText = 'A'.repeat(999);
    
    // Act
    const result = validateInputText(shortText);
    
    // Assert
    expect(result).toBe('Tekst musi zawierać co najmniej 1000 znaków');
  });

  // Test for text longer than allowed
  it('should return error message for text with more than 10000 characters', () => {
    // Arrange
    const longText = 'A'.repeat(10001);
    
    // Act
    const result = validateInputText(longText);
    
    // Assert
    expect(result).toBe('Tekst nie może przekraczać 10000 znaków');
  });

  // Test for valid text
  it('should return null for valid text', () => {
    // Arrange
    const validText = 'A'.repeat(5000);
    
    // Act
    const result = validateInputText(validText);
    
    // Assert
    expect(result).toBeNull();
  });

  // Test edge cases
  it('should handle edge cases correctly', () => {
    // Arrange
    const exactMinimum = 'A'.repeat(1000);
    const exactMaximum = 'A'.repeat(10000);
    
    // Act & Assert
    expect(validateInputText(exactMinimum)).toBeNull();
    expect(validateInputText(exactMaximum)).toBeNull();
  });
}); 