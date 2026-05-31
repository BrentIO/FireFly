# Telnet Debug Log

When Controller firmware is built with `CORE_DEBUG_LEVEL` set to `1` or higher, the Controller runs a telnet server on **port 23** that streams all ESP32 log output to connected clients. The output is identical to what appears on the serial UART — no additional instrumentation is required. This gives developers remote access to live debug output without a USB serial cable.

The server starts automatically after Ethernet connects during startup. If Ethernet is not connected, the server never starts. When `CORE_DEBUG_LEVEL` is `0` (production builds), the feature is excluded entirely from the firmware — there is no runtime overhead and port 23 is never opened.

## Connecting

```bash
telnet <device-ip>
```

Or, if `telnet` is not available:

```bash
nc <device-ip> 23
```

Upon connecting, a welcome banner is displayed followed by the live log stream. Up to **three** simultaneous clients may be connected. A fourth connection attempt is silently rejected until a slot becomes available.

## Log levels

What you see depends on the `CORE_DEBUG_LEVEL` value used at compile time:

| `CORE_DEBUG_LEVEL` | Output visible on telnet |
| ------------------ | ------------------------ |
| `1` | Errors only |
| `2` | Errors + warnings |
| `3` | Errors + warnings + info |
| `4` | Errors + warnings + info + debug |
| `5` | All output (verbose) |

See [Compile Flags](/controller/development_environment/#compile-flags) for how to set `CORE_DEBUG_LEVEL`.

## Behavior notes

- **UART is preserved.** The serial monitor and telnet clients receive the same output simultaneously.
- **Disconnecting a client is safe.** The Controller detects the disconnected client and frees the slot on the next loop iteration without stalling.
- **Production builds are unaffected.** All telnet log code is excluded at compile time when `CORE_DEBUG_LEVEL=0`.
