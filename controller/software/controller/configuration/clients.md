# Clients

Clients are devices with human interfaces attached, such as buttons or switches.

An ID can be set for the client, as well as a short description and [area](./areas.md).  A MAC address must also be assigned, though one can be generated on a temporary basis until the actual MAC address is known.  When a MAC address has been generated, `ff:ff:ff:ff:ff:ff` will be used and will be highlighted on the configuration page.

[![Client](./clients.png)](./clients.png)


## Extended Clients

Each client can support up to four buttons or switches.  When more than four inputs are required at a single location, two client entries can be joined together to support a total of six buttons or switches.

### Physical Wiring Constraints

A Cat6 cable carries four usable signal channels along with power (+9 VDC) and ground wires.  This means a single RJ-45 run from a Controller port to a client device can support at most four human interface devices (HIDs).

Client hardware includes two RJ-45 jacks — one for the primary connection (channels 1–4) and one for the secondary, or extended, connection (channels 5–6).  When the second jack is wired to a separate Controller port, the client can accommodate up to six HIDs in total.

### Primary and Secondary Client Records

When more than four HIDs are needed at a single location, two client records are used together:

- **Primary client** — carries logical channels 1–4 over its Cat6 cable.
- **Secondary (extended) client** — carries logical channels 5–6 over a second Cat6 cable.

The secondary client must have its own port assignment on a Controller, because it uses a physically separate RJ-45 connection.  Both ports must be assigned to the **same Controller** — the configuration UI enforces this rule and will not allow the primary and secondary ports to be assigned to different Controllers.

Where possible, the primary client should be assigned to an odd-numbered port and the secondary to an adjacent even-numbered port.  This ensures both connections share the same power rail.

[![Extended Client Wiring Diagram](./images/extended-client-wiring.svg)](./images/extended-client-wiring.svg)

### Channel Mapping

Physical channels on the Cat6 cables map to logical channels as follows:

| Client | Cat6 Cable | Physical Channel | Logical Channel |
| ------ | ---------- | ---------------- | --------------- |
| Primary | Cable A (RJ-45 Jack A) | 1 | 1 |
| Primary | Cable A (RJ-45 Jack A) | 2 | 2 |
| Primary | Cable A (RJ-45 Jack A) | 3 | 3 |
| Primary | Cable A (RJ-45 Jack A) | 4 | 4 |
| Secondary | Cable B (RJ-45 Jack B) | 1 | 5 |
| Secondary | Cable B (RJ-45 Jack B) | 2 | 6 |

Physical channels 3 and 4 on Cable B (pins 3 and 6) are unused in the secondary connection.

### Secondary Client Behavior in the UI

The secondary client record shares the display name of the primary client.  The area, UUID, MAC address, and delete controls for the secondary client are all managed through the primary client record — those fields on the secondary record are read-only.  When viewing the secondary client, a notification is shown indicating that these attributes are governed by the primary.

## Button and Switch Assignments

A client which has not been extended can have up to four buttons or switches.  If a client has been extended, it may have up to six buttons or switches.

When clicking `Add`, select the type of interface desired.  Most buttons are `Normally Open`.  Switches can be either Normally Open or Normally Closed, depending on the switch type.  You cannot change a button to a switch or a switch to a button.  If you add one by mistake, you will need to delete it and re-add it.

A button or switch can have multiple actions, though it is a good rule of thumb not to have more than two actions for each change.  For example, you may want to have a button that toggles the patio lights and the front street light (two separate circuits).  If the user does a long press, it may also toggle the sconces.

Each button or switch can also be assigned one or more [tags](./tags.md).  In the example below, the red button has been assigned the `Security` tag.  In the example below, no other buttons have a tag assigned to them.

If a button or switch is marked as `Enabled: No`, the input will not be monitored by the Controller and it will do absolutely nothing.

You can move button and switches up and down to arrange them as desired.  When you have exactly 5 buttons, you can also choose to invert the faceplate so that you have the odd button at the top or at the bottom.

If you hover over the button or switch, you will see a list of actions that will be performed when a change is observed.  This is helpful to think through your user experience.

[![Client Buttons](./clients-buttons.png)](./clients-buttons.png)

### Short Press versus Long Press Actions

When both a long press and a short press action is defined, the short press action **will always be triggered before the long press**.  A great use for long press events are with dimmable lights.  A short press event may increase the brightness by one step (appoximately 10%).  A long press could increase the brightness to 100%.  If the light was off and the user presses and holds the button only once, the light will go from 0% to 10% briefly, then to 100%.