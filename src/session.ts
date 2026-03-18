import { DurableObject } from "cloudflare:workers";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export class ChatSession extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/messages" && request.method === "GET") {
      const stored = await this.ctx.storage.get<Message[]>("messages");
      return Response.json(stored ?? []);
    }

    if (url.pathname === "/messages" && request.method === "POST") {
      const newMessages = await request.json<Message[]>();
      const stored = await this.ctx.storage.get<Message[]>("messages") ?? [];
      await this.ctx.storage.put("messages", [...stored, ...newMessages]);
      return Response.json({ ok: true });
    }

    if (url.pathname === "/clear" && request.method === "DELETE") {
      await this.ctx.storage.delete("messages");
      return Response.json({ ok: true });
    }

    return new Response("Not found", { status: 404 });
  }
}
