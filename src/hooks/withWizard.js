// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import React from "react";
import { Wizard, useWizard } from "react-use-wizard";

export const withWizard = (Component) => {
  return (props) => {
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
      <Component
        {...{
          isLoading,
          isLastStep,
          isFirstStep,
          activeStep,
          stepCount,
          previousStep,
          nextStep,
          goToStep,
          handleStep,
        }}
        {...props}
      />
    );
  };
};
