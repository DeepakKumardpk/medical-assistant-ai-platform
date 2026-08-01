const LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "Hindi", label: "Hindi" },
  { code: "Spanish", label: "Spanish" },
  { code: "French", label: "French" },
  { code: "Punjabi", label: "Punjabi" },
  { code: "Tamil", label: "Tamil" },
];

export function LanguageSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <select className="language-selector" value={value} onChange={(e) => onChange(e.target.value)}>
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}
