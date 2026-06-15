/**
 * SSE Manager — in-memory pub/sub for Server-Sent Events.
 * Uses globalThis so the singleton survives Next.js hot-reload in dev.
 */

type SSEClientType = "admin-chat" | "user-chat" | "admin-stats";

interface SSEClient {
  id: string;
  controller: ReadableStreamDefaultController<Uint8Array>;
  type: SSEClientType;
  conversationId?: string; // for user-chat streams
}

// Persist across HMR in development
const g = globalThis as typeof globalThis & {
  _sseClients?: Map<string, SSEClient>;
};
if (!g._sseClients) g._sseClients = new Map<string, SSEClient>();
const clients = g._sseClients;

const enc = new TextEncoder();

function send(
  controller: ReadableStreamDefaultController<Uint8Array>,
  event: string,
  data: unknown
) {
  try {
    controller.enqueue(
      enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    );
  } catch {
    // controller already closed — ignore
  }
}

export function addSSEClient(client: SSEClient) {
  clients.set(client.id, client);
}

export function removeSSEClient(id: string) {
  clients.delete(id);
}

/** Push event to every connected admin chat tab */
export function emitAdminChat(event: string, data: unknown) {
  Array.from(clients.values()).forEach((c) => {
    if (c.type === "admin-chat") send(c.controller, event, data);
  });
}

/** Push event to a specific user's chat stream (by conversationId) */
export function emitUserChat(
  conversationId: string,
  event: string,
  data: unknown
) {
  Array.from(clients.values()).forEach((c) => {
    if (c.type === "user-chat" && c.conversationId === conversationId)
      send(c.controller, event, data);
  });
}

/** Push event to every admin stats / orders tab */
export function emitAdminStats(event: string, data: unknown) {
  Array.from(clients.values()).forEach((c) => {
    if (c.type === "admin-stats") send(c.controller, event, data);
  });
}

export function getActiveClientCount() {
  return clients.size;
}
