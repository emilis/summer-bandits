import {
  NOTE_NAMES,
  NoteNumber,
  SCALE_TYPES,
  type Scale,
  ScaleType,
} from "../harmony/scales";
import { JSX } from "preact/jsx-runtime";
import "./ScaleSelector.css";

type Props = {
  onChange: (rootNote: NoteNumber, scaleType: ScaleType) => void;
  scale: Scale;
};

export function ScaleSelector({ onChange, scale }: Props) {
  const onNoteChange = (evt: JSX.TargetedEvent<HTMLSelectElement>) => {
    onChange(parseInt(evt.currentTarget.value) as NoteNumber, scale.type);
  };
  const onTypeChange = (evt: JSX.TargetedEvent<HTMLSelectElement>) => {
    onChange(scale.root, evt.currentTarget.value as ScaleType);
  };

  return (
    <div class="com-chord-selector-scale-selector">
      <select onChange={onNoteChange}>
        {NOTE_NAMES.map((name, note) => (
          <option value={note} selected={scale.root == note} key={note}>
            {name}
          </option>
        ))}
      </select>
      <select onChange={onTypeChange}>
        {Object.entries(SCALE_TYPES).map(([key, scaleType]) => (
          <option
            children={scaleType.label}
            selected={scale.type === scaleType.type}
            value={key}
          />
        ))}
      </select>
    </div>
  );
}
