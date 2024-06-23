# Performance Testing
Performance benchmarks for various API's have been measured below.

## Controller

| Firmware Version | Verb | Path | Response Time (ms) | Notes |
|----------------- | ---- | ---- | ------------- | ----- |
| 2024.6.1 | GET | /api/controllers | 535 | 20 UUIDs. Each UUID costs approximately 20ms, minimum 45ms |
| 2024.6.1 | DELETE | /api/controllers/{uuid} | 110 |  |
| 2024.6.1 | PUT | /api/colors| 39| 6 colors, new file |
| 2024.6.1 | GET | /api/colors| 68| 6 colors |
| 2024.6.1 | GET | /api/colors| 29| Returning 404 |
| 2024.6.1 | DELETE | /api/colors| 62|  |
| 2024.6.1 | DELETE | /api/colors| 33| Returning 404 |