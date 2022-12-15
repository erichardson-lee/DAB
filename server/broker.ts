import {
  WsRequest,
  WsRequestInvoke,
  WsRequestRegister,
  WsRequestSubscribe,
  WsResponse,
  WsResponseInvokeAck,
  WsResponseRegisterAck,
  WsResponseSubscribeAck,
} from "./deps.ts";

export class Broker {
  public handleRequest(request: WsRequest): WsResponse {
    switch (request.command) {
      case "invoke":
        return this.handleInvoke(request as WsRequestInvoke);

      case "register":
        return this.handleRegister(request as WsRequestRegister);

      case "subscribe":
        return this.handleSubscribe(request as WsRequestSubscribe);

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

  protected handleInvoke(request: WsRequestInvoke): WsResponseInvokeAck {
    return {
      command: "invokeAck",
      conversation: request.conversation,
      message: "Command Not Implemented",
      success: false,
    };
  }

  protected handleRegister(request: WsRequestRegister): WsResponseRegisterAck {
    return {
      command: "registerAck",
      conversation: request.conversation,
      message: "Command Not Implemented",
      success: false,
    };
  }

  protected handleSubscribe(
    request: WsRequestSubscribe
  ): WsResponseSubscribeAck {
    return {
      command: "subscribeAck",
      conversation: request.conversation,
      message: "Command Not Implemented",
      success: false,
    };
  }
}
