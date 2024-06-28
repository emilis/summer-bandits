#define WIFI_CHANNEL 5

#ifndef MIDI_COMMON_H
#define MIDI_COMMON_H

enum DeviceType {
  GUITAR,
  BASS,
};

enum Mode {
  PING,
  DATA,
};

typedef struct controller_message {
  DeviceType device;
  Mode mode;
  char message[32];
} controller_message;

#endif
