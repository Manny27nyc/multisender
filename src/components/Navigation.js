import React from "react";
// import { WithWizard } from "react-albus";
import { useWizard } from "react-use-wizard";

const Navigation = () => {
  const {
    isLoading,
    isLastStep,
    isFirstStep,
    activeStep,
    stepCount,
    previousStep,
    nextStep,
    goToStep,
    handleStep,
  } = useWizard();

  return (
    <div className="multisend-buttons">
      {"home" !== step.id && "multisend" !== step.id && (
        <button
          className="multisend-button multisend-button_prev"
          onClick={previous}
        >
          Back
        </button>
      )}

      {"multisend" === step.id && (
        <button
          className="multisend-button multisend-button_prev"
          onClick={next}
        >
          Home
        </button>
      )}

      {"multisend" !== step.id && (
        <button
          className="multisend-button multisend-button_next"
          onClick={next}
        >
          Next
        </button>
      )}
    </div>
  );
};

export default Navigation;
