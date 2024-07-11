#include <WiFi.h>
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

struct State {
  uint8_t value;
  Protocol protocol;
  Mode type;
};

struct ChannelState {
  unsigned long lastWirelessPing;
  unsigned long lastMidiSerialWrite;
  std::unordered_map<uint8_t, State> states;
};

unsigned long now = 0;

ChannelState channelStates[2] = {};

void saveState(int channel, Protocol protocol, Mode type, uint8_t pitch, uint8_t velocity) {
  auto& states = channelStates[channel].states;
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

void pitchBend(uint8_t channel, Protocol protocol, int pitch) {
  if (WHAMMY_BAR_IS_MOD) {
    serialMod(channel, pitch);
  } else {
    serialPitchBend(channel, pitch);
  }  
  saveState(channel, protocol, Mode::PITCH, 0, pitch);
}

void processWirelessMidiMessage(ControllerMessage *receivedData) {
  int channel = getChannel(receivedData->device);
  auto& channelState = channelStates[channel];
  auto lastSerialWrite = channelState.lastMidiSerialWrite;

  if (now - lastSerialWrite < WIRELESS_IGNORE_AFTER_LAST_SERIAL_WRITE) return;

  if (receivedData->mode == PING) {
    channelState.lastWirelessPing = now;
    return;
  }

  switch (receivedData->mode) {
    case NOTE:
      if (receivedData->velocity == 0) {
        noteOff(channel, Protocol::ESP_NOW, receivedData->pitch);
      } else {
        noteOn(channel, Protocol::ESP_NOW, receivedData->pitch, receivedData->velocity);
      }
      break;
    case PITCH:
      pitchBend(channel, Protocol::ESP_NOW, receivedData->pitch);
      break;
    default:
      DEBUG_PRINT("Mode: UNKNOWN");
  }
}

void OnDataReceived(const uint8_t * mac, const uint8_t *espNowData, int len) {
  processWirelessMidiMessage((ControllerMessage *)espNowData);
}

void noteOffExpiredEspNowMessages(int channel, ChannelState& channelState) {
  if (now - channelState.lastWirelessPing < WIRELESS_TIMEOUT_MILLIS) return;

  auto& states = channelState.states;
  for (auto& entry : states) {
    auto& currentState = entry.second;
    if (currentState.protocol == Protocol::ESP_NOW && currentState.value != 0) {
      if (currentState.type == Mode::NOTE) {
        noteOff(channel, currentState.protocol, entry.first);
      } else if (currentState.type == Mode::PITCH) {
        int offValue = (WHAMMY_BAR_IS_MOD) ? 0 : 8192;
        pitchBend(channel, currentState.protocol, offValue);
      }
    }
  }
}

void noteOffExpiredEspNowMessages() {
  for (int channel = 0; channel < 2; ++channel) {
    noteOffExpiredEspNowMessages(channel, channelStates[channel]);
  }
}

void setup() {
  MIDI.begin(MIDI_SERIAL_RATE);

  pinMode(BLUE_LED_PIN, OUTPUT);

  WiFi.mode(WIFI_STA);
  esp_wifi_set_channel(WIFI_CHANNEL, WIFI_SECOND_CHAN_NONE);
  esp_wifi_start();

  if (esp_now_init() != ESP_OK) {
    DEBUG_PRINT("Error initializing ESP-NOW");
    return;
  }
  esp_now_register_recv_cb(OnDataReceived);
  
  DEBUG_PRINT("Receiver booted up.");
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