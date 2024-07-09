#include <Arduino.h>
#include "midi_common.h"

static HardwareSerial SerialZero(0);
HardwareSerial MIDI = SerialZero;

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