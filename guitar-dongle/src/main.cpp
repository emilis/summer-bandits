#include <Arduino.h>
#include <WiFi.h>
#include <map>
#include <unordered_map>
#include <esp_now.h>
#include "esp_wifi.h" 
#include "midi_common.h"

#define MIDI_RX_PIN 16

const unsigned long WIRELESS_TIMEOUT_MILLIS = 1500;                 //If we don't receive wireless (esp-now) ping from the device in 1.5s we note off currently on'ed notes.
const unsigned long WIRELESS_IGNORE_AFTER_LAST_SERIAL_WRITE = 3000; //We will ignore wireless (esp-now) messages if we received direct MIDI messages in last 3s

enum Protocol {
  MIDI,
  ESP_NOW,
};

typedef struct state {
  uint8_t value;
  Protocol protocol;
  unsigned long changedAt;
} state;

typedef struct channel_state {
  unsigned long lastWirelessPing;
  unsigned long lastMidiSerialWrite;
  std::unordered_map<uint8_t, state> states;
} channel_state;

unsigned long now = 0;

std::map<int, channel_state> channelStates = {
  {0, {0, 0, {}}},
  {1, {0, 0, {}}}
};

void saveState(int channel, Protocol protocol, uint8_t pitch, uint8_t velocity) {
  std::unordered_map<uint8_t, state>& states = channelStates[channel].states;
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
  auto lastSerialWrite = channelStates[channel].lastMidiSerialWrite;

  switch (receivedData->mode) {
    case PING:
      channelStates[channel].lastWirelessPing = now;
      break;
    case DATA:
      if (now - lastSerialWrite < WIRELESS_IGNORE_AFTER_LAST_SERIAL_WRITE) return;

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

void noteOffExpiredEspNowMessages(int channel, unsigned long& lastPing, std::unordered_map<uint8_t, state>& states) {
  if (now - lastPing < WIRELESS_TIMEOUT_MILLIS) return;
  for (const auto& entry : states) {
      uint8_t pitch = entry.first;
      const state& currentState = entry.second;
      if (currentState.protocol == Protocol::ESP_NOW && currentState.value > 0) {
          noteOff(channel, currentState.protocol, pitch);
      }
  }
}

void noteOffExpiredEspNowMessages() {
  for (auto& entry : channelStates) {
      int channel = entry.first;
      channel_state& currentState = entry.second;
      noteOffExpiredEspNowMessages(entry.first, currentState.lastWirelessPing, currentState.states);
  }
}

void setup() {
  Serial.begin(MIDI_SERIAL_RATE);
  Serial1.begin(MIDI_SERIAL_RATE, SERIAL_8N1, MIDI_RX_PIN, -1); 

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
    uint8_t data[MIDI_DATA_LEN];
    Serial1.readBytes(data, MIDI_DATA_LEN);
    Serial.write(data, MIDI_DATA_LEN);

    uint8_t channel = data[0] & 0x0F;
    uint8_t pitch = data[1];
    uint8_t velocity = data[2];

    channelStates[channel].lastMidiSerialWrite = now;    
    saveState(channel, Protocol::MIDI, pitch, velocity);
  }

  noteOffExpiredEspNowMessages();
}