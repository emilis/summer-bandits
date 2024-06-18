#include <Arduino.h>
#include <ArduinoBLE.h>

#ifdef ARDUINO_AVR_MICRO
    // Definitions for ATmega (Arduino Micro)
    #define PIN_GREEN 6
    #define PIN_RED 10
    #define PIN_YELLOW 8
    #define PIN_BLUE 11
    #define PIN_ORANGE 12
    #define PIN_UP 19
    #define PIN_DOWN 20
    #define PIN_SELECTOR 39
#else
    // Dummy definitions for ESP32 - so it would build and run.
    #define PIN_GREEN 12
    #define PIN_RED 13
    #define PIN_YELLOW 14
    #define PIN_BLUE 15
    #define PIN_ORANGE 16
    #define PIN_UP 17
    #define PIN_DOWN 18
    #define PIN_SELECTOR 19
#endif


#define SERVICE_GUID "ef2f139c-686c-4580-a250-58ca64466fd6"
#define SERVICE_CHARACTERISTICS_GUID "cdceab82-634e-4c4b-992a-e7ae1c97aac8"
#define PARAM_SIZE 7
#define LED_PIN 2

void blePeripheralConnectHandler(BLEDevice central);
void blePeripheralDisconnectHandler(BLEDevice central);
void getPinStates(uint8_t* pinStates);
void blink(int ms, short times);

BLEDevice peripheral;
BLECharacteristic pinCharacteristic;
bool deviceConnected = false;
bool changesSent = true;
uint8_t currentPinStates[PARAM_SIZE] = {0};
uint8_t previousPinStates[PARAM_SIZE] = {0};

void setup() {
    Serial.begin(9600);
    while (!Serial);

    pinMode(PIN_GREEN, INPUT_PULLUP);
    pinMode(PIN_RED, INPUT_PULLUP);
    pinMode(PIN_YELLOW, INPUT_PULLUP);
    pinMode(PIN_BLUE, INPUT_PULLUP);
    pinMode(PIN_ORANGE, INPUT_PULLUP);
    pinMode(PIN_UP, INPUT_PULLUP);
    pinMode(PIN_DOWN, INPUT_PULLUP);
    pinMode(PIN_SELECTOR, INPUT);

    // Initialize BLE
    if (!BLE.begin()) {
        Serial.println("starting BLE failed!");
        while (1);
    }
    BLE.scanForName(RECEIVER_DEVICE_NAME);
    pinMode(LED_PIN, OUTPUT);
}

void loop() {
    getPinStates(currentPinStates);

    for (int i = 0; i < PARAM_SIZE; i++) {
        if (currentPinStates[i] != previousPinStates[i]) {
            changesSent = false;
            previousPinStates[i] = currentPinStates[i];
        }
    }

     //   if (changesSent) return;

    if (!deviceConnected) {
        // Check if we found a peripheral
        BLEDevice discoveredPeripheral = BLE.available();
        
        if (discoveredPeripheral && discoveredPeripheral.localName() == RECEIVER_DEVICE_NAME) {
            // Stop scanning
            BLE.stopScan();
            
            // Attempt to connect
            Serial.print("Connecting to ");
            Serial.println(discoveredPeripheral.localName());
            if (discoveredPeripheral.connect()) {
                Serial.println("Connected!");
                deviceConnected = true;
                peripheral = discoveredPeripheral;

                // Discover service and characteristic
                if (peripheral.discoverService(SERVICE_GUID)) {
                    pinCharacteristic = peripheral.characteristic(SERVICE_CHARACTERISTICS_GUID);
                } else {
                    Serial.println("Service not found");
                }
            } else {
                Serial.println("Failed to connect");
                BLE.scanForName(RECEIVER_DEVICE_NAME); // Restart scanning
            }
        }
    } else {
        // Check if still connected
        if (!peripheral.connected()) {
            Serial.println("Disconnected, attempting to reconnect...");
            deviceConnected = false;
            BLE.scanForName(RECEIVER_DEVICE_NAME); // Restart scanning
        } else if (pinCharacteristic) {
          //  pinCharacteristic.writeValue(currentPinStates, 7);
        //    delay(5);
        }
    }

    Serial.write(currentPinStates, sizeof(currentPinStates));
    blink(1000, 1);
    //changesSent = true;
}

void getPinStates(uint8_t* pinStates) {
    pinStates[0] = digitalRead(PIN_GREEN);
    pinStates[1] = digitalRead(PIN_RED);
    pinStates[2] = digitalRead(PIN_YELLOW);
    pinStates[3] = digitalRead(PIN_BLUE);
    pinStates[4] = digitalRead(PIN_ORANGE);
    pinStates[5] = digitalRead(PIN_UP);
    pinStates[6] = digitalRead(PIN_DOWN);
}

void blink(int ms, short times) {
  for(int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(ms);
    digitalWrite(LED_PIN, LOW);
    delay(ms);
  }
}