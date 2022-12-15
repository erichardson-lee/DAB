import {
  EventEmitter,
  WsRequest,
  WsRequestInvoke,
  WsResponse,
} from "./deps.ts";

const DEBUG_MODE = false as const;

export interface DabClientOptions {
  /**
   * The number of milliseconds to wait for a response from the server before
   * timing out a message.
   * @default 500
   */
  responseTimeout?: number;
}

export interface DabClientConnectionOptions {
  broker: string | URL;

  /**
   * The number of milliseconds before connection timeout on connect
   * @default 1000
   */
  timeout?: number;
}

type DabClientEvents = {
  open: [ws: WebSocket, ev: Event];
  close: [ws: WebSocket, ev: Event];
  error: [ws: WebSocket, ev: Event];
  message: [ws: WebSocket, ev: MessageEvent<string>];
};

export class DabClient extends EventEmitter<DabClientEvents> {
  protected websocket?: WebSocket;

  private _connected = false;
  public get connected(): boolean {
    return this._connected;
  }
  protected set connected(v: boolean) {
    this._connected = v;
  }

  constructor(protected readonly options: DabClientOptions = {}) {
    super();

    this.on("open", () => {
      DEBUG_MODE && console.debug("-> Setting Connection on open");
      this.connected = true;
    });
    this.on("close", () => {
      DEBUG_MODE && console.debug("-> Setting Connection on close");
      this.connected = false;
    });

    this.on("message", (...arg) => this.onMessage(...arg));
  }

  public async connect(
    connectionOptions: DabClientConnectionOptions,
  ): Promise<this> {
    const websocket = new WebSocket(connectionOptions.broker, ["dab"]);
    this.websocket = websocket;

    const connected = new Promise<void>((res, rej) => {
      const t = setTimeout(
        () => rej(new Error("Connection Timeout")),
        connectionOptions.timeout ?? 1000,
      );
      // websocket.addEventListener("open", () => {
      this.once("open", () => {
        clearTimeout(t);
        res();
      });
    });

    websocket.onopen = (ev) => {
      DEBUG_MODE && console.debug("🔬 On Open");
      this.emit("open", websocket, ev).finally(
        () => DEBUG_MODE && console.debug("🔬 Finished Emitting Open"),
      );
    };

    websocket.onclose = (ev) => {
      DEBUG_MODE && console.debug("🔬 On Close");
      this.emit("close", websocket, ev).finally(
        () => DEBUG_MODE && console.debug("🔬 Finished Emitting Close"),
      );
    };

    websocket.onerror = (ev) => {
      DEBUG_MODE && console.debug("🔬 On Error");
      this.emit("error", websocket, ev).finally(
        () => DEBUG_MODE && console.debug("🔬 Finished Emitting Error"),
      );
    };

    websocket.onmessage = (ev) => {
      DEBUG_MODE && console.debug("🔬 On Message");
      this.emit("message", websocket, ev).finally(
        () => DEBUG_MODE && console.debug("🔬 Finished Emitting Message"),
      );
    };

    // Wait for connection, or reject after timeout
    await connected;

    return this;
  }

  protected readonly pendingResponses = new Map<
    number,
    (msg: WsResponse) => void
  >();

  protected onMessage(_ws: WebSocket, ev: MessageEvent) {
    const msg = <WsResponse> JSON.parse(ev.data);
    const { conversation, command } = msg;

    if (
      // If it's an ack, resolve the promise
      command === "invokeAck" ||
      command === "registerAck" ||
      command === "subscribeAck" ||
      command === "serverError"
    ) {
      this.pendingResponses.get(conversation)?.(msg);
    }

    if (command === "serverError") {
      console.error("💣 Server Error ", msg);
    }

    if (command === "invokeReq") {
      console.log("🌟 Invoke ", msg);
    }
  }

  public send(request: WsRequest): Promise<WsResponse> {
    if (!this.connected) throw new Error("Not Connected");
    const conversation = Math.floor(Math.random() * 1e12);

    const response = new Promise<WsResponse>((res, err) => {
      const t = setTimeout(() => {
        err(new Error("Message Timeout"));
      }, this.options.responseTimeout ?? 500);
      this.pendingResponses.set(conversation, (a) => {
        this.pendingResponses.delete(conversation);
        clearTimeout(t);
        res(a);
      });
    });

    const msg: WsRequest = {
      ...request,
      conversation,
    };
    console.log("📩 Sending", msg);

    this.websocket?.send(JSON.stringify(msg));

    return response;
  }

  public disconnect(code = 1000, reason?: string): void {
    if (!this.connected) throw new Error("Already Disconnected"); // Already disconnected

    this.websocket?.close(code, reason);
  }
}

if (import.meta.main) {
  const client1 = new DabClient();

  client1.on("open", () => console.log("😀 Connected!"));
  client1.once("open", () => {
    setTimeout(() => {
      console.log("🛑 Disconnecting");
      client1.disconnect();
    }, 1000);
  });

  await client1.connect({
    broker: "ws://localhost:4142",
  });

  console.log("🌅 Connected");

  const msg: WsRequestInvoke = {
    command: "invoke",
    id: "test",
    conversation: 0,
    payload: "",
  };

  console.log("📤 Request", msg);
  client1.send(msg).then((res) => console.log("📥 Response", res));
}
