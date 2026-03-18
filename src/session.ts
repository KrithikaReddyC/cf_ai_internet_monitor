import { DurableObject } from "cloudflare:workers";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export class ChatSession extends DurableObject {
  private messages: Message[] = [];

  async addMessage(msg: Message): Promise<void> {
    this.messages.push(msg);
    await this.ctx.storage.put("messages", this.messages);
  }

  async getMessages(): Promise<Message[]> {
    const stored = await this.ctx.storage.get<Message[]>("messages");
    this.messages = stored ?? [];
    return this.messages;
  }

  async clear(): Promise<void> {
    this.messages = [];
    await this.ctx.storage.delete("messages");
  }
}
