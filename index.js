'use strict';

const exec = require('child_process').exec;

let Service, Characteristic;
let temperature, humidity, pressure;
let CommunityTypes;
let hue, saturation, brightness, power;
let script_path, led_interval, sensors_interval

module.exports = (homebridge) => {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    CommunityTypes = require('hap-nodejs-community-types')(homebridge);
    homebridge.registerAccessory('homebridge-sensehat', 'SenseHat', SenseHatPlugin);
};

class SenseHatPlugin {
    constructor(log, config) {
        this.log = log;
        this.name = config.name;
        this.name_temperature = config.name_temperature || this.name;
        this.name_humidity = config.name_humidity || this.name;
        this.name_presure = config.name_pressure || this.name;
        script_path = config.script_path || "/home/pi/homebridge-sensehat/";
        led_interval = config.led_interval || 2;
        sensors_interval = config.sensors_interval || 10;

        // seconds to milliseconds
        led_interval = led_interval * 1000;
        sensors_interval = sensors_interval * 1000;

        hue = brightness = saturation = 0;
        power = 0;
        this.setLeds();

        this.ledsService = new Service.Lightbulb(this.name);

        this.ledsService
            .getCharacteristic(Characteristic.On)
            .on('get', this.getPowerState.bind(this))
            .on('set', this.setPowerState.bind(this));

        this.ledsService
            .addCharacteristic(new Characteristic.Brightness())
            .on('get', this.getBrightness.bind(this))
            .on('set', this.setBrightness.bind(this));

        this.ledsService
            .addCharacteristic(new Characteristic.Hue())
            .on('get', this.getHue.bind(this))
            .on('set', this.setHue.bind(this));

        this.ledsService
            .addCharacteristic(new Characteristic.Saturation())
            .on('get', this.getSaturation.bind(this))
            .on('set', this.setSaturation.bind(this));

        this.temperatureService = new Service.TemperatureSensor(this.name_temperature);
        this.temperatureService
            .getCharacteristic(Characteristic.CurrentTemperature)
            .on('get', this.getCurrentTemperature.bind(this));

        // adding air pressure characteristic to temperature service, this enables the eve app to
        // display the air pressure.
        this.temperatureService.addCharacteristic(CommunityTypes.AtmosphericPressureLevel);
        this.temperatureService.getCharacteristic(CommunityTypes.AtmosphericPressureLevel)
            .on('get', this.getCurrentPressure.bind(this));

        this.humidityService = new Service.HumiditySensor(this.name_humidity);
        this.humidityService
            .getCharacteristic(Characteristic.CurrentRelativeHumidity)
            .on('get', this.getCurrentRelativeHumidity.bind(this));

        // air pressure also published as a separate service, though displaying it
        // is not currently supported by any known app.
        this.pressureService = new CommunityTypes.AtmosphericPressureSensor(this.name_pressure);
        this.pressureService
            .getCharacteristic(CommunityTypes.AtmosphericPressureLevel)
            .on('get', this.getCurrentPressure.bind(this));

        this.readSensors();

        setInterval(this.readSensors, sensors_interval);
        setInterval(this.setLeds, led_interval);
    }

    readSensors() {
        var cmdLine = "python " + script_path + "sensors.py";
        exec(cmdLine, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            var values = `${stdout}`.split(" ");

            temperature = parseFloat(values[0]);
            humidity = parseFloat(values[1]);
            pressure = parseFloat(values[2]);
            console.log(temperature, humidity, pressure);
        });
    }

    setLeds() {
        console.log(hue, saturation, brightness, power);
        var cmdLine = "python " + script_path + "leds.py " +
            hue + " " + saturation + " " + brightness + " " + power;
        exec(cmdLine, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
        });
    }

    setPowerState(state, cb) {
        power = state ? 1 : 0;
        cb(null, power);
    }

    getPowerState(cb) {
        cb(null, power);
    }

    setHue(level, cb) {
        hue = level;
        cb(null, hue);
    }

    setSaturation(level, cb) {
        saturation = level;
        cb(null, saturation);
    }

    setBrightness(level, cb) {
        brightness = level;
        cb(null, brightness);
    }

    getHue(cb) {
        cb(null, hue);
    }

    getSaturation(cb) {
        cb(null, saturation);
    }

    getBrightness(cb) {
        cb(null, brightness);
    }

    getCurrentTemperature(cb) {
        cb(null, temperature);
    }

    getCurrentRelativeHumidity(cb) {
        cb(null, humidity);
    }

    getCurrentPressure(cb) {
        cb(null, pressure);
    }

    getServices() {
        return [this.temperatureService, this.humidityService,
            this.pressureService, this.ledsService
        ]
    }
}
