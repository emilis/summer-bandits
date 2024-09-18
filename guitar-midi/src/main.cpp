#include <WiFi.h>
#include <esp_now.h>
#include "esp_wifi.h"
#include "midi_common.h"

#if USE_ADS == true
#include "ADS1X15.h"
ADS1115 ADS(0x48);
#endif

const unsigned long PING_INTERVAL = 1000; 
const unsigned long DEBOUNCE_MILLIS = 30;
const unsigned long WHAMMY_DEBOUNCE_MILLIS = 30;

constexpr DeviceType getDeviceType(const char* deviceType) {
    return (strcmp(deviceType, "GUITAR") == 0) ? DeviceType::GUITAR :
           (strcmp(deviceType, "BASS") == 0) ? DeviceType::BASS :
           static_cast<DeviceType>(-1); // Invalid value
}

DeviceType device = getDeviceType(DEVICE);
const int MIDI_CHANNEL = getChannel(device);
const ControllerMessage PING_MESSAGE = {device, Mode::PING, 0, 0};

uint8_t broadcastAddress[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF}; //Broadcast to all
unsigned long previousMillis = 0;
int pinState[30] = {0};
unsigned long debounceState[30] = {0};
// Pins UP and DOWN share the same debounce state intentionally.
// When strumming with a particular pattern, the button flies back and opens 
// the other switch, which is not something we want.
unsigned long* strumDebounce = &(debounceState[10]);
unsigned long now = 0;

inline void sendEspNowMessage(const ControllerMessage& message) {
    esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &message, sizeof(message));
    if (result != ESP_OK) {
        DEBUG_PRINT("Error sending message");
        DEBUG_PRINT(result);
    }
}

inline void sendEspNowNote(uint8_t pitch, uint8_t velocity) {
    ControllerMessage data = {device, Mode::NOTE, pitch, velocity};
    sendEspNowMessage(data);
}

inline void sendEspNowPitch(int bend) {
    ControllerMessage data = {device, Mode::PITCH, 0, bend};
    sendEspNowMessage(data);
}

inline void noteOn(uint8_t pitch, uint8_t velocity) {
    serialNoteOn(MIDI_CHANNEL, pitch, velocity);
    sendEspNowNote(pitch, velocity);
}

inline void noteOff(uint8_t pitch) {
    serialNoteOff(MIDI_CHANNEL, pitch);
    sendEspNowNote(pitch, 0);
}

inline void whammyDown(int bendValue) {
    serialPitchBend(MIDI_CHANNEL, bendValue);
    sendEspNowPitch(bendValue);
}

inline void whammyMod(uint8_t bendValue) {
    serialMod(MIDI_CHANNEL, bendValue);
    sendEspNowPitch(bendValue);
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
    int state;
    #if USE_ADS == true
    state = ADS.readADC(2);
    state = map(state, 2300, 15000, 0, 100);              
    #else
    state = analogRead(PIN_SELECTOR);
    state = map(state, 1200, 8191, 0, 100);
    #endif
    state = round(state / 25.0);

    if (state == prevState) return;

    prevState = state;
    noteOn(midiNoteStart + state, 127);
}

void updateWhammyPitchDown(int& prevState, unsigned long& debounceStartedAt, unsigned long now) {
    if (now - debounceStartedAt < WHAMMY_DEBOUNCE_MILLIS) return;

    //8192 -> 0 pitching down where 8192 is neutral and 0 is max pitch down in MIDI protocol
    int state;
    #if USE_ADS == true
    state = ADS.readADC(3);
    state = map(state, 1200, 15820, 8192, 0);        
    #else
    state = analogRead(PIN_WAMMY_BAR);
    state = map(state, 8191, 1880, 8192, 0);
    #endif
    state = constrain(state, 0, 8192);

    if (state == prevState) return;

    prevState = state;
    debounceStartedAt = now;

    whammyDown(state);
}

void updateWhammyMod(int& prevState, unsigned long& debounceStartedAt, unsigned long now) {
    if (now - debounceStartedAt < WHAMMY_DEBOUNCE_MILLIS) return;

    int state;
    #if USE_ADS == true
    state = ADS.readADC(3);
    state = map(state, 1200, 15820, 0, 127);       
    #else
    state = analogRead(PIN_WAMMY_BAR);
    state = map(state, 8191, 1880, 0, 127);
    #endif
    state = max(state, 0);    

    if (state == prevState) return;

    prevState = state;
    debounceStartedAt = now;

    whammyMod(state);
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
    //Enabled only for guitar (for now)
    #if USE_ADS == false
    pinMode(PIN_CROSS_UP, INPUT_PULLUP);
    pinMode(PIN_CROSS_RIGHT, INPUT_PULLUP);
    pinMode(PIN_CROSS_DOWN, INPUT_PULLUP);
    pinMode(PIN_CROSS_LEFT, INPUT_PULLUP);
    #endif
    pinMode(PIN_MENU, INPUT_PULLUP);
    pinMode(PIN_VIEW, INPUT_PULLUP);

    #if USE_BLUE_LED == true
    pinMode(BLUE_LED_PIN, OUTPUT);
    #endif

    #if USE_ADS == true
    Wire.begin();
    ADS.begin();
    #endif
}

void setup() {
    #if USE_ADS == true
    MIDI.begin(MIDI_SERIAL_RATE);
    #else
    MIDI.begin(MIDI_SERIAL_RATE, SERIAL_8N1, 16, 1);
    #endif


    WiFi.mode(WIFI_STA);

    esp_wifi_set_channel(WIFI_CHANNEL, WIFI_SECOND_CHAN_NONE);
    esp_wifi_start();
    if (esp_now_init() != ESP_OK) {
        DEBUG_PRINT("Error initializing ESP-NOW");
        return;
    }

    esp_now_peer_info_t broadcastPeer;
    memset(&broadcastPeer, 0, sizeof(broadcastPeer));
    memcpy(broadcastPeer.peer_addr, broadcastAddress, 6);
    broadcastPeer.channel = WIFI_CHANNEL;
    broadcastPeer.ifidx = WIFI_IF_STA;
    broadcastPeer.encrypt = false;

    if (esp_now_add_peer(&broadcastPeer) != ESP_OK) {
        DEBUG_PRINT("Failed to add broadcast peer");
        return;
    }

    setupPins();

    DEBUG_PRINT("Controller booted up.");
}

void loop() {
    now = millis();
    if (now - previousMillis >= PING_INTERVAL) {
        previousMillis = now;
        sendEspNowMessage(PING_MESSAGE);
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
    updateButton(PIN_DOWN,        58, pinState[10], *strumDebounce, now);
    updateButton(PIN_UP,          59, pinState[11], *strumDebounce, now); 

    //Enabled only for guitar (for now)
    #if USE_ADS == false
    updateButton(PIN_CROSS_UP,    60, pinState[12], debounceState[11], now);  
    updateButton(PIN_CROSS_RIGHT, 61, pinState[13], debounceState[12], now);
    updateButton(PIN_CROSS_DOWN,  62, pinState[14], debounceState[13], now);
    updateButton(PIN_CROSS_LEFT,  63, pinState[15], debounceState[14], now);
    #endif
    updateButton(PIN_VIEW,        65, pinState[16], debounceState[15], now);
    updateButton(PIN_MENU,        66, pinState[17], debounceState[16], now);

    updateSelector(67, pinState[18]);
    if (WHAMMY_BAR_IS_MOD) {
        updateWhammyMod(pinState[19], debounceState[18], now);
    } else {
        updateWhammyPitchDown(pinState[19], debounceState[18], now);
    }
}
