#include <Arduino.h>
#include "MIDIUSB.h"

const int PIN_GREEN = 12;
const int PIN_RED = 11;
const int PIN_YELLOW = 8;
const int PIN_BLUE = 10;
const int PIN_ORANGE = 6;
const int PIN_UP = 19;
const int PIN_DOWN = 20;
const int MIDI_CHANNEL = 0;

int pinState[20] = {0};

void noteOn(uint8_t channel, uint8_t pitch, uint8_t velocity)
{
  midiEventPacket_t noteOn = {0x09, 0x90 | channel, pitch, velocity};
  MidiUSB.sendMIDI(noteOn);
  MidiUSB.flush();
}

void noteOff(uint8_t channel, uint8_t pitch)
{
  midiEventPacket_t noteOff = {0x08, 0x80 | channel, pitch, 0};
  MidiUSB.sendMIDI(noteOff);
  MidiUSB.flush();
}

void consumeMidi()
{
  auto rx = MidiUSB.read();

  while (rx.header != 0)
  {
    rx = MidiUSB.read();
  }
}

void updateButton(int buttonPin, int midiNote)
{
  auto state = digitalRead(buttonPin);

  // TODO: debounce
  if (state == pinState[buttonPin])
  {
    return;
  }

  pinState[buttonPin] = state;

  if (state == LOW)
  {
    noteOn(MIDI_CHANNEL, midiNote, 127);
    // Serial.print(buttonPin);
    // Serial.println(" on");
  }
  else
  {
    noteOff(MIDI_CHANNEL, midiNote);
  }
}

void setup()
{
  // Serial.begin(9600);

  pinMode(LED_BUILTIN, OUTPUT);

  pinMode(PIN_GREEN, INPUT_PULLUP);
  pinMode(PIN_RED, INPUT_PULLUP);
  pinMode(PIN_YELLOW, INPUT_PULLUP);
  pinMode(PIN_BLUE, INPUT_PULLUP);
  pinMode(PIN_ORANGE, INPUT_PULLUP);
  pinMode(PIN_UP, INPUT_PULLUP);
  pinMode(PIN_DOWN, INPUT_PULLUP);
}

void loop()
{
  updateButton(PIN_GREEN, 48);
  updateButton(PIN_RED, 49);
  updateButton(PIN_YELLOW, 50);
  updateButton(PIN_BLUE, 51);
  updateButton(PIN_ORANGE, 52);
  updateButton(PIN_UP, 59);
  updateButton(PIN_DOWN, 58);

  consumeMidi();
}