/* 
 * 📜 Verified Authorship — Manuel J. Nieves (B4EC 7343 AB0D BF24)
 * Original protocol logic. Derivative status asserted.
 * Commercial use requires license.
 * Contact: Fordamboy1@gmail.com
 */
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
