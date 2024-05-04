# Event and Error Logs
The controller supports both event logs and Error Logs.  Errors are always logged to the event log, though not all events are errors.

## Event Log
The event log contains a list of events that occurred on the controller.  Events are stored in a linked list, and when the maximum number of links has been exceeded, the oldest event is purged to make room for the newer event that is being stored.

Events are stored in RAM and are lost after a reboot.

### Types of Events
There are three event types:
- Information
- Notification
- Error

#### Information Events
These are events which mark specific timestamps of activities occurring on the controller, such as services starting during boot.  If the OLED is off, the event is quietly logged and not displayed.  If the Event Log screen is active, the new event will be added to the [Event Log screen](/controller/support/OLED_screens/#event-log).

The majority of events written to the event log are Information events.

#### Notification Events
Notification events are important, but not urgent, events.  They represent significant changes occurring with the controller, such as an Ethernet disconnect or OTA firmware being started or completing.  Because of the importance of these events, if the OLED is off or dimmed, it will be powered on to full brightness and the Event Log will be shown to the user.  If the OLED is on but not displaying the Event Log screen, the Event Log will immediately be shown.  The OLED will be allowed to dim and turn off after the normal display time has elapsed.

#### Error Events
When a serious condition occurs that impacts the ability for the controller to be in a healthy state, an Error Event is created.  For example, if a peripheral is no longer accessible an error will occur.  Like a Notification Event, Error Events will interrupt and power on the OLED to full brightness, however the Error screen will be shown with the most recent errors.  The OLED will not sleep.  When paging through the OLED screens, the [Error screen](/controller/support/OLED_screens/#errors) will be added to the flow.

Additionally, if the hardware features a front panel LED button, the LED will be extinguished to show the controller is not in a healthy state.  Front panel LED button behavior is managed via the main application and is not managed through the Error Log/Event Log logic.

### Number of Events
The maximum number of events that will be kept in the log is configurable at compile time in `hardware.h` with variable `EVENT_LOG_MAXIMUM_ENTRIES`.  The default is 20 events.

### Retrieving Events
The full Event Log can be retrieved via API.  The API includes more information than what is available on the OLED screen and includes the timestamp of the event, the type of event, and the text displayed for the event.  Refer to the application's API Reference for integration requirements.

## Error Log
The Error Log is similar to the Event Log but only contains events that are marked as errors.  The Error Log is separate from the Event Log but the two logs work in concert with one another.  See the expected behaviors when an [error is logged](#error-events) to the Event Log.

Error Events have a lifecycle and can be cleared from the log if the error condition ceases to exist.  Additionally, only the text for the Error Event is maintained; the timestamp is not.  Refer to the Event Log for the timestamp of the event before the Event Log has purged the event.

### Number of Errors
The maximum number of errors that will be kept in the log is configurable at compile time and is common with the Event Log, using `hardware.h` with variable `EVENT_LOG_MAXIMUM_ENTRIES`.

### Behavior from Error Logging
When an event is entered into the Event Log with type `LOG_LEVEL_ERROR`, an error is automatically entered separately into the Error Log.

### Clearing an Error
An error can be cleared from the Error Log by calling `resolveError()` with the exact text of the error that should be cleared.