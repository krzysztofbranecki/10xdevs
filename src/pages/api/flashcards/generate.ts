import { z } from "zod";
import type { APIRoute } from "astro";
import type { GenerateFlashcardsCommand, GenerateFlashcardsResultDto, ErrorResponseDto, FlashcardProposalDto } from "../../../types";
import { generateFlashcards } from "../../../lib/services/flashcardsService";

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
    // Removed authentication check and updated error logging
    const supabase = locals.supabase;

    // Parse and validate the request body
    const body = await request.json();
    const result = generateFlashcardsSchema.safeParse(body);
    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error.message, error_code: 400 } as ErrorResponseDto), { status: 400 });
    }

    const command: GenerateFlashcardsCommand = result.data;

    let proposals: FlashcardProposalDto[] = [];
    try {
      proposals = await generateFlashcards(command, supabase);
    } catch (err: any) {
      // Log error to generation_errors_log table without user_id as auth is disabled
      await supabase.from('generation_errors_log').insert({
        error: err.message,
        user_id: null,
        command: JSON.stringify(command)
      });
      return new Response(JSON.stringify({ error: "Internal Server Error", error_code: 500 } as ErrorResponseDto), { status: 500 });
    }

    const response: GenerateFlashcardsResultDto = { proposals };
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    console.error("Error in generating flashcards:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error", error_code: 500 } as ErrorResponseDto), { status: 500 });
  }
} 