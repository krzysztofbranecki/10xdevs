import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FlashcardProposalList } from "./FlashcardProposalList";
import type { FlashcardProposalDto } from "@/types";

describe("FlashcardProposalList", () => {
  // Mock data for testing
  const mockProposals: FlashcardProposalDto[] = [
    { front: "Question 1", back: "Answer 1" },
    { front: "Question 2", back: "Answer 2" },
    { front: "Question 3", back: "Answer 3" },
  ];

  // Test rendering with proposals
  it("should render all provided flashcard proposals", () => {
    // Arrange
    const onEdit = vi.fn();
    const onAccept = vi.fn();
    const onDecline = vi.fn();

    // Act
    render(
      <FlashcardProposalList proposals={mockProposals} onEdit={onEdit} onAccept={onAccept} onDecline={onDecline} />
    );

    // Assert - Check that all proposals are rendered
    expect(screen.getByText("Propozycja 1")).toBeInTheDocument();
    expect(screen.getByText("Propozycja 2")).toBeInTheDocument();
    expect(screen.getByText("Propozycja 3")).toBeInTheDocument();

    // Check proposal content
    mockProposals.forEach((proposal) => {
      expect(screen.getByText(proposal.front)).toBeInTheDocument();
      expect(screen.getByText(proposal.back)).toBeInTheDocument();
    });
  });

  // Test rendering with empty proposals
  it("should render nothing when proposals array is empty", () => {
    // Arrange
    const onEdit = vi.fn();
    const onAccept = vi.fn();
    const onDecline = vi.fn();

    // Act
    const { container } = render(
      <FlashcardProposalList proposals={[]} onEdit={onEdit} onAccept={onAccept} onDecline={onDecline} />
    );

    // Assert
    // The container should only contain the div with space-y-4 class
    expect(container.firstChild).toHaveClass("space-y-4");
    expect(container.firstChild?.childNodes.length).toBe(0);
  });

  // Test edit button callback
  it("should call onEdit with correct index when edit button is clicked", () => {
    // Arrange
    const onEdit = vi.fn();
    const onAccept = vi.fn();
    const onDecline = vi.fn();

    // Act
    render(
      <FlashcardProposalList proposals={mockProposals} onEdit={onEdit} onAccept={onAccept} onDecline={onDecline} />
    );

    // Find all edit buttons
    const editButtons = screen.getAllByText("Edytuj");

    // Click the second edit button (index 1)
    fireEvent.click(editButtons[1]);

    // Assert
    expect(onEdit).toHaveBeenCalledWith(1);
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onAccept).not.toHaveBeenCalled();
    expect(onDecline).not.toHaveBeenCalled();
  });

  // Test accept button callback
  it("should call onAccept with correct index when accept button is clicked", () => {
    // Arrange
    const onEdit = vi.fn();
    const onAccept = vi.fn();
    const onDecline = vi.fn();

    // Act
    render(
      <FlashcardProposalList proposals={mockProposals} onEdit={onEdit} onAccept={onAccept} onDecline={onDecline} />
    );

    // Find all accept buttons
    const acceptButtons = screen.getAllByText("Akceptuj");

    // Click the first accept button (index 0)
    fireEvent.click(acceptButtons[0]);

    // Assert
    expect(onAccept).toHaveBeenCalledWith(0);
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onEdit).not.toHaveBeenCalled();
    expect(onDecline).not.toHaveBeenCalled();
  });

  // Test decline button callback
  it("should call onDecline with correct index when decline button is clicked", () => {
    // Arrange
    const onEdit = vi.fn();
    const onAccept = vi.fn();
    const onDecline = vi.fn();

    // Act
    render(
      <FlashcardProposalList proposals={mockProposals} onEdit={onEdit} onAccept={onAccept} onDecline={onDecline} />
    );

    // Find all decline buttons
    const declineButtons = screen.getAllByText("Odrzuć");

    // Click the third decline button (index 2)
    fireEvent.click(declineButtons[2]);

    // Assert
    expect(onDecline).toHaveBeenCalledWith(2);
    expect(onDecline).toHaveBeenCalledTimes(1);
    expect(onEdit).not.toHaveBeenCalled();
    expect(onAccept).not.toHaveBeenCalled();
  });
});
