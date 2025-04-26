import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlashcardProposalForm } from "./FlashcardProposalForm";
import { mockFlashcardProposal } from "./__mocks__/mockFlashcardProps";

describe("FlashcardProposalForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders empty form when no initial data provided", () => {
    render(<FlashcardProposalForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const frontTextarea = screen.getByLabelText("Przód");
    const backTextarea = screen.getByLabelText("Tył");

    expect(frontTextarea).toHaveValue("");
    expect(backTextarea).toHaveValue("");
    expect(screen.getByRole("button", { name: "Zapisz" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anuluj" })).toBeInTheDocument();
  });

  it("renders form with initial data when provided", () => {
    render(
      <FlashcardProposalForm initialData={mockFlashcardProposal} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const frontTextarea = screen.getByLabelText("Przód");
    const backTextarea = screen.getByLabelText("Tył");

    expect(frontTextarea).toHaveValue(mockFlashcardProposal.front);
    expect(backTextarea).toHaveValue(mockFlashcardProposal.back);
  });

  it("calls onSubmit with form data when form is submitted", async () => {
    const user = userEvent.setup();

    render(<FlashcardProposalForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const frontTextarea = screen.getByLabelText("Przód");
    const backTextarea = screen.getByLabelText("Tył");
    const submitButton = screen.getByRole("button", { name: "Zapisz" });

    await user.type(frontTextarea, "New question");
    await user.type(backTextarea, "New answer");
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith({
      front: "New question",
      back: "New answer",
    });
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();

    render(<FlashcardProposalForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole("button", { name: "Anuluj" });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("updates form data when user types in textareas", async () => {
    const user = userEvent.setup();

    render(<FlashcardProposalForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const frontTextarea = screen.getByLabelText("Przód");
    const backTextarea = screen.getByLabelText("Tył");

    await user.type(frontTextarea, "Test typing front");
    await user.type(backTextarea, "Test typing back");

    expect(frontTextarea).toHaveValue("Test typing front");
    expect(backTextarea).toHaveValue("Test typing back");
  });

  it("prevents form submission when fields are empty", async () => {
    userEvent.setup();

    render(<FlashcardProposalForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    // Both fields should have the required attribute
    const frontTextarea = screen.getByLabelText("Przód");
    const backTextarea = screen.getByLabelText("Tył");
    expect(frontTextarea).toHaveAttribute("required");
    expect(backTextarea).toHaveAttribute("required");
  });

  it("matches snapshot", () => {
    const { container } = render(<FlashcardProposalForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(container.firstChild).toMatchInlineSnapshot(`
      <form
        class="space-y-4"
      >
        <div>
          <label
            class="block text-sm font-medium text-gray-700"
            for="front"
          >
            Przód
          </label>
          <textarea
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            id="front"
            required=""
            rows="3"
          />
        </div>
        <div>
          <label
            class="block text-sm font-medium text-gray-700"
            for="back"
          >
            Tył
          </label>
          <textarea
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            id="back"
            required=""
            rows="3"
          />
        </div>
        <div
          class="flex justify-end space-x-2"
        >
          <button
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            type="button"
          >
            Anuluj
          </button>
          <button
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            type="submit"
          >
            Zapisz
          </button>
        </div>
      </form>
    `);
  });
});
