import { Signal, effect } from "@preact/signals";
import { Input, InputChannel, Output, OutputChannel } from "webmidi";
import { midiInputs, midiOutputs } from "../webmidi/state";

const inputs: Map<string, Signal<InputChannel | null>> = new Map();
const outputs: Map<string, Signal<OutputChannel | null>> = new Map();

const inputKey = (key: string) => `inputs.${key}`;
const inputChannelKey = (key: string) => `inputs.${key}.channel`;
const outputKey = (key: string) => `outputs.${key}`;
const outputChannelKey = (key: string) => `outputs.${key}.channel`;

export const setInputFromStorage = (
  key: string,
  forSignal: Signal<InputChannel | null>,
  inputs: Input[],
): boolean => {
  const savedName = localStorage.getItem(inputKey(key));
  const savedChannel = localStorage.getItem(inputChannelKey(key)) || "1";

  if (savedName) {
    const candidate = inputs.find((input) => input.name === savedName);
    if (candidate) {
      forSignal.value = candidate.channels[parseInt(savedChannel)];
      return true;
    }
  }
  return false;
};

export const setOutputFromStorage = (
  key: string,
  forSignal: Signal<OutputChannel | null>,
  outputs: Output[],
): boolean => {
  const savedName = localStorage.getItem(outputKey(key));
  const savedChannel = localStorage.getItem(outputChannelKey(key)) || "1";

  if (savedName) {
    const candidate = outputs.find((outputs) => outputs.name === savedName);
    if (candidate) {
      forSignal.value = candidate.channels[parseInt(savedChannel)];
      return true;
    }
  }
  return false;
};

export const registerInput = (
  key: string,
  forSignal: Signal<InputChannel | null>,
): void => {
  if (inputs.has(key)) {
    throw `input ${key} already registered!`;
  }
  inputs.set(key, forSignal);

  effect(() => {
    const inputs = midiInputs.value;
    const input = forSignal.peek()?.input;
    if (!input) {
      setInputFromStorage(key, forSignal, inputs);
    }
  });
};

export const registerOutput = (
  key: string,
  forSignal: Signal<OutputChannel | null>,
): void => {
  if (outputs.has(key)) {
    throw `output ${key} already registered!`;
  }
  outputs.set(key, forSignal);

  effect(() => {
    const outputs = midiOutputs.value;
    const output = forSignal.peek()?.output;
    if (!output) {
      setOutputFromStorage(key, forSignal, outputs);
    }
  });
};

const setOrRemove = (key: string, name: string | number | undefined) =>
  name ? localStorage.setItem(key, "" + name) : localStorage.removeItem(key);

export const save = () => {
  inputs.forEach((forSignal, key) => {
    setOrRemove(inputKey(key), forSignal.value?.input.name);
    setOrRemove(inputChannelKey(key), forSignal.value?.number);
  });

  outputs.forEach((forSignal, key) => {
    setOrRemove(outputKey(key), forSignal.value?.output.name);
    setOrRemove(outputChannelKey(key), forSignal.value?.number);
  });
};

export const load = () => {
  inputs.forEach((forSignal, key) => {
    if (!setInputFromStorage(key, forSignal, midiInputs.value)) {
      forSignal.value = null;
    }
  });

  outputs.forEach((forSignal, key) => {
    if (!setOutputFromStorage(key, forSignal, midiOutputs.value)) {
      forSignal.value = null;
    }
  });
};
