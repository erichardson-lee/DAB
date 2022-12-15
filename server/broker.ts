import {
  WsRequest,
  WsRequestInvoke,
  WsRequestRegister,
  WsRequestSubscribe,
  WsResponse,
  WsResponseInvokeAck,
  WsResponseInvokeReq,
  WsResponseRegisterAck,
  WsResponseSubscribeAck,
} from "./deps.ts";
import { WebsocketID, WSHandler } from "./websocket.ts";

export class Broker {
  constructor(
    protected readonly ws: Pick<WSHandler, "send" | "sendMsg" | "isConnected">,
  ) {}

  public handleRequest(request: WsRequest, requester: WebsocketID): WsResponse {
    switch (request.command) {
      case "invoke":
        return this.handleInvoke(request as WsRequestInvoke, requester);

      case "register":
        return this.handleRegister(request as WsRequestRegister, requester);

      case "subscribe":
        return this.handleSubscribe(request as WsRequestSubscribe, requester);

      default:
        break;
    }

    return {
      command: "serverError",
      // @ts-expect-error This SHOULD be unreachable code/type
      conversation: request.conversation,
      message: "Command Not Implemented",
      success: false,
    };
  }

  protected handleInvoke(
    request: WsRequestInvoke,
    requester: WebsocketID,
  ): WsResponseInvokeAck {
    request.id = requester;
    const id = <WebsocketID> request.id;

    if (!this.ws.isConnected(id)) {
      return {
        command: "invokeAck",
        conversation: request.conversation,
        message: `RPC Error: Client {${id}} not connected`,
        success: false,
      };
    }

    const msg: WsResponseInvokeReq = {
      command: "invokeReq",
      conversation: Math.floor(Math.random() * 1e12),
      payload: request.payload,
      requester: requester,
    };
    this.ws.sendMsg(id, msg);

    return {
      command: "invokeAck",
      conversation: request.conversation,
      message: "Invokation Sent",
      success: true,
    };
  }

  protected handleRegister(
    request: WsRequestRegister,
    requester: WebsocketID,
  ): WsResponseRegisterAck {
    return {
      command: "registerAck",
      conversation: request.conversation,
      message: "Command Not Implemented",
      success: false,
    };
  }

  protected handleSubscribe(
    request: WsRequestSubscribe,
    requester: WebsocketID,
  ): WsResponseSubscribeAck {
    return {
      command: "subscribeAck",
      conversation: request.conversation,
      message: "Command Not Implemented",
      success: false,
    };
  }
}
