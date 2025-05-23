import { useState } from "react";
import type { FeedbackState } from "../types";

export const useFeedbackState = () => {
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [dateAlertMessage, setDateAlertMessage] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState(false);

  const showSuccessMessage = () => {
    setSubmissionSuccess(true);
    setTimeout(() => setSubmissionSuccess(false), 2000);
  };

  const showResetMessage = () => {
    setResetMessage(true);
    setTimeout(() => setResetMessage(false), 2000);
  };

  const showDateAlert = (message: string) => {
    setDateAlertMessage(message);
    setTimeout(() => setDateAlertMessage(null), 2000);
  };

  return {
    state: {
      submissionSuccess,
      submissionError,
      dateAlertMessage,
      resetMessage,
    } as FeedbackState,
    actions: {
      setSubmissionError,
      showSuccessMessage,
      showResetMessage,
      showDateAlert,
    },
  };
};
