#include <Arduino.h>
#include "midi_common.h"

HardwareSerial MIDI(1);

int getChannel(DeviceType device) {
  switch (device) {
    case BASS:
      return 1;
    default:
      return 0;
  }
}

void serialNoteOn(int channel, uint8_t pitch, uint8_t velocity) {
  uint8_t data[MIDI_DATA_LEN] = {static_cast<uint8_t>(0x90 | channel), pitch, velocity};
  MIDI.write(data, MIDI_DATA_LEN);
  //TODO: use a separate LED pin
  #if USE_BLUE_LED == true
  digitalWrite(BLUE_LED_PIN, HIGH);
  #endif
}

void serialNoteOff(int channel, uint8_t pitch) {
  uint8_t data[MIDI_DATA_LEN] = {static_cast<uint8_t>(0x80 | channel), pitch, 0};
  MIDI.write(data, MIDI_DATA_LEN);
  //TODO: use a separate LED pin
  #if USE_BLUE_LED == true
  digitalWrite(BLUE_LED_PIN, LOW);
  #endif
}

void serialPitchBend(int channel, int bendValue) {
  uint8_t lsb = bendValue & 0x7F;
  uint8_t msb = (bendValue >> 7) & 0x7F;
  uint8_t data[MIDI_DATA_LEN] = {
    static_cast<uint8_t>(0xE0 | channel),
    lsb,
    msb
  };
  MIDI.write(data, MIDI_DATA_LEN);
  //TODO: use a separate LED pin
  #if USE_BLUE_LED == true
  if (bendValue == 8192) {
    digitalWrite(BLUE_LED_PIN, LOW);
  } else {
    digitalWrite(BLUE_LED_PIN, HIGH);
  }
  #endif
}

void serialMod(int channel, uint8_t modValue) {
  uint8_t data[MIDI_DATA_LEN] = {
    static_cast<uint8_t>(0xB0 | (channel & 0x0F)), 
    0x01,
    modValue 
  };
  MIDI.write(data, MIDI_DATA_LEN);
  //TODO: use a separate LED pin
  #if USE_BLUE_LED == true
  if (modValue == 0) {
    digitalWrite(BLUE_LED_PIN, LOW);
  } else {
    digitalWrite(BLUE_LED_PIN, HIGH);
  }
  #endif
}