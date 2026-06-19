import React from "react";

const Pill = ({ label, active, onClick, testid }) => (
  <button
    type="button"
    data-testid={testid}
    onClick={onClick}
    className={`pp-chip ${active ? "pp-chip-active" : ""}`}
  >
    {label}
  </button>
);

export const Filters = ({ meta, value, onChange }) => {
  const { styles = [], platforms = [], use_cases = [] } = meta || {};

  const update = (key, val) => onChange({ ...value, [key]: val });

  const Section = ({ title, items, current, keyName, idPrefix }) => (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase font-bold tracking-widest text-[#4A4A4A]">{title}</span>
      <div className="flex flex-wrap gap-2">
        <Pill
          label="All"
          active={current === "All" || !current}
          onClick={() => update(keyName, "All")}
          testid={`${idPrefix}-all`}
        />
        {items.map((it) => (
          <Pill
            key={it}
            label={it}
            active={current === it}
            onClick={() => update(keyName, it)}
            testid={`${idPrefix}-${it.toLowerCase().replace(/\s+/g, "-")}`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div data-testid="filters" className="flex flex-col gap-5">
      <Section title="Style" items={styles} current={value.style} keyName="style" idPrefix="filter-style" />
      <Section title="Platform" items={platforms} current={value.platform} keyName="platform" idPrefix="filter-platform" />
      <Section title="Use Case" items={use_cases} current={value.use_case} keyName="use_case" idPrefix="filter-usecase" />
    </div>
  );
};

export default Filters;
