
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  email?: boolean;
  phone?: boolean;
  url?: boolean;
  custom?: (value: any) => string | null;
}

export interface ValidationErrors {
  [key: string]: string;
}

export class FormValidator {
  private rules: { [key: string]: ValidationRule } = {};
  private errors: ValidationErrors = {};

  constructor(rules: { [key: string]: ValidationRule }) {
    this.rules = rules;
  }

  validate(data: { [key: string]: any }): { isValid: boolean; errors: ValidationErrors } {
    this.errors = {};

    for (const [field, rule] of Object.entries(this.rules)) {
      const value = data[field];
      const error = this.validateField(field, value, rule);
      if (error) {
        this.errors[field] = error;
      }
    }

    return {
      isValid: Object.keys(this.errors).length === 0,
      errors: this.errors,
    };
  }

  private validateField(field: string, value: any, rule: ValidationRule): string | null {
    // Required validation
    if (rule.required && (value === undefined || value === null || value === '')) {
      return `${this.getFieldLabel(field)} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return null;
    }

    // String validations
    if (typeof value === 'string') {
      // Min length
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        return `${this.getFieldLabel(field)} must be at least ${rule.minLength} characters`;
      }

      // Max length
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        return `${this.getFieldLabel(field)} must not exceed ${rule.maxLength} characters`;
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        return `${this.getFieldLabel(field)} format is invalid`;
      }

      // Email validation
      if (rule.email && !this.isValidEmail(value)) {
        return `${this.getFieldLabel(field)} must be a valid email address`;
      }

      // Phone validation
      if (rule.phone && !this.isValidPhoneNumber(value)) {
        return `${this.getFieldLabel(field)} must be a valid phone number`;
      }

      // URL validation
      if (rule.url && !this.isValidUrl(value)) {
        return `${this.getFieldLabel(field)} must be a valid URL`;
      }
    }

    // Number validations
    if (typeof value === 'number' || !isNaN(Number(value))) {
      const numValue = Number(value);

      // Min value
      if (rule.min !== undefined && numValue < rule.min) {
        return `${this.getFieldLabel(field)} must be at least ${rule.min}`;
      }

      // Max value
      if (rule.max !== undefined && numValue > rule.max) {
        return `${this.getFieldLabel(field)} must not exceed ${rule.max}`;
      }
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }

  private getFieldLabel(field: string): string {
    // Convert camelCase to readable format
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhoneNumber(phone: string): boolean {
    // Uzbek phone number format
    const uzbekPhoneRegex = /^\+998[0-9]{9}$/;
    return uzbekPhoneRegex.test(phone);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// Sanitization utilities
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove HTML tags
  const withoutHtml = input.replace(/<[^>]*>/g, '');
  
  // Remove potentially dangerous characters
  const sanitized = withoutHtml
    .replace(/[<>\"']/g, '')
    .trim();
  
  return sanitized;
};

export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/javascript:/gi, '');
};

// Common validation rules
export const commonRules = {
  email: {
    required: true,
    email: true,
    maxLength: 255,
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  },
  phoneNumber: {
    required: true,
    phone: true,
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZÀ-ÿĞğİıÖöŞşÜüÇç\s]+$/,
  },
  price: {
    required: true,
    min: 0,
    max: 999999999,
  },
  description: {
    maxLength: 1000,
  },
  title: {
    required: true,
    minLength: 3,
    maxLength: 100,
  },
};

// Hook for form validation
export const useFormValidation = (initialData: any, rules: { [key: string]: ValidationRule }) => {
  const [data, setData] = React.useState(initialData);
  const [errors, setErrors] = React.useState<ValidationErrors>({});
  const [isValid, setIsValid] = React.useState(false);

  const validator = new FormValidator(rules);

  const validateForm = () => {
    const result = validator.validate(data);
    setErrors(result.errors);
    setIsValid(result.isValid);
    return result.isValid;
  };

  const updateField = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const resetForm = () => {
    setData(initialData);
    setErrors({});
    setIsValid(false);
  };

  React.useEffect(() => {
    validateForm();
  }, [data]);

  return {
    data,
    errors,
    isValid,
    updateField,
    validateForm,
    resetForm,
  };
};
