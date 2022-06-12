import { parseValidationError } from '@joachimdalen/azdevops-ext-core/ValidationUtils';
import { useCallback, useState } from 'react';
import * as yup from 'yup';

import { ValidationErrors } from '../types';

export type ValidationFunc<T> = (schema: yup.ObjectSchema<any>, data: T) => Promise<boolean>;

function useValidation<T>(): {
  validate: ValidationFunc<T>;
  errors?: ValidationErrors;
} {
  const [errors, setErrors] = useState<ValidationErrors>();
  const validate = useCallback(async (schema: yup.ObjectSchema<any>, data: T): Promise<boolean> => {
    try {
      await schema.validate(data, { abortEarly: false });
      setErrors(undefined);
      return true;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const data = parseValidationError(error);
        setErrors(data);
        return false;
      } else {
        throw error;
      }
    }
  }, []);

  return {
    validate,
    errors
  };
}

export default useValidation;
