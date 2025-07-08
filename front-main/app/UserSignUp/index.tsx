import React, { useState } from "react";
import VerifyOtpForm from "../../components/verifyOtpForm";
import UserSignUpForm from "../../components/signupForm";
import style from "./user-sign-up.module.scss";
const SignUpPage = () => {
  const [step, setStep] = useState<"form" | "verify">("form");

  return step === "form" ? (
    <UserSignUpForm onNext={() => setStep("verify")} />
  ) : (
    <VerifyOtpForm onNext={() => setStep("form")} />
  );
};

export default SignUpPage;
