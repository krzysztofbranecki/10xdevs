import { FlashcardProposalDto } from '@/types/flashcard';
import { useState } from 'react';

interface FlashcardProposalFormProps {
  initialData?: FlashcardProposalDto;
  onSubmit: (data: FlashcardProposalDto) => void;
  onCancel: () => void;
}

export const FlashcardProposalForm = ({
  initialData,
  onSubmit,
  onCancel,
}: FlashcardProposalFormProps) => {
  const [formData, setFormData] = useState<FlashcardProposalDto>(
    initialData || { front: '', back: '' }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="front" className="block text-sm font-medium text-gray-700">
          Przód
        </label>
        <textarea
          id="front"
          value={formData.front}
          onChange={(e) => setFormData({ ...formData, front: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
          required
        />
      </div>
      <div>
        <label htmlFor="back" className="block text-sm font-medium text-gray-700">
          Tył
        </label>
        <textarea
          id="back"
          value={formData.back}
          onChange={(e) => setFormData({ ...formData, back: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Anuluj
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          Zapisz
        </button>
      </div>
    </form>
  );
}; 