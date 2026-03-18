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

      const workflow = await env.CHAT_WORKFLOW.create({
        params: { sessionId, userMessage: message, history },
      });

      // Poll for result
      let result = await workflow.status();
      while (result.status !== "complete" && result.status !== "errored") {
        await new Promise((r) => setTimeout(r, 500));
        result = await workflow.status();
      }

      if (result.status === "errored") {
        return Response.json({ error: "Workflow failed" }, { status: 500 });
      }

      const reply = result.output as string;

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
