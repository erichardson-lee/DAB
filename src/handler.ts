import { WSHandler } from "./websocket.ts";

export async function handle(conn: Deno.Conn) {
  const httpConn = Deno.serveHttp(conn);

  for await (const request of httpConn) {
    await request.respondWith(handleReq(request.request));
  }
}

/**
 * Utility type for functions than can be async or not, saves changing between
 * promise and not when adding/removing the async keyword.
 */
type PromiseIsh<T> = T | PromiseLike<T>;

const wsHandler = new WSHandler();

function handleReq(req: Request): PromiseIsh<Response> {
  if (req.headers.get("upgrade")?.toLowerCase() === "websocket") {
    return wsHandler.handleWebSocket(req);
  }

  return new Response("Hello World!", { status: 200, statusText: "OK" });
}
