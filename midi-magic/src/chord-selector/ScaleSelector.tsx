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

  const onSetScale = useCallback(() => {
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
      <select onChange={onSetScale} value={vNote}>
        {NOTE_NAMES.map((name, note) => (
          <option value={note} key={note}>
            {name}
          </option>
        ))}
      </select>
      <select onChange={onSetScale} value={vType}>
        {Object.entries(SCALE_TYPES).map(([key, scaleType]) => (
          <option children={scaleType.label} key={key} value={key} />
        ))}
      </select>
      {scale.type === "chords" && <button onClick={onSetScale}>Reset</button>}
    </div>
  );
}
