import { type InputChannel, type Note, type OutputChannel } from "webmidi";
import { type Signal } from "@preact/signals";

export type Instrument = {
  label: string;
  inputs: Record<string, Signal<InputChannel | null>>;
  midiPanic: () => void;
  outputs: Record<string, Signal<OutputChannel | null>>;
};

export type NoteEventHandler = ({ note }: { note: Note }) => void;
