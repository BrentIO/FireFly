# Remote Factory Reset

Production Client units are wall-mounted with no physically accessible reset button — the `FACTORY_RESET_PIN` is only reachable by opening the unit. For units already online and receiving MQTT, a factory reset can instead be triggered remotely.

::: info Requires the unit to be online
This only works while the unit is still connected to WiFi and MQTT. It cannot recover a unit that has already lost connectivity entirely — that still requires physical access.
:::

## How It Works

Publish `do-factory-reset` to the device's MQTT factory reset command topic. If accepted, the client deletes its stored WiFi/MQTT configuration and CA certificate and reboots into unprovisioned/SoftAP-discovery mode — identical to holding the physical factory-reset pin at boot. See [Client Provisioning](/client/provisioning/) for what happens next.

## The 30-Second Boot Window

The command is only honored within 30 seconds of the device's boot. This ties the action to an actual power-cycle or reboot, rather than allowing a factory reset to be triggered on demand at any time by anyone with MQTT publish access — a deliberate extra gate on top of MQTT broker authentication, given how destructive this action is (loss of all provisioning state).

Outside that window, the command is silently ignored.

## Retained-Message Safety

The client publishes an empty, retained payload to its own factory reset topic before subscribing on every MQTT connect. This clears any stale retained message that might otherwise sit on the broker — without it, a single leftover retained publish would be redelivered to the client on every future reboot and, within the 30-second window, trigger another factory reset every time, with no recovery short of physical access.

This is handled automatically by the client. It's noted here so nobody scripting this command from the Controller or an automation platform assumes retained delivery is either necessary or safe to rely on for this topic.

## Reprovisioning After Reset

Triggering the factory reset only returns the unit to the same "waiting for discovery" state a physical factory reset leaves it in. For the unit to actually reprovision, the Controller's provisioning window must also be opened (see [Client Provisioning](/client/provisioning/)). No Controller-side configuration changes are required beforehand — a client's registration on the Controller is unaffected by this command, so it remains allowlisted the next time the provisioning window is opened.

## Full Specification

For the complete topic structure, payload schema, and field-level documentation see the [MQTT Reference](/client/software/client/mqtt_reference).
