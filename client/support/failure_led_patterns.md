# LED Flash Patterns

When no other output is available (no OLED, no serial connection), the FireFly Client communicates device state through LED flash patterns. These patterns serve the same role as POST beep codes — the LEDs are the only diagnostic output on a wall-mounted device.

Many patterns occur before WiFi or MQTT are active, so no remote diagnostic is possible.

## Timing Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `UNPROV_ROTATE_INTERVAL_MS` | 200 ms | Time each LED stays on during the rotating chase |
| `FLASH_ERROR_SHORT_MS` | 500 ms | On-time for a short burst in an error flash code |
| `FLASH_ERROR_LONG_MS` | 1000 ms | On-time for a long burst in an error flash code |
| `FLASH_ERROR_GAP_MS` | 250 ms | Off gap between individual bursts within a group |
| `FLASH_ERROR_PAUSE_MS` | 1000 ms | Off pause between the short-burst group and the long-burst group |

## Patterns

| Code | Pattern | Full Cycle | Meaning | Resolution |
|------|---------|------------|---------|------------|
| — | All LEDs off | Steady | **WiFi or MQTT unavailable** — connection lost after provisioning | Check network connectivity and MQTT broker |
| — | Rotating chase — one LED at a time, 1→6→1 | 200 ms per LED | **Unprovisioned** — valid identity in EEPROM, no WiFi/MQTT config yet | Provision via Controller |
| 1 | SSS·L | ON 500 · OFF 250 · ON 500 · OFF 250 · ON 500 · OFF 1000 · ON 1000 · OFF 1000 · repeat | **Unregistered / hardware mismatch** — no identity written to EEPROM, or firmware built for a different product | Run HW-Reg app to write device identity; or flash correct firmware |
| 2 | SSS·LL | ON 500 · OFF 250 · ON 500 · OFF 250 · ON 500 · OFF 1000 · ON 1000 · OFF 250 · ON 1000 · OFF 1000 · repeat | Reserved | TBD |

## Notes

- The rotating chase (unprovisioned) uses all LEDs in sequence and is produced by `rotateLeds()`. It is non-blocking — normal boot continues in parallel.
- All error-code patterns (codes 1 and above) flash **all LEDs simultaneously** and are produced by `haltWithFlashCode(shortBursts, longBursts)`. This function never returns; only a power cycle can exit the state.
- When an error code is active, no WiFi, MQTT, or OTA is available — LEDs are the only diagnostic output.
