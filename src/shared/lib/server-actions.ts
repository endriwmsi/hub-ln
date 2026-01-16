import type { ZodSchema } from "zod";

export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Wrapper para server actions com validação Zod e tratamento de erros
 */
export async function createServerAction<TInput, TOutput>(
  schema: ZodSchema<TInput>,
  handler: (input: TInput) => Promise<TOutput>,
): Promise<(input: unknown) => Promise<ActionResponse<TOutput>>> {
  return async (input: unknown): Promise<ActionResponse<TOutput>> => {
    try {
      const validatedInput = schema.parse(input);
      const data = await handler(validatedInput);
      return { success: true, data };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "An unknown error occurred" };
    }
  };
}

/**
 * Wrapper simples para server actions sem validação
 */
export async function safeServerAction<TOutput>(
  handler: () => Promise<TOutput>,
): Promise<ActionResponse<TOutput>> {
  try {
    const data = await handler();
    return { success: true, data };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unknown error occurred" };
  }
}
