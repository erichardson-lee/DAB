# Specification

## Envelope Specification

```yaml
$file: envelope

properties:
  # A unique (arbitrary) number that corresponds to a series of messages
  # If a message is being sent as a result of another message, then this value
  # MUST be the same
  # If a message 'starts' a conversation, it must set this value
  conversation: { type: uint32 }

  payload: {}
```

## Request Specification

```yaml
$file: wsRequest

discriminator: "command"
mapping:
  # Command used to register a new device
  register:
    properties:
      name: { type: string }
      id: { type: string }
    optionalProperties:
      events: { elements: { type: string } }

  # Command used to invoke a method on a device by its ID
  invoke:
    properties:
      id: { type: string }
      payload: { type: string }

  # Command to 'subscribe' to an event on a device
  subscribe:
    properties:
      id: { type: string }
      event: { type: string }
```

## Response Specification

```yaml
$file: wsResponse

discriminator: "command"
metadata:
  comandAck: &commandAck
    properties:
      success: { type: boolean }
      message: { type: string }
mapping:
  # Acknowledgement of registration request
  registerAck: *commandAck

  # Acknowledgement of invokation
  invokeAck: *commandAck

  # Error response to an invocation
  serverError: *commandAck

  # Invocation Request from another client
  invokeReq:
    properties:
      requester: { type: string }
      payload: { type: string }

  # Acknowledgement of subscription
  subscribeAck: *commandAck

  # Sent on events
  onEvent:
    properties:
      event: { type: string }
      # String Encoded Data (Defined by device/emitter)
      data: { type: string }
```
