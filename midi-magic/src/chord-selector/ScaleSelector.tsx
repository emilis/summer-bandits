import { useCallback, useState } from "preact/hooks";

import {
  NOTE_NAMES,
  NoteNumber,
  SCALE_TYPES,
  type Scale,
  ScaleType,
} from "../harmony/scales";
import "./ScaleSelector.css";

type Props = {
  onChange: (rootNote: NoteNumber, scaleType: ScaleType) => void;
  scale: Scale;
};

export function ScaleSelector({ onChange, scale }: Props) {
  const [noteSelect, setNoteSelect] = useState<HTMLSelectElement | null>(null);
  const [typeSelect, setTypeSelect] = useState<HTMLSelectElement | null>(null);

  const onSetScale = useCallback(() => {
    if (noteSelect && typeSelect) {
      onChange(
        parseInt(noteSelect.value) as NoteNumber,
        typeSelect.value as ScaleType,
      );
    }
  }, [noteSelect, typeSelect]);

  return (
    <div class="com-chord-selector-scale-selector">
      <select onChange={onSetScale} ref={setNoteSelect} value={scale.root}>
        {NOTE_NAMES.map((name, note) => (
          <option value={note} key={note}>
            {name}
          </option>
        ))}
      </select>
      <select onChange={onSetScale} ref={setTypeSelect} value={scale.type}>
        {Object.entries(SCALE_TYPES).map(([key, scaleType]) => (
          <option children={scaleType.label} key={key} value={key} />
        ))}
      </select>
      {scale.type === "chords" && <button onClick={onSetScale}>Reset</button>}
    </div>
  );
}
