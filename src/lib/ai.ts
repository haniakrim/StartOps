interface AIProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  defaultModel?: string;
  isDefault: boolean;
}

function getProviders(): AIProvider[] {
  try {
    const raw = localStorage.getItem("startops_ai_providers");
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

function getDefaultProvider(): AIProvider | null {
  const providers = getProviders();
  return providers.find((p) => p.isDefault) || providers[0] || null;
}

export function isAIConfigured(): boolean {
  return !!getDefaultProvider();
}

export async function callAI(
  messages: { role: string; content: string }[]
): Promise<{ content: string; model?: string }> {
  const provider = getDefaultProvider();
  if (!provider) {
    throw new Error("No AI provider configured. Go to Settings > AI API Settings.");
  }

  const isOpenRouter = provider.baseUrl.includes("openrouter.ai");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (provider.apiKey) {
    headers.Authorization = `Bearer ${provider.apiKey}`;
  }
  if (isOpenRouter) {
    headers["HTTP-Referer"] = window.location.origin;
    headers["X-Title"] = "StartOps";
  }

  const chatUrl = `${provider.baseUrl.replace(/\/$/, "")}/chat/completions`;
  const model = provider.defaultModel || "gpt-3.5-turbo";

  const res = await fetch(chatUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`AI request failed: ${res.status} ${body.slice(0, 200)}`);
  }

  const data = await res.json().catch(() => ({}));
  const content = data.choices?.[0]?.message?.content || "";
  return { content, model: data.model };
}

export async function generateAIResponse(prompt: string): Promise<string> {
  const { content } = await callAI([
    { role: "system", content: CRM_SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ]);
  return content;
}

export async function summarizeText(text: string): Promise<string> {
  const { content } = await callAI([
    {
      role: "system",
      content:
        "Summarize the following text into 2-3 concise sentences. Capture the key points only.",
    },
    { role: "user", content: text },
  ]);
  return content;
}

export function buildCRMContext(_orgId?: string): string {
  return `You are StartOps AI, an intelligent CRM assistant. You help with sales, contacts, deals, and communications.`;
}

export const CRM_SYSTEM_PROMPT =
  "You are StartOps AI, an intelligent CRM assistant. You help users manage contacts, deals, communications, and sales pipelines. Be concise, actionable, and business-focused.";
