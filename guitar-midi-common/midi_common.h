#define WIFI_CHANNEL 5
#define MIDI_DATA_LEN 3
#define MIDI_SERIAL_RATE 31250
#define BLUE_LED_PIN 2
#define WHAMMY_BAR_IS_MOD true

#ifndef MIDI_COMMON_H
#define MIDI_COMMON_H

extern HardwareSerial MIDI;

enum DeviceType {
  GUITAR,
  BASS,
};

enum Mode {
  PING,
  NOTE,
  PITCH,
};

struct ControllerMessage {
  DeviceType device;
  Mode mode;
  int pitch;
  int velocity;
};

#ifdef DEBUG
  #define DEBUG_PRINT(message) Serial.println(message)
#else
  #define DEBUG_PRINT(message)
#endif

int getChannel(DeviceType device);
void serialNoteOn(int channel, uint8_t pitch, uint8_t velocity);
void serialNoteOff(int channel, uint8_t pitch);
void serialPitchBend(int channel, int bendValue);
void serialMod(int channel, uint8_t modValue);

#endif
