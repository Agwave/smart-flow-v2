import { createOrchestrator } from "@/lib/agents/orchestrator";
import type { AgentMessage } from "@/lib/agents/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const apiKey = process.env.ZHIPU_API_KEY;
  if (!apiKey) {
    return new Response("Missing ZHIPU_API_KEY", { status: 500 });
  }

  const orchestrator = createOrchestrator({
    enableReview: true,
  });

  const chatMessages: AgentMessage[] = messages.map(
    (msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content || "",
    })
  );

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        for await (const chunk of orchestrator.execute(chatMessages)) {
          controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        }
        controller.close();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        controller.enqueue(
          encoder.encode(`data: {"type":"error","message":"${errorMessage}"}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
