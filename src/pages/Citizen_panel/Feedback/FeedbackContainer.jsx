import React, { useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";

import FeedbackList from "./FeedbackList";
import FeedbackForm from "./FeedbackForm";

const FeedbackContainer = ({
  complaints,
  selectedComplaint,
  clearSelection,
}) => {
  const [current, setCurrent] = useState(null);

  // Prefer parent-selected complaint first
  const activeComplaint = useMemo(
    () => selectedComplaint ?? current,
    [selectedComplaint, current]
  );

  const handleSelectComplaint = useCallback((complaint) => {
    setCurrent(complaint);
  }, []);

  const handleBack = useCallback(() => {
    setCurrent(null);

    if (clearSelection) {
      clearSelection();
    }
  }, [clearSelection]);

  if (activeComplaint) {
    return (
      <FeedbackForm
        complaint={activeComplaint}
        onBack={handleBack}
      />
    );
  }

  return (
    <FeedbackList
      complaints={complaints}
      onSelectComplaint={handleSelectComplaint}
    />
  );
};

FeedbackContainer.propTypes = {
  complaints: PropTypes.array.isRequired,
  selectedComplaint: PropTypes.object,
  clearSelection: PropTypes.func.isRequired,
};

export default React.memo(FeedbackContainer);

