
#include <Arduino.h>
#include <WiFi.h>
#include <esp_now.h>
#include "esp_wifi.h" 
#include "midi_common.h"

//controller_message espNowData;


controller_message serial_data_1;
controller_message serial_data_2;

void noteOn(uint8_t channel, uint8_t pitch, uint8_t velocity) {
  uint8_t data[3] = {static_cast<uint8_t>(0x90 | channel), pitch, velocity};
//  Serial.write(data, 3);
}

void noteOff(uint8_t channel, uint8_t pitch) {
  uint8_t data[3] = {static_cast<uint8_t>(0x80 | channel), pitch, 0};
 // Serial.write(data, 3);
}

int getChannel(DeviceType device) {
  switch (device) {
    case BASS:
      return 1;
    default:
      return 0;
  }
}

void processMidiMessage(controller_message *receivedData) {
  int channel = getChannel(receivedData->device);
  switch (receivedData->mode) {
    case PING:
   //   Serial.println("PING");
      break;
    case DATA:
    //  Serial.println("did note on");
      noteOn(channel, receivedData->pitch, receivedData->velocity);
      break;
    default:
      break;
   //   Serial.println("Mode: UNKNOWN");
  }
}

void OnDataReceived(const uint8_t * mac, const uint8_t *espNowData, int len) {
  controller_message *receivedData = (controller_message *)espNowData;
  processMidiMessage(receivedData);
}

void setup() {
  Serial.begin(31250);
  Serial1.begin(115200, SERIAL_8N1, 16, 17);  // RX, TX pins for the first transmitter
  Serial2.begin(115200, SERIAL_8N1, 18, 19);  // RX, TX pins for the second transmitter

  WiFi.mode(WIFI_STA);
  esp_wifi_set_channel(WIFI_CHANNEL, WIFI_SECOND_CHAN_NONE);

  esp_wifi_start();
  if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }
  esp_now_register_recv_cb(OnDataReceived);
  
  Serial.println("Dongle booted up.");
}

void loop() {
  if (Serial1.available() >= sizeof(serial_data_1)) {
    Serial1.readBytes((char*)&serial_data_1, sizeof(serial_data_1));
    processMidiMessage(&serial_data_1);
  }

  if (Serial2.available() >= sizeof(serial_data_2)) {
    Serial2.readBytes((char*)&serial_data_2, sizeof(serial_data_2));
    processMidiMessage(&serial_data_2);
  }

}