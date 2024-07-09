#include <unordered_map>
#include <WiFi.h>
#include <esp_now.h>
#include "esp_wifi.h"
#include "midi_common.h"

#if USE_ADS == true
#include "ADS1X15.h"
ADS1115 ADS(0x48);
#endif

const long PING_INTERVAL = 1000; 
const unsigned long DEBOUNCE_MILLIS = 50;

DeviceType device = 
    #ifdef DEVICE
        #if DEVICE == GUITAR
            DeviceType::GUITAR;
        #elif DEVICE == BASS
            DeviceType::BASS;
        #else
            #error "Unknown DEVICE. Please set it to either GUITAR or BASS in platformio.ini."
        #endif
    #else
        #error "DEVICE is not defined. Please define it in platformio.ini."
    #endif
const int MIDI_CHANNEL = getChannel(device);
const controller_message PING_MESSAGE = {device, Mode::PING, 0, 0};

uint8_t broadcastAddress[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF}; //Broadcast to all
unsigned long previousMillis = 0;
std::unordered_map<int, int> pinState;
std::unordered_map<int, unsigned long> debounceState;

void sendEspNowPing() {
    esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &PING_MESSAGE, sizeof(PING_MESSAGE));
    if (result != ESP_OK) {
        Serial.println("Error pinging");
        Serial.println(result);
    }
}

void sendEspNowMidi(uint8_t pitch, uint8_t velocity) {
    controller_message data = {device, Mode::DATA, pitch, velocity};
    esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &data, sizeof(data));
    if (result != ESP_OK) {
        Serial.println("Error sending MIDI message");
        Serial.println(result);
    }
}

void noteOn(uint8_t pitch, uint8_t velocity) {
    serialNoteOn(MIDI_CHANNEL, pitch, velocity);
    sendEspNowMidi(pitch, velocity);
}

void noteOff(uint8_t pitch) {
    serialNoteOff(MIDI_CHANNEL, pitch);
    sendEspNowMidi(pitch, 0);
}

void updateButton(int buttonPin, uint8_t midiNote, int& prevState, unsigned long& debounceStartedAt, unsigned long now) {
  if (now - debounceStartedAt < DEBOUNCE_MILLIS) return;

  auto state = digitalRead(buttonPin);

  if (state == prevState) return;
  
  prevState = state;
  debounceStartedAt = now;

  if (state == LOW) {
    noteOn(midiNote, 127);
  } else {
    noteOff(midiNote);
  }
}

void updateSelector(uint8_t midiNoteStart, int& prevState) {
    int16_t state;
    #if USE_ADS == true
    state = ADS.readADC(2);
    state = map(state, 2300, 15000, 0, 100);
    state = round(state / 25.0);
    #else
    state = digitalRead(PIN_SELECTOR);
    #endif
    if (state == prevState) return;

    prevState = state;
    noteOn(midiNoteStart + state, 127);
}

void setupPins() {
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

    pinMode(BLUE_LED_PIN, OUTPUT);

    #if USE_ADS == true
    Wire.begin();
    ADS.begin();
    #endif
}

void setup() {
    MIDI.begin(MIDI_SERIAL_RATE);

    WiFi.mode(WIFI_STA);

    esp_wifi_set_channel(WIFI_CHANNEL, WIFI_SECOND_CHAN_NONE);
    esp_wifi_start();
    if (esp_now_init() != ESP_OK) {
        Serial.println("Error initializing ESP-NOW");
        return;
    }

    esp_now_peer_info_t broadcastPeer;
    memset(&broadcastPeer, 0, sizeof(broadcastPeer));
    memcpy(broadcastPeer.peer_addr, broadcastAddress, 6);
    broadcastPeer.channel = WIFI_CHANNEL;
    broadcastPeer.ifidx = WIFI_IF_STA;
    broadcastPeer.encrypt = false;

    if (esp_now_add_peer(&broadcastPeer) != ESP_OK) {
        Serial.println("Failed to add broadcast peer");
        return;
    }

    setupPins();

    Serial.println("Controller booted up.");
}

void loop() {
    auto now = millis();
    if (now - previousMillis >= PING_INTERVAL) {
        previousMillis = now;
        sendEspNowPing();
    }
    
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