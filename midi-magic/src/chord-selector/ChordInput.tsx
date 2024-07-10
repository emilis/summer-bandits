import clsx from "clsx";
import { useState } from "preact/hooks";

import { parseChord } from "../chord-parser/";
import { type Chord, MAX_CHORDS_COUNT } from "../harmony/scales";

import "./ChordInput.css";

type Props = {
  onChange: (chords: Chord[]) => void;
};

const valueToChords = (value: string): any[] =>
  value.trim().split(/\s+/).map(parseChord);

export function ChordInput({ onChange }: Props) {
  const [isUsable, setIsUsable] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");

  const onInput = (newValue: string) => {
    setValue(newValue);
    try {
      const chords = valueToChords(newValue);
      setIsUsable(
        chords.length > 0 &&
          chords.length <= MAX_CHORDS_COUNT &&
          !chords.find((chord) => chord.error),
      );
    } catch {
      setIsUsable(false);
    }
  };

  const onSubmit = (evt: any) => {
    evt.preventDefault();
    console.log("onSubmit", isUsable, value);
    if (isUsable) {
      onChange(valueToChords(value));
    }
  };

  return (
    <form className="com-chord-selector-chord-input" onSubmit={onSubmit}>
      <input
        className={clsx(isUsable ? "is-usable" : "is-unusable")}
        onInput={(evt) => onInput(evt.currentTarget.value)}
        placeholder="Enter chord names separated by spaces and press Enter"
        spellcheck={false}
        value={value}
      />
    </form>
  );
}
