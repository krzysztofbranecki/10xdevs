import { z } from "zod";
import type { APIRoute } from "astro";
import type { GenerateFlashcardsCommand, GenerateFlashcardsResultDto, ErrorResponseDto, FlashcardProposalDto } from "../../../types";
import { generateFlashcards, FlashcardGenerationError } from "../../../lib/services/flashcardsService";

export const prerender = false;

const generateFlashcardsSchema = z.object({
  input_text: z.string()
    .min(1000, "input_text must be at least 1000 characters")
    .max(10000, "input_text must be at most 10000 characters"),
  additional_options: z.optional(z.object({
    model: z.string().optional(),
  })),
});

export async function POST({ request, locals }: { request: Request, locals: any }): Promise<Response> {
  try {
    const supabase = locals.supabase;

    // Parse and validate the request body
    const body = await request.json();
    const result = generateFlashcardsSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input data",
          error_code: 400,
          details: result.error.errors
        } as ErrorResponseDto),
        { status: 400 }
      );
    }

    const command: GenerateFlashcardsCommand = result.data;

    let proposals: FlashcardProposalDto[] = [];
    try {
      proposals = await generateFlashcards(command, supabase);
    } catch (err) {
      if (err instanceof FlashcardGenerationError) {
        // Log error to generation_errors_log table
        await supabase.from('generation_errors_log').insert({
          error: err.message,
          error_code: err.type,
          error_details: err.details,
          user_id: null,
          command: JSON.stringify(command)
        });

        // Return appropriate error response based on error type
        const statusCode = err.type === 'VALIDATION_ERROR' ? 400 : 500;
        return new Response(
          JSON.stringify({
            error: err.message,
            error_code: statusCode,
            details: err.details
          } as ErrorResponseDto),
          { status: statusCode }
        );
      }

      // Handle unexpected errors
      console.error("Unexpected error in generate endpoint:", err);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          error_code: 500,
          details: "An unexpected error occurred"
        } as ErrorResponseDto),
        { status: 500 }
      );
    }

    const response: GenerateFlashcardsResultDto = { proposals };
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    console.error("Error in generating flashcards:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        error_code: 500,
        details: "An unexpected error occurred"
      } as ErrorResponseDto),
      { status: 500 }
    );
  }
} 