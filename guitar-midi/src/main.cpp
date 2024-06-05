#include <Arduino.h>
#include "MIDIUSB.h"

const int PIN_GREEN = 6;
const int PIN_RED = 10;
const int PIN_YELLOW = 8;
const int PIN_BLUE = 11;
const int PIN_ORANGE = 12;
const int PIN_UP = 19;
const int PIN_DOWN = 20;
const int PIN_SELECTOR = A3;

const int MIDI_CHANNEL = 0;
const unsigned long DEBOUNCE_MILLIS = 50;

int pinState[64] = {0};
unsigned long debounceState[64] = {0};

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

void updateButton(int buttonPin, uint8_t midiNote, int& prevState, unsigned long& debounceStartedAt, unsigned long now)
{
  auto state = digitalRead(buttonPin);

  if (now - debounceStartedAt < DEBOUNCE_MILLIS) {
    return;
  }
  
  if (state == prevState)
  {
    return;
  }

  prevState = state;

  debounceStartedAt = now;
  if (state == LOW)
  {
    noteOn(MIDI_CHANNEL, midiNote, 127);
    // Serial.print(buttonPin);
    // Serial.println(" on");
  }
  else
  {
    noteOff(MIDI_CHANNEL, midiNote);
    // Serial.print(buttonPin);
    // Serial.println(" off");
  }
}

void updateSelector(int pin, uint8_t midiNoteStart, int& prevState)
{
  auto state = analogRead(pin);
  state = map(state, 130, 860, 0, 100);
  state = round(state / 25.0);

  if (state == prevState)
  {
    return;
  }

  pinState[pin] = state;

  noteOn(MIDI_CHANNEL, midiNoteStart + state, 127);
  //Serial.print("Selector: ");
  //Serial.println(state);
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

  pinMode(PIN_SELECTOR, INPUT);
}

void loop()
{
  auto now = millis();
  updateButton(PIN_GREEN,      48, pinState[0], debounceState[0], now);
  updateButton(PIN_RED,        49, pinState[1], debounceState[1], now);
  updateButton(PIN_YELLOW,     50, pinState[2], debounceState[2], now);
  updateButton(PIN_BLUE,       51, pinState[3], debounceState[3], now);
  updateButton(PIN_ORANGE,     52, pinState[4], debounceState[4], now);
  // Pins UP and DOWN share the same debounce state intentionally.
  // When strumming with a particular pattern, the button flies back and opens 
  // the other switch, which is not something we want.
  unsigned long* strumDebounce = &(debounceState[5]);
  updateButton(PIN_UP,         59, pinState[5],   *strumDebounce, now); 
  updateButton(PIN_DOWN,       58, pinState[6],   *strumDebounce, now);

  updateSelector(PIN_SELECTOR, 67, pinState[7]);

  consumeMidi();
}