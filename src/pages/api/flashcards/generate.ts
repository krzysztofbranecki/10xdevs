import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  GenerateFlashcardsCommand,
  GenerateFlashcardsResultDto,
  ErrorResponseDto,
  FlashcardProposalDto,
} from "../../../types";
import { generateFlashcards, FlashcardGenerationError } from "../../../lib/services/flashcardsService";

export const prerender = false;

const generateFlashcardsSchema = z.object({
  input_text: z
    .string()
    .min(1000, "input_text must be at least 1000 characters")
    .max(10000, "input_text must be at most 10000 characters"),
  additional_options: z.optional(
    z.object({
      model: z.string().optional(),
    })
  ),
});

export async function POST({
  request,
  locals,
}: {
  request: Request;
  locals: { supabase: SupabaseClient };
}): Promise<Response> {
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
          details: JSON.stringify(result.error.errors),
        } as ErrorResponseDto),
        { status: 400 }
      );
    }

    const command: GenerateFlashcardsCommand = result.data;

    let proposals: FlashcardProposalDto[] = [];
    let rawResponse: GenerateFlashcardsResultDto["rawResponse"] | undefined = undefined;
    let generationId: string | null = null;
    let sourceId: string | null = null;
    try {
      const result = await generateFlashcards(command, supabase);
      proposals = result.proposals;
      rawResponse = result.rawResponse;

      // 1. Oblicz hash tekstu wejściowego
      const textHash = await (async () => {
        // Prosty hash, można zamienić na lepszy algorytm
        const encoder = new TextEncoder();
        const data = encoder.encode(command.input_text);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
      })();

      // 2. Sprawdź czy source już istnieje
      const { data: existingSource } = await supabase
        .from("source")
        .select("id")
        .eq("text_hash", textHash)
        .maybeSingle();

      if (existingSource && existingSource.id) {
        sourceId = existingSource.id;
      } else {
        // 3. Dodaj nowy rekord do source
        const { data: newSource, error: sourceError } = await supabase
          .from("source")
          .insert({
            model: rawResponse?.model || "unknown",
            text_hash: textHash,
            length: command.input_text.length,
            source_type: "ai-full",
            user_id: null, // Dodaj user_id jeśli masz dostęp
          })
          .select()
          .single();
        if (sourceError) {
          throw new Error("Failed to save source: " + sourceError.message);
        }
        sourceId = newSource.id;
      }

      // 4. Dodaj wpis do generations
      const { data: generation, error: generationError } = await supabase
        .from("generations")
        .insert({
          generated_count: proposals.length,
          user_id: null, // Dodaj user_id jeśli masz dostęp
          source_id: sourceId,
        })
        .select()
        .single();
      if (generationError) {
        throw new Error("Failed to save generation: " + generationError.message);
      }
      generationId = generation.id;
    } catch (err) {
      if (err instanceof FlashcardGenerationError) {
        // Log error to generation_errors_log table
        await supabase.from("generation_errors_log").insert({
          error: err.message,
          error_code: err.type,
          error_details: err.details,
          user_id: null,
          command: JSON.stringify(command),
        });

        // Use the status code from the error
        const statusCode = err.statusCode;

        return new Response(
          JSON.stringify({
            error: err.message,
            error_code: statusCode,
            details: err.details,
          } as ErrorResponseDto),
          { status: statusCode }
        );
      }

      // Handle unexpected errors
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          error_code: 500,
          details: "An unexpected error occurred",
        } as ErrorResponseDto),
        { status: 500 }
      );
    }

    // Zwróć proposals, rawResponse, generation_id i source_id
    return new Response(JSON.stringify({ proposals, rawResponse, generation_id: generationId, source_id: sourceId }), {
      status: 200,
    });
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        error_code: 500,
        details: "An unexpected error occurred",
        error_details: error,
      } as ErrorResponseDto),
      { status: 500 }
    );
  }
}
