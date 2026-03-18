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

    if (request.method === "POST" && url.pathname === "/chat") {
      const { sessionId, message } = await request.json<{ sessionId: string; message: string }>();

      const id = env.CHAT_SESSION.idFromName(sessionId);
      const session = env.CHAT_SESSION.get(id) as unknown as ChatSession;
      const history = await session.getMessages();

      // Use Workflow for coordination (logs the interaction)
      env.CHAT_WORKFLOW.create({
        params: { sessionId, userMessage: message, history },
      }).catch(() => {});

      // Call LLM directly for real-time response
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
      });
      const reply = (res as { response: string }).response;

      await session.addMessage({ role: "user", content: message });
      await session.addMessage({ role: "assistant", content: reply });

      return Response.json({ reply });
    }

    if (request.method === "DELETE" && url.pathname === "/chat") {
      const { sessionId } = await request.json<{ sessionId: string }>();
      const id = env.CHAT_SESSION.idFromName(sessionId);
      const session = env.CHAT_SESSION.get(id) as unknown as ChatSession;
      await session.clear();
      return Response.json({ ok: true });
    }

    return new Response("Not found", { status: 404 });
  },
};
