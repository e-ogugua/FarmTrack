import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

type ValidationRule<T> = {
  validator: (value: T[keyof T], values: T) => boolean;
  message: string;
};

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T>[];
};

interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  onSubmit: (values: T) => Promise<void> | void;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationRules = {},
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (name: keyof T, value: T[keyof T]): boolean => {
      const rules = validationRules[name];
      if (!rules) return true;

      for (const rule of rules) {
        if (!rule.validator(value, values)) {
          setErrors((prev) => ({
            ...prev,
            [name]: rule.message,
          }));
          return false;
        }
      }

      // Clear error if validation passes
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });

      return true;
    },
    [validationRules, values]
  );

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    const newErrors: Partial<Record<keyof T, string>> = {};

    for (const [field, rules] of Object.entries(validationRules) as [
      keyof T,
      ValidationRule<T>[]
    ][]) {
      for (const rule of rules) {
        if (!rule.validator(values[field], values)) {
          newErrors[field] = rule.message;
          isValid = false;
          break;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [validationRules, values]);

  const handleChange = useCallback(
    (name: keyof T) => (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const { value, type, checked } = e.target as HTMLInputElement;
      const newValue = type === 'checkbox' ? checked : value;

      setValues((prev) => ({
        ...prev,
        [name]: newValue,
      }));

      // Validate field on change if there's an error
      if (errors[name]) {
        validateField(name, newValue);
      }
    },
    [errors, validateField]
  );

  const setFieldValue = useCallback(
    <K extends keyof T>(name: K, value: T[K]) => {
      setValues((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Validate field if there's an error
      if (errors[name]) {
        validateField(name, value);
      }
    },
    [errors, validateField]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      if (!validateForm()) {
        toast({
          title: 'Validation Error',
          description: 'Please fix the errors in the form',
          variant: 'destructive',
        });
        return;
      }

      setIsSubmitting(true);

      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while submitting the form',
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, validateForm, values]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFieldValue,
    setValues,
    resetForm,
  };
}

// Helper function to create validation rules
export const createValidationRules = <T extends Record<string, any>>(
  rules: ValidationRules<T>
) => rules;

// Common validation rules
export const required = <T,>(
  message = 'This field is required'
): ValidationRule<T> => ({
  validator: (value) => {
    if (typeof value === 'string') {
      return value.trim() !== '';
    }
    if (typeof value === 'number') {
      return !isNaN(value);
    }
    return value !== undefined && value !== null;
  },
  message,
});

export const minLength = <T,>(
  min: number,
  message = `Must be at least ${min} characters`
): ValidationRule<T> => ({
  validator: (value) => {
    return value === undefined || value === null || String(value).length >= min;
  },
  message,
});

export const maxLength = <T,>(
  max: number,
  message = `Must be at most ${max} characters`
): ValidationRule<T> => ({
  validator: (value) => {
    return value === undefined || value === null || String(value).length <= max;
  },
  message,
});

export const email = <T,>(message = 'Must be a valid email'): ValidationRule<T> => ({
  validator: (value) => {
    if (!value) return true; // Skip validation if empty (use required() for that)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(value));
  },
  message,
});

export const matchField = <T,>(
  fieldName: keyof T,
  message = 'Fields do not match'
): ValidationRule<T> => ({
  validator: (value, values) => {
    return value === values[fieldName];
  },
  message,
});
