const CHANNELS = [...Array(16).keys()].map((key) => key + 1);

export function SelectChannel({
  onChange,
  value,
}: {
  onChange: (value: number) => void;
  value: number | null | undefined;
}) {
  return (
    <select
      onChange={(evt) => onChange(Number(evt.currentTarget.value))}
      value={value || CHANNELS[0]}
    >
      {CHANNELS.map((channel) => (
        <option children={channel} key={channel} value={channel} />
      ))}
    </select>
  );
}
