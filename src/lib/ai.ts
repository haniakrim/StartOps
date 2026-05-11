export function isAIConfigured(): boolean {
  return false;
}

export async function callAI(_messages: { role: string; content: string }[]): Promise<{ content: string }> {
  return { content: "" };
}

export async function generateAIResponse(_prompt: string): Promise<string> {
  return "";
}

export async function summarizeText(_text: string): Promise<string> {
  return "";
}

export function buildCRMContext(): string {
  return "";
}

export const CRM_SYSTEM_PROMPT = "You are a helpful CRM assistant.";
