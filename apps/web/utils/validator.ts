export const isValidUzbekPhoneNumber = (phone: string): boolean => {
  const uzbekPhoneRegex = /^\+998[0-9]{9}$/;
  return uzbekPhoneRegex.test(phone);
};
