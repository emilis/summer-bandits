#include "ADS1X15.h"
#include <WiFi.h>
#include <esp_now.h>
#include "esp_wifi.h"
#include "midi_common.h"

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

const int PIN_UP = 23;
const int PIN_DOWN = 5;
const int PIN_SELECTOR = 19;

ADS1115 ADS(0x48);
uint8_t broadcastAddress[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF}; //Broadcast to all
controller_message data;
controller_message pingMessage;
unsigned long previousMillis = 0;
const long pingInterval = 1000; 

DeviceType getDeviceType() {
    #ifdef DEVICE
        #if DEVICE == GUITAR
            return DeviceType::GUITAR;
        #elif DEVICE == BASS
            return DeviceType::BASS;
        #else
            #error "Unknown DEVICE. Please set it to either GUITAR or BASS in platformio.ini."
        #endif
    #else
        #error "DEVICE is not defined. Please define it in platformio.ini."
    #endif
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

    Wire.begin();
    ADS.begin();
}

void setup() {
    Serial.begin(9600);

    WiFi.disconnect();
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

    data = {getDeviceType(), Mode::DATA, 0, 0};
    data.pitch = 50;
    data.velocity = 127;
    pingMessage = {getDeviceType(), Mode::PING, 0, 0};

    setupPins();

    Serial.println("Dongle booted up.");
}

void sendPing() {
    esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &pingMessage, sizeof(pingMessage));

    if (result != ESP_OK) {
        Serial.println("Error pinging");
        Serial.println(result);
    }
}

void loop() {
    unsigned long currentMillis = millis();
    if (currentMillis - previousMillis >= pingInterval) {
        previousMillis = currentMillis;
        sendPing();
    }
}