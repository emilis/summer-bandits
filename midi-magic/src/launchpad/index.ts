const BLACK =        0;

const RED_1 =        0b00000001;
const RED_2 =        0b00000010;
const RED_3 =        RED_1 | RED_2;

const GREEN_1 =      0b00010000;
const GREEN_2 =      0b00100000;
const GREEN_3 =      GREEN_1 | GREEN_2;

const YELLOW_1 =     RED_1 | GREEN_1;
const YELLOW_2 =     RED_2 | GREEN_2;
const YELLOW_3 =     RED_3 | GREEN_3;

const RED =          RED_2;
const GREEN =        GREEN_2;
const YELLOW =       YELLOW_2;

const RED_LO =       RED_1;
const RED_HI =       RED_3;

const GREEN_LO =     GREEN_1;
const GREEN_HI =     GREEN_3;

const YELLOW_LO =    YELLOW_1;
const YELLOW_HI =    YELLOW_3;

export const LP_COLORS = {
  BLACK,
  GREEN,
  GREEN_HI,
  GREEN_LO,
  RED,
  RED_HI,
  RED_LO,
  YELLOW,
  YELLOW_LO,
  YELLOW_HI,
};
