# Request Specification

```yaml
$file: wsRequest

discriminator: "command"
metadata:
  baseCommand: &baseCommand
    # A unique (arbitrary) number that corresponds to a series of messages
    # If a message is being sent as a result of another message, then this value
    # MUST be the same
    # If a message 'starts' a conversation, it must set this value
    conversation: { type: uint32 }

  comandAck: &commandAck
    properties:
      <<: *baseCommand
      success: { type: boolean }
      message: { type: string }
mapping:
  # Command used to register a new device
  register:
    properties:
      <<: *baseCommand
      name: { type: string }
      id: { type: string }
    optionalProperties:
      events: { elements: { type: string } }

  # Command used to invoke a method on a device by its ID
  invoke:
    properties:
      <<: *baseCommand
      id: { type: string }
      payload: { type: string }

  # Command to 'subscribe' to an event on a device
  subscribe:
    properties:
      <<: *baseCommand
      id: { type: string }
      event: { type: string }
```

## Response Specification

```yaml
$file: wsResponse

discriminator: "command"
metadata:
  baseCommand: &baseCommand
    # A unique (arbitrary) number that corresponds to a series of messages
    # If a message is being sent as a result of another message, then this value
    # MUST be the same
    # If a message 'starts' a conversation, it must set this value
    conversation: { type: uint32 }

  comandAck: &commandAck
    properties:
      <<: *baseCommand
      success: { type: boolean }
      message: { type: string }
mapping:
  # Acknowledgement of registration request
  registerAck: *commandAck

  # Acknowledgement of invokation
  invokeAck: *commandAck

  # Invocation Request from another client
  invokeReq:
    properties:
      <<: *baseCommand
      requester: { type: string }
      payload: { type: string }

  # Acknowledgement of subscription
  subscribeAck: *commandAck

  # Sent on events
  onEvent:
    properties:
      <<: *baseCommand
      event: { type: string }
      # String Encoded Data (Defined by device/emitter)
      data: { type: string }
```
