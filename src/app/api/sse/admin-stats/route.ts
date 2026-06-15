import { NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { addSSEClient, removeSSEClient } from "@/lib/sseManager";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const clientId = `admin_stats_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const enc = new TextEncoder();
  let heartbeatId: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      addSSEClient({ id: clientId, controller, type: "admin-stats" });
      controller.enqueue(enc.encode(`event: connected\ndata: {"ok":true}\n\n`));
      heartbeatId = setInterval(() => {
        try {
          controller.enqueue(enc.encode(`: heartbeat\n\n`));
        } catch {
          if (heartbeatId) clearInterval(heartbeatId);
          removeSSEClient(clientId);
        }
      }, 25000);
    },
    cancel() {
      if (heartbeatId) clearInterval(heartbeatId);
      removeSSEClient(clientId);
    },
  });

  req.signal.addEventListener("abort", () => {
    if (heartbeatId) clearInterval(heartbeatId);
    removeSSEClient(clientId);
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
