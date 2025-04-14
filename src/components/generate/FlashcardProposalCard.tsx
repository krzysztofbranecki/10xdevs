import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { FlashcardProposalDto } from "@/types";

interface FlashcardProposalCardProps {
  proposal: FlashcardProposalDto;
  index: number;
  onEdit: (index: number, newProposal: FlashcardProposalDto) => void;
  onAccept: (index: number) => void;
  onDecline: (index: number) => void;
}

export function FlashcardProposalCard({
  proposal,
  index,
  onEdit,
  onAccept,
  onDecline,
}: FlashcardProposalCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProposal, setEditedProposal] = useState(proposal);

  const handleSave = () => {
    onEdit(index, editedProposal);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProposal(proposal);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Przód fiszki</label>
            <Textarea
              value={editedProposal.front}
              onChange={(e) =>
                setEditedProposal({ ...editedProposal, front: e.target.value })
              }
              placeholder="Przód fiszki..."
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tył fiszki</label>
            <Textarea
              value={editedProposal.back}
              onChange={(e) =>
                setEditedProposal({ ...editedProposal, back: e.target.value })
              }
              placeholder="Tył fiszki..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            Anuluj
          </Button>
          <Button onClick={handleSave}>Zapisz</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div>
          <h3 className="font-medium mb-2">Przód:</h3>
          <p className="whitespace-pre-wrap">{proposal.front}</p>
        </div>
        <div>
          <h3 className="font-medium mb-2">Tył:</h3>
          <p className="whitespace-pre-wrap">{proposal.back}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setIsEditing(true)}>
          Edytuj
        </Button>
        <Button variant="destructive" onClick={() => onDecline(index)}>
          Odrzuć
        </Button>
        <Button onClick={() => onAccept(index)}>Akceptuj</Button>
      </CardFooter>
    </Card>
  );
} 