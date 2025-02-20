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
    <>
      {submissionSuccess && (
        <div className="absolute top-5 right-5 md:top-10 md:right-10 z-50 bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-lg shadow-lg transition ease-out duration-300">
          Time entry saved!
        </div>
      )}
      {submissionError && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-red-100 text-red-800 text-sm font-semibold px-4 py-2 rounded-lg shadow-lg transition ease-out duration-300">
          {submissionError}
        </div>
      )}
      {resetMessage && (
        <div className="absolute top-7 right-4 md:top-10 md:right-10 z-50 bg-yellow-500 text-blue-800 text-sm font-semibold px-4 py-2 rounded-lg shadow-lg transition ease-out duration-300">
          Timer reset!
        </div>
      )}
      {dateAlertMessage && (
        <div className="absolute top-5 right-5 md:top-10 md:right-10 z-50 bg-red-100 text-red-800 text-sm font-semibold px-4 py-2 rounded-lg shadow-lg transition ease-out duration-300">
          {dateAlertMessage}
        </div>
      )}
    </>
  );
};

export default FeedbackMessages;
