#include <Arduino.h>
//#include <ArduinoBLE.h>

#define PARAM_SIZE 7
// #define LED_PIN 2 
// #define SERVICE_GUID "ef2f139c-686c-4580-a250-58ca64466fd6"
// #define SERVICE_CHARACTERISTICS_GUID "cdceab82-634e-4c4b-992a-e7ae1c97aac8"

// void blePeripheralConnectHandler(BLEDevice central);
// void blePeripheralDisconnectHandler(BLEDevice central);
// void switchCharacteristicWritten(BLEDevice central, BLECharacteristic characteristic);
// void blink(int ms, short times);

// BLEService midiService(SERVICE_GUID); 
// BLECharacteristic pinCharacteristic(SERVICE_CHARACTERISTICS_GUID, BLERead | BLEWrite, PARAM_SIZE);

uint8_t pinStates[PARAM_SIZE];

void setup() {
  Serial.begin(9600);
  Serial0.begin(9600);

  // // begin initialization
  // if (!BLE.begin()) {
  //   Serial.println("starting BLE failed!");
  //   while (1);
  // }

  // // set the local name peripheral advertises
  // BLE.setLocalName(DEVICE_NAME);
  // // set the UUID for the service this peripheral advertises
  // BLE.setAdvertisedService(midiService);

  // // add the characteristic to the service
  // midiService.addCharacteristic(pinCharacteristic);

  // // add service
  // BLE.addService(midiService);

  // // event handlers for characteristic
  // BLE.setEventHandler(BLEConnected, blePeripheralConnectHandler);
  // BLE.setEventHandler(BLEDisconnected, blePeripheralDisconnectHandler);

  // // assign event handlers for characteristic
  // pinCharacteristic.setEventHandler(BLEWritten, switchCharacteristicWritten);

  // // start advertising
  // BLE.advertise();

  // Serial.println(("Bluetooth® device active, waiting for connections..."));

  // // Initialize the LED pin as an output
  // pinMode(LED_PIN, OUTPUT);
}

void loop() {
  //BLE.poll();

  delay(500);
  Serial.println("srl: ");
  Serial.print(Serial.available());
  if (Serial0.available() >= PARAM_SIZE) {  
    Serial.print(Serial0.available());
    Serial.readBytes(pinStates, PARAM_SIZE);

    Serial.println("Size: ");
    Serial.println(sizeof(pinStates));
  }
}

// void blePeripheralConnectHandler(BLEDevice central) {
//   Serial.print("Connected client: ");
//   Serial.println(central.address());
//   blink(50, 10);
// }

// void blePeripheralDisconnectHandler(BLEDevice central) {
//   Serial.print("Disconnected client: ");
//   Serial.println(central.address());
//   blink(50, 10);
// }

// void switchCharacteristicWritten(BLEDevice central, BLECharacteristic characteristic) {
//   if (characteristic == pinCharacteristic) {
//       const uint8_t* value = characteristic.value();
      
//       Serial.print("Received pin states: ");
//       for (int i = 0; i < characteristic.valueLength(); i++) {
//           Serial.print(value[i]);
//           Serial.print(" ");
//       }
//       Serial.println();
//       blink(3, 1);
//   }
// }

// void blink(int ms, short times) {
//   for(int i = 0; i < times; i++) {
//     digitalWrite(LED_PIN, HIGH);
//     delay(ms);
//     digitalWrite(LED_PIN, LOW);
//     delay(ms);
//   }
// }