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

typedef struct controller_message {
  DeviceType device;
  Mode mode;
  int pitch;
  int velocity;
} controller_message;

int getChannel(DeviceType device);
void serialNoteOn(int channel, uint8_t pitch, uint8_t velocity);
void serialNoteOff(int channel, uint8_t pitch);
void serialPitchBend(int channel, int bendValue);
void serialMod(int channel, uint8_t modValue);

#endif
