export type WebsocketID = string & { _WebsocketId: never };

export class WSHandler {
  protected wsClients = new Map<WebsocketID, WebSocket>();

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

    this.wsClients.set(id, socket);

    socket.onopen = () => console.log(`🌅 Socket ${id} opened`);

    socket.onmessage = (e) => {
      console.log(`📥 Message Recieved: `, e.data);
      socket.send("Recieved " + id);
    };

    socket.onerror = (e) => {
      if ("message" in e) console.error("❗ Socket error", e.message);
      else console.error("❗ Socket error", e);
    };

    socket.onclose = (e) => {
      console.log(`😢 Socket ${id} closed: ${e.code} ${e.reason}`);
      this.wsClients.delete(id);
    };

    return response;
  }
}
