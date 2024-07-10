#include <WiFi.h>
#include <map>
#include <unordered_map>
#include <esp_now.h>
#include "esp_wifi.h" 
#include "midi_common.h"

const unsigned long WIRELESS_TIMEOUT_MILLIS = 1500;                 //If we don't receive wireless (esp-now) ping from the device in 1.5s we note off currently on'ed notes.
const unsigned long WIRELESS_IGNORE_AFTER_LAST_SERIAL_WRITE = 3000; //We will ignore wireless (esp-now) messages if we received direct MIDI messages in last 3s

enum Protocol {
  MIDI_SERIAL,
  ESP_NOW,
};

typedef struct state {
  uint8_t value;
  Protocol protocol;
  Mode type;
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

void saveState(int channel, Protocol protocol, Mode type, uint8_t pitch, uint8_t velocity) {
  std::unordered_map<uint8_t, state>& states = channelStates[channel].states;
  states[pitch] = {velocity, protocol, type};
}

void noteOn(uint8_t channel, Protocol protocol, uint8_t pitch, uint8_t velocity) {
  serialNoteOn(channel, pitch, velocity);
  saveState(channel, protocol, Mode::NOTE, pitch, velocity);
}

void noteOff(uint8_t channel, Protocol protocol, uint8_t pitch) {
  serialNoteOff(channel, pitch);
  saveState(channel, protocol, Mode::NOTE, pitch, 0);
}

void pitchDown(uint8_t channel, Protocol protocol, int pitch) {
  serialPitchBend(channel, pitch);
  saveState(channel, protocol, Mode::PITCH, 0, pitch);
}

void processWirelessMidiMessage(controller_message *receivedData) {
  int channel = getChannel(receivedData->device);
  auto lastSerialWrite = channelStates[channel].lastMidiSerialWrite;

  switch (receivedData->mode) {
    case PING:
      channelStates[channel].lastWirelessPing = now;
      break;
    case NOTE:
      if (now - lastSerialWrite < WIRELESS_IGNORE_AFTER_LAST_SERIAL_WRITE) return;
      if (receivedData->velocity == 0) {
        noteOff(channel, Protocol::ESP_NOW, receivedData->pitch);
      } else {
        noteOn(channel, Protocol::ESP_NOW, receivedData->pitch, receivedData->velocity);
      }
      break;
    case PITCH:
      if (now - lastSerialWrite < WIRELESS_IGNORE_AFTER_LAST_SERIAL_WRITE) return;
      pitchDown(channel, Protocol::ESP_NOW, receivedData->pitch);
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
      if (currentState.protocol == Protocol::ESP_NOW && currentState.value != 0) {
          if (currentState.type == Mode::NOTE) {
              noteOff(channel, currentState.protocol, pitch);
          } else if (currentState.type == Mode::PITCH) {
              pitchDown(channel, currentState.protocol, 0);
          }
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
  MIDI.begin(MIDI_SERIAL_RATE);

  pinMode(BLUE_LED_PIN, OUTPUT);

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
  if (MIDI.available() >= MIDI_DATA_LEN) {
    uint8_t data[MIDI_DATA_LEN];
    MIDI.readBytes(data, MIDI_DATA_LEN);
    MIDI.write(data, MIDI_DATA_LEN);

    uint8_t channel = data[0] & 0x0F;
    uint8_t pitch = data[1];
    uint8_t velocity = data[2];

    channelStates[channel].lastMidiSerialWrite = now;
    //TODO: support serial pitch bend input
    saveState(channel, Protocol::MIDI_SERIAL, Mode::NOTE, pitch, velocity);
  }

  noteOffExpiredEspNowMessages();
}