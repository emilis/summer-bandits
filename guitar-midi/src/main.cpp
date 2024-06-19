#include <Arduino.h>
#include "ADS1X15.h"

ADS1115 ADS(0x48);

const int PIN_GREEN = 33;
const int PIN_RED = 27;
const int PIN_YELLOW = 26;
const int PIN_BLUE = 18;
const int PIN_ORANGE = 19;

const int PIN_GREEN_HIGH = 2;
const int PIN_RED_HIGH = 0;
const int PIN_YELLOW_HIGH = 4;
const int PIN_BLUE_HIGH = 16;
const int PIN_ORANGE_HIGH = 32;

const int PIN_UP = 5;
const int PIN_DOWN = 23;
const int PIN_SELECTOR = 19;

const int MIDI_CHANNEL = 0;
const unsigned long DEBOUNCE_MILLIS = 50;

int pinState[64] = {0};
unsigned long debounceState[64] = {0};

void noteOn(uint8_t channel, uint8_t pitch, uint8_t velocity)
{
  uint8_t data[3] = {0x90 | channel, pitch, velocity};
	Serial.write(data, 3);
}

void noteOff(uint8_t channel, uint8_t pitch)
{
  uint8_t data[3] = {0x80 | channel, pitch, 0};
  Serial.write(data, 3);
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
  }
  else
  {
    noteOff(MIDI_CHANNEL, midiNote);
  }
}

void updateSelector(uint8_t midiNoteStart, int& prevState)
{
  int16_t state = ADS.readADC(2);
  state = map(state, 2300, 15000, 0, 100);
  state = round(state / 25.0);
  if (state == prevState)
  {
    return;
  }
  prevState = state;

  noteOn(MIDI_CHANNEL, midiNoteStart + state, 127);
}

void setup()
{
  Serial.begin(31250);
  
  pinMode(PIN_GREEN, INPUT_PULLUP);
  pinMode(PIN_RED, INPUT_PULLUP);
  pinMode(PIN_YELLOW, INPUT_PULLUP);
  pinMode(PIN_BLUE, INPUT_PULLUP);
  pinMode(PIN_ORANGE, INPUT_PULLUP);
  pinMode(PIN_GREEN_HIGH, INPUT_PULLUP);
  pinMode(PIN_RED_HIGH, INPUT_PULLUP);
  pinMode(PIN_YELLOW_HIGH, INPUT_PULLUP);
  pinMode(PIN_BLUE_HIGH, INPUT_PULLUP);
  pinMode(PIN_ORANGE_HIGH, INPUT_PULLUP);
  pinMode(PIN_UP, INPUT_PULLUP);
  pinMode(PIN_DOWN, INPUT_PULLUP);

  Wire.begin();
  ADS.begin();
}

void loop()
{
  auto now = millis();
  updateButton(PIN_GREEN,       48, pinState[0], debounceState[0], now);
  updateButton(PIN_RED,         49, pinState[1], debounceState[1], now);
  updateButton(PIN_YELLOW,      50, pinState[2], debounceState[2], now);
  updateButton(PIN_BLUE,        51, pinState[3], debounceState[3], now);
  updateButton(PIN_ORANGE,      52, pinState[4], debounceState[4], now);  
  updateButton(PIN_GREEN_HIGH,  53, pinState[5], debounceState[5], now);
  updateButton(PIN_RED_HIGH,    54, pinState[6], debounceState[6], now);
  updateButton(PIN_YELLOW_HIGH, 55, pinState[7], debounceState[7], now);
  updateButton(PIN_BLUE_HIGH,   56, pinState[8], debounceState[8], now);
  updateButton(PIN_ORANGE_HIGH, 57, pinState[9], debounceState[9], now);
  // Pins UP and DOWN share the same debounce state intentionally.
  // When strumming with a particular pattern, the button flies back and opens 
  // the other switch, which is not something we want.
  unsigned long* strumDebounce = &(debounceState[10]);
  updateButton(PIN_DOWN,        58, pinState[10],  *strumDebounce,    now);
  updateButton(PIN_UP,          59, pinState[11],  *strumDebounce,    now); 

  updateSelector(67, pinState[12]);
}