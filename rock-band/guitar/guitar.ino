// constants won't change. They're used here to set pin numbers:
const int green = 12;     // the number of the pushbutton pin
const int red = 11;     // the number of the pushbutton pin
const int yellow = 8;     // the number of the pushbutton pin
const int blue = 10;     // the number of the pushbutton pin
const int orange = 6;     // the number of the pushbutton pin
const int up = 19;     // the number of the pushbutton pin
const int down = 20;     // the number of the pushbutton pin

const int ledPin =  LED_BUILTIN;      // the number of the LED pin

int pinState[20] = {0};

void setup() {
  Serial.begin(9600);
  
  // initialize the LED pin as an output:
  pinMode(ledPin, OUTPUT);
  // initialize the pushbutton pin as an input:
  pinMode(green, INPUT_PULLUP);
  pinMode(red, INPUT_PULLUP);
  pinMode(yellow, INPUT_PULLUP);
  pinMode(blue, INPUT_PULLUP);
  pinMode(orange, INPUT_PULLUP);
  pinMode(up, INPUT_PULLUP);
}

void handleButtonClicked(int buttonPin) {
  int buttonState = digitalRead(buttonPin);

  if (buttonState == pinState[buttonPin]) {
    return;
  }

  pinState[buttonPin] = buttonState;
  
  if (buttonState == LOW) {
    // turn LED on:
    digitalWrite(ledPin, HIGH);
    Serial.print(buttonPin);
    Serial.println(" clicked");
  } else {
    // turn LED off:
    digitalWrite(ledPin, LOW);
  }  
}

void loop() {
  // check if the pushbutton is pressed. If it is, the buttonState is HIGH:
  handleButtonClicked(green);
  handleButtonClicked(red);
  handleButtonClicked(yellow);
  handleButtonClicked(blue);
  handleButtonClicked(orange);

  handleButtonClicked(up);  
  handleButtonClicked(down);
}

