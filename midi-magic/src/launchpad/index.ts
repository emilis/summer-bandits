const BLACK =        0b0000;
const WHITE =        0b0111;
const BLINK =        0b1000;

const RED =          0b0001;
const GREEN =        0b0010;
const BLUE =         0b0100;

const YELLOW =       RED | GREEN;
const PURPLE =       RED | BLUE;
const CYAN =         GREEN | BLUE;

const RED_LO =       RED;
const RED_HI =       PURPLE;
const GREEN_LO =     GREEN;
const GREEN_HI =     YELLOW;
const BLUE_LO =      BLUE;
const BLUE_HI =      CYAN;

export const LP_COLORS = {
    BLACK,
    BLINK,
    BLUE,
    BLUE_HI,
    BLUE_LO,
    CYAN,
    GREEN,
    GREEN_HI,
    GREEN_LO,
    PURPLE,
    RED,
    RED_HI,
    RED_LO,
    WHITE,
    YELLOW,
};
