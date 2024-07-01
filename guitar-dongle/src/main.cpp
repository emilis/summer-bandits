#include <Arduino.h>
#include <WiFi.h>
#include <unordered_map>
#include <esp_now.h>
#include "esp_wifi.h" 
#include "midi_common.h"

#define MIDI_UART_RX_PIN 16

const unsigned long WIRELESS_TIMEOUT_MILLIS = 1500;               //If wee don't receive wireless (esp-now) ping from the device in 1.5s we note off currently on'ed notes.
const unsigned long WIRELESS_IGNORE_AFTER_LAST_UART_WRITE = 3000; //We will ignore wireless (esp-now) messages if we received direct MIDI messages in last 3s

enum Protocol {
  UART,
  ESP_NOW,
};

typedef struct state {
  uint8_t value;
  Protocol protocol;
  unsigned long changedAt;
} state;

unsigned long now = 0;
unsigned long lastGuitarWirelessPing = 0;
unsigned long lastBassWirelessPing = 0;
unsigned long lastGuitarUartWrite = 0;
unsigned long lastBassUartWrite = 0;
std::unordered_map<uint8_t, state> guitarStates;
std::unordered_map<uint8_t, state> bassStates;

void saveState(int channel, Protocol protocol, uint8_t pitch, uint8_t velocity) {
  std::unordered_map<uint8_t, state>& states = (channel == 1) ? bassStates : guitarStates;
  states[pitch] = {velocity, protocol, now};
}

void noteOn(uint8_t channel, Protocol protocol, uint8_t pitch, uint8_t velocity) {
  serialNoteOn(channel, pitch, velocity);
  saveState(channel, protocol, pitch, velocity);
}

void noteOff(uint8_t channel, Protocol protocol, uint8_t pitch) {
  serialNoteOff(channel, pitch);
  saveState(channel, protocol, pitch, 0);
}

void processWirelessMidiMessage(controller_message *receivedData) {
  int channel = getChannel(receivedData->device);
  auto lastUartWrite = (channel == 1) ? lastBassUartWrite : lastGuitarUartWrite;

  switch (receivedData->mode) {
    case PING:
      if (receivedData->device == DeviceType::GUITAR) {
        lastGuitarWirelessPing = now;
      } else if (receivedData->device == DeviceType::BASS) {
        lastBassWirelessPing = now;
      }
      break;
    case DATA:
      if (now - lastUartWrite < WIRELESS_IGNORE_AFTER_LAST_UART_WRITE) return;

      if (receivedData->velocity == 0) {
        noteOff(channel, Protocol::ESP_NOW, receivedData->pitch);
      } else {
        noteOn(channel, Protocol::ESP_NOW, receivedData->pitch, receivedData->velocity);
      }
      break;
    default:
      break;
      Serial.println("Mode: UNKNOWN");
  }
}

void OnDataReceived(const uint8_t * mac, const uint8_t *espNowData, int len) {
  controller_message *receivedData = (controller_message *)espNowData;
  processWirelessMidiMessage(receivedData);
}

void noteOffExpiredEspNowMessages(DeviceType device, unsigned long& lastPing, std::unordered_map<uint8_t, state>& states) {
  if (now - lastPing < WIRELESS_TIMEOUT_MILLIS) return;
  for (const auto& entry : states) {
      uint8_t pitch = entry.first;
      const state& currentState = entry.second;
      if (currentState.protocol == Protocol::ESP_NOW && currentState.value > 0) {
          Serial.println(" Expired: " + String(pitch));
          noteOff(getChannel(device), currentState.protocol, pitch);
      }
  }
}

void noteOffExpiredEspNowMessages() {
  noteOffExpiredEspNowMessages(DeviceType::GUITAR, lastGuitarWirelessPing, guitarStates);
  noteOffExpiredEspNowMessages(DeviceType::BASS, lastBassWirelessPing, bassStates);
}

void setup() {
  Serial.begin(MIDI_SERIAL_RATE);
  Serial1.begin(MIDI_SERIAL_RATE, SERIAL_8N1, MIDI_UART_RX_PIN, -1); 

  WiFi.mode(WIFI_STA);
  esp_wifi_set_channel(WIFI_CHANNEL, WIFI_SECOND_CHAN_NONE);

  esp_wifi_start();
  if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }
  esp_now_register_recv_cb(OnDataReceived);
  
  Serial.println("Receiver booted up.");
}

void loop() {
  now = millis();
  if (Serial1.available() >= MIDI_DATA_LEN) {
    uint8_t data[3];
    Serial1.readBytes(data, 3);
    Serial.write(data, 3);

    uint8_t channel = data[0] & 0x0F;
    uint8_t pitch = data[1];
    uint8_t velocity = data[2];

    if (channel == 1) {
      lastBassUartWrite = now;
    } else {
      lastGuitarUartWrite = now;
    }
     
    saveState(channel, Protocol::UART, pitch, velocity);
  }

  noteOffExpiredEspNowMessages();
}