import { useCallback, useEffect, useState } from "preact/hooks";

import {
  type NoteNumber,
  type Scale,
  type ScaleType,
  NOTE_NAMES,
  SCALE_TYPES,
} from "../harmony/scales";
import "./ScaleSelector.css";

type Props = {
  onChange: (rootNote: NoteNumber, scaleType: ScaleType) => void;
  scale: Scale;
};

export function ScaleSelector({ onChange, scale }: Props) {
  const [vNote, setNote] = useState<NoteNumber>(scale.root);
  const [vType, setType] = useState<ScaleType>(scale.type);

  const onChangeNote = useCallback(
    (note: string) => {
      const noteNumber = parseInt(note, 10) as NoteNumber;
      setNote(noteNumber);
      onChange(noteNumber, vType);
    },
    [vType],
  );

  const onChangeType = useCallback(
    (typeValue: string) => {
      setType(typeValue as ScaleType);
      onChange(vNote, typeValue as ScaleType);
    },
    [vNote],
  );

  const onClickReset = useCallback(() => {
    onChange(vNote, vType);
  }, [vNote, vType]);

  useEffect(() => {
    if (scale.type !== "chords") {
      setNote(scale.root);
      setType(scale.type);
    }
  }, [scale.root, scale.type]);

  return (
    <div class="com-chord-selector-scale-selector">
      <select
        onChange={(evt) => onChangeNote(evt.currentTarget.value)}
        value={vNote}
      >
        {NOTE_NAMES.map((name, note) => (
          <option value={note} key={note}>
            {name}
          </option>
        ))}
      </select>
      <select
        onChange={(evt) => onChangeType(evt.currentTarget.value)}
        value={vType}
      >
        {Object.entries(SCALE_TYPES).map(([key, scaleType]) => (
          <option children={scaleType.label} key={key} value={key} />
        ))}
      </select>
      {scale.type === "chords" && <button onClick={onClickReset}>Reset</button>}
    </div>
  );
}
