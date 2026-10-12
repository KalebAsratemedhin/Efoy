/** Allowed phone number length (digits / local format). */
export const PHONE_NUMBER_MAX_LENGTH = 10;

export const phoneNumberFieldOptions = {
  maxLength: {
    value: PHONE_NUMBER_MAX_LENGTH,
    message: `Phone number must be at most ${PHONE_NUMBER_MAX_LENGTH} characters`,
  },
} as const;
