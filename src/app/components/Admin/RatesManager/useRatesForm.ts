import { useState, useCallback } from "react";

export const useRatesForm = (onSuccess: () => void) => {
  const [rateName, setRateName] = useState("");
  const [rateValue, setRateValue] = useState<number | string>("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleRateValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setRateValue(value === "" ? "" : parseInt(value, 10) || 0);
      if (value !== "" && isNaN(parseInt(value, 10))) {
        setFormError("Rate value must be a number.");
      } else {
        setFormError(null);
      }
    },
    []
  );

  const validateForm = useCallback(
    (selectedTeamId: string) => {
      setFormError(null);

      if (!selectedTeamId) {
        setFormError("Please select a team.");
        return false;
      }
      if (!rateName.trim()) {
        setFormError("Please enter a rate name.");
        return false;
      }
      if (
        rateValue === "" ||
        isNaN(Number(rateValue)) ||
        Number(rateValue) < 0
      ) {
        setFormError("Please enter a valid non-negative rate value.");
        return false;
      }

      return true;
    },
    [rateName, rateValue]
  );

  const resetForm = useCallback(() => {
    setRateName("");
    setRateValue("");
    setFormError(null);
    onSuccess();
  }, [onSuccess]);

  return {
    rateName,
    rateValue,
    formError,
    setRateName,
    handleRateValueChange,
    validateForm,
    resetForm,
  };
};
