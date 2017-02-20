# homebridge-sensehat

A Homebridge plugin for a Sense HAT equipped Raspberry Pi

The real work is performed by two small Python programs: leds.py is used for controlling the Sense HAT's LEDs and sensors.py for reading the temperature, humidity and air pressure sensors.

## Installation
1.	Install Homebridge using `npm install -g homebridge`.
2.	Install this plugin `npm install -g homebridge-sensehat`.
3.	Update your configuration file. See below for an example.

## Notes
1. The paths to the two python scripts are currently hardcoded.
2. The user under which homebridge runs (often homebridge) needs to be able to use the Sense HAT API, the easiest way to do this is to make the user a member of the groups video, i2c (and others).

## Configuration

Example configuration:

```json
  "accessories": [
    {
      "accessory": "SenseHat",
      "name": "Sense Hat"
    }
  ]
```

## See also

## License

MIT
