import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from "cloudflare:workers";

export type ChatPayload = {
  sessionId: string;
  userMessage: string;
  history: { role: string; content: string }[];
};

interface WorkflowEnv { AI: Ai; }

export class ChatWorkflow extends WorkflowEntrypoint<WorkflowEnv, ChatPayload> {
  async run(event: WorkflowEvent<ChatPayload>, step: WorkflowStep) {
    const { userMessage, history } = event.payload;

    const messages = await step.do("build-prompt", async () => {
      return [
        {
          role: "system",
          content:
            "You are an expert assistant on Internet infrastructure, networking, and Cloudflare technologies. Answer clearly and concisely.",
        },
        ...history,
        { role: "user", content: userMessage },
      ];
    });

    const reply = await step.do("call-llm", async () => {
      const res = await (this.env.AI.run as Function)("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        messages,
        stream: false,
      });
      return (res as { response: string }).response;
    });

    return reply;
  }
}
