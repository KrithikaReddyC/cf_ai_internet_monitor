import { ChatSession } from "./session";
import { ChatWorkflow } from "./workflow";

export { ChatSession, ChatWorkflow };

export interface Env {
  AI: Ai;
  CHAT_SESSION: DurableObjectNamespace;
  CHAT_WORKFLOW: Workflow;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/chat") {
      try {
        const { sessionId, message } = await request.json<{ sessionId: string; message: string }>();

        const id = env.CHAT_SESSION.idFromName(sessionId);
        const stub = env.CHAT_SESSION.get(id);

        // Get history via fetch on the Durable Object
        const historyRes = await stub.fetch("https://do/messages");
        const history: { role: "user" | "assistant"; content: string }[] = await historyRes.json();

        // Call LLM directly
        const messages = [
          {
            role: "system" as const,
            content: "You are an expert assistant on Internet infrastructure, networking, and Cloudflare technologies. Answer clearly and concisely.",
          },
          ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
          { role: "user" as const, content: message },
        ];

        const res = await (env.AI.run as Function)("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
          messages,
          stream: false,
          max_tokens: 1024,
        });
        const reply = (res as { response: string }).response;

        await stub.fetch("https://do/messages", {
          method: "POST",
          body: JSON.stringify([
            { role: "user", content: message },
            { role: "assistant", content: reply },
          ]),
        });

        return Response.json({ reply });
      } catch (e: any) {
        return Response.json({ error: e.message }, { status: 500 });
      }
    }

    if (request.method === "DELETE" && url.pathname === "/api/chat") {
      const { sessionId } = await request.json<{ sessionId: string }>();
      const id = env.CHAT_SESSION.idFromName(sessionId);
      const stub = env.CHAT_SESSION.get(id);
      await stub.fetch("https://do/clear", { method: "DELETE" });
      return Response.json({ ok: true });
    }

    return new Response("Not found", { status: 404 });
  },
};
