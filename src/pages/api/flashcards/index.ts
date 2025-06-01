import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateFlashcardCommand, ErrorResponseDto, FlashcardDto } from "../../../types";

export const prerender = false;

const createFlashcardSchema = z.object({
  front: z.string().min(1, "front is required"),
  back: z.string().min(1, "back is required"),
  source_id: z.string().nullable().optional(),
  generation_id: z.string().nullable().optional(),
});

export async function POST({
  request,
  locals,
}: {
  request: Request;
  locals: { supabase: SupabaseClient; user?: { id: string }; source_id?: string };
}): Promise<Response> {
  try {
    const supabase = locals.supabase;
    const body = await request.json();
    const result = createFlashcardSchema.safeParse(body);
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
    const command: CreateFlashcardCommand = result.data;
    const insertData = {
      ...command,
      user_id: locals.user?.id || null,
      source_id: locals.source_id || command.source_id || null,
    };
    const { data, error } = await supabase.from("flashcards").insert(insertData).select().single();
    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
          error_code: 500,
          details: error.details,
        } as ErrorResponseDto),
        { status: 500 }
      );
    }
    return new Response(JSON.stringify(data as FlashcardDto), { status: 201 });
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
