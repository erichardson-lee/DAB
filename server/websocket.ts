import { Broker } from "./broker.ts";
import { WsRequest } from "./deps.ts";

export type WebsocketID = string & { _WebsocketId: never };

export class WSHandler {
  protected wsClients = new Map<WebsocketID, WebSocket>();

  protected broker = new Broker();

  public get clients(): ReadonlyMap<WebsocketID, WebSocket> {
    return this.wsClients;
  }

  public get clientIds(): WebsocketID[] {
    return Array.from(this.wsClients.keys());
  }

  public isConnected(id: WebsocketID): boolean {
    return this.wsClients.has(id);
  }

  /**
   * Sends a message to all websockets
   * @param message Message to send to all websockets
   */
  public broadcast(message: string) {
    for (const socket of this.wsClients.values()) {
      socket.send(message);
    }
  }

  /**
   * Sends a message to all websockets except the one with the given ID
   * @param id ID of the websocket to not send the message to
   * @param message Message to send to all websockets
   */
  public broadcastExcept(id: WebsocketID, message: string) {
    for (const [clientId, socket] of this.wsClients.entries()) {
      if (clientId !== id) socket.send(message);
    }
  }

  /**
   * Send a message to a websocket
   * @param id ID of the websocket to send message to
   * @param message Message to send
   * @throws Error if websocket is not found
   */
  public send(id: WebsocketID, message: string) {
    const socket = this.wsClients.get(id);
    if (socket) socket.send(message);
    else throw new Error(`Socket ${id} not found`);
  }

  public handleWebSocket(req: Request): Response {
    const { response, socket } = Deno.upgradeWebSocket(req, {
      idleTimeout: 120,
      protocol: "dab",
    });
    const id = <WebsocketID>crypto.randomUUID();
    console.log(`🤙 New socket connection: ${id}`);

    socket.onopen = (e) => this.onOpenCallback(id, socket, e);
    socket.onmessage = (e) => this.onMessageCallback(id, e);
    socket.onerror = (e) => this.onErrorCallback(id, e);
    socket.onclose = (e) => this.onCloseCallback(id, e);

    return response;
  }

  protected onOpenCallback(id: WebsocketID, socket: WebSocket, _ev: Event) {
    console.log(`🌅 ${id} | opened successfully`);
    this.wsClients.set(id, socket);
  }

  protected onErrorCallback(id: WebsocketID, ev: Event | ErrorEvent) {
    if ("message" in ev) {
      console.error(`❗ ${id} | ${ev.message}`);
    } else {
      console.error(`❗ ${id} | errored:`, ev);
    }
  }

  protected onMessageCallback(id: WebsocketID, ev: MessageEvent) {
    const data = <WsRequest>JSON.parse(ev.data);
    console.log(
      `📥 ${id} | Message Recieved: \n${JSON.stringify(data, undefined, 2)
        .split("\n")
        .map((line) => `   | ${line}`)
        .join("\n")}`
    );

    const response = this.broker.handleRequest(data);

    this.send(id, JSON.stringify(response));
  }

  protected onCloseCallback(id: WebsocketID, ev: CloseEvent) {
    console.log(`😢 ${id} | closed: ${ev.code} ${ev.reason}`);
    console.log("-".repeat(Deno.consoleSize().columns));
    this.wsClients.delete(id);
  }
}
