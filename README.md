# homebridge-sensehat

A Homebridge plugin for a Sense HAT equipped Raspberry Pi

The real work is performed by two small Python programs: leds.py is used for controlling the Sense HAT's LEDs and sensors.py for reading the temperature, humidity and air pressure sensors.

## Installation
1.	Install Homebridge using `npm install -g homebridge` (note - note yet published to npm)
2.	Install this plugin `npm install -g homebridge-sensehat`
3.	Update your configuration file. See below for an example

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

