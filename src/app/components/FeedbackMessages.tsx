"use client";
import React from "react";

interface FeedbackMessagesProps {
  submissionSuccess: boolean;
  submissionError: string;
  resetMessage: boolean;
  dateAlertMessage: string | null;
}

const FeedbackMessages: React.FC<FeedbackMessagesProps> = ({
  submissionSuccess,
  submissionError,
  resetMessage,
  dateAlertMessage,
}) => {
  return (
    <div className="absolute top-5 right-5 z-50 flex flex-col items-end space-y-2">
      {submissionSuccess && (
        <div className="bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-lg shadow-lg transition ease-out duration-300">
          Time entry saved!
        </div>
      )}
      {submissionError && (
        <div className="bg-red-100 text-red-800 text-sm font-semibold px-4 py-2 rounded-lg shadow-lg transition ease-out duration-300">
          {submissionError}
        </div>
      )}
      {resetMessage && (
        <div className="bg-yellow-500 text-blue-800 text-sm font-semibold px-4 py-2 rounded-lg shadow-lg transition ease-out duration-300">
          Timer reset!
        </div>
      )}
      {dateAlertMessage && (
        <div className="bg-red-100 text-red-800 text-sm font-semibold px-4 py-2 rounded-lg shadow-lg transition ease-out duration-300">
          {dateAlertMessage}
        </div>
      )}
    </div>
  );
};

export default FeedbackMessages;
