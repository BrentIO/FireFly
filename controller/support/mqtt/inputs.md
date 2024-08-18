# Automating with Input Events using MQTT

Unlike with controller sensors and outputs, inputs (such as button presses) are not included in auto discovery.

However, because the input button press is broadcast over MQTT, the event can be read by other listeners, like Node Red.  This allows Node Red to perform multiple actions not known to the Controller when a button is pressed.  The controller will emit a message on an input port channel state change even if no output actions are defined.

For example, port 7 channel 2 is a normally open input button that is defiend in the controller's configuration file.  It has no output actions associated to the input channel.  When the button is pressed, the controller will raise an MQTT message to a pre-defined topic.  When the button is released, the controller will raise another MQTT message on the same topic.  Home Assistant (and optionally Node Red) can listen for the button press or release MQTT messages to perform multiple actions that are otherwise unknown to the controller, such as turning off all lights in the house, changing the HVAC temperature to a defined setting, and arming the alarm panel to night mode.

The input port and channel must be configured on the controller for the controller to emit an MQTT message about its state chagne.  If no input is configured in the controller's configuration, the state change will not raise an MQTT message.

## Input Events Topics and Payloads

<Badge type="warning" text="TODO" />Describe the topic and payload contents that are triggered for events.