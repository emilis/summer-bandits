#include <Arduino.h>
#include "midi_common.h"

int getChannel(DeviceType device) {
  switch (device) {
    case BASS:
      return 1;
    default:
      return 0;
  }
}

void serialNoteOn(int channel, uint8_t pitch, uint8_t velocity) {
  uint8_t data[3] = {static_cast<uint8_t>(0x90 | channel), pitch, velocity};
  Serial.write(data, 3);
}

void serialNoteOff(int channel, uint8_t pitch) {
  uint8_t data[3] = {static_cast<uint8_t>(0x80 | channel), pitch, 0};
  Serial.write(data, 3);
}