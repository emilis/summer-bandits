#include <Arduino.h>
#include <WiFi.h>
#include <esp_now.h>
#include "esp_wifi.h" 
#include "midi_common.h"

//controller_message espNowData;

void OnDataReceived(const uint8_t * mac, const uint8_t *espNowData, int len) {
  controller_message *receivedData = (controller_message *)espNowData;

  switch (receivedData->device) {
    case GUITAR:
      Serial.print("GUITAR: Bytes received: ");
      break;
    case BASS:
      Serial.print("BASS: Bytes received: ");
      break;
    default:
      Serial.println("Device Type: UNKNOWN");
  }
}

void setup() {
  Serial.begin(9600);

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

}