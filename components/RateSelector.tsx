import React from "react";

type RateSelectorProps = {
  rates: { id: string; name: string; rate: number }[];
  selectedRate: string;
  onRateChange: (rateId: string) => void;
};

const RateSelector: React.FC<RateSelectorProps> = ({
  rates,
  selectedRate,
  onRateChange,
}) => {
  return (
    <select
      value={selectedRate}
      onChange={(e) => onRateChange(e.target.value)}
      className="form-input block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    >
      <option value="" disabled>
        Select a rate
      </option>
      {rates.map((rate) => (
        <option key={rate.id} value={rate.id}>
          {rate.name} ({rate.rate})
        </option>
      ))}
    </select>
  );
};

export default RateSelector;
