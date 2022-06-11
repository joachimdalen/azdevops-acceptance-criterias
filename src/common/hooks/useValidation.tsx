import { DevOpsService } from '@joachimdalen/azdevops-ext-core/DevOpsService';
import { parseValidationError } from '@joachimdalen/azdevops-ext-core/ValidationUtils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as yup from 'yup';

export type ValidationFunc<T> = (schema: yup.ObjectSchema<any>, data: T) => Promise<boolean>;

function useValidation<T>(): {
  validate: ValidationFunc<T>;
  errors?: { [key: string]: string[] };
} {
  const [errors, setErrors] = useState<{ [key: string]: string[] } | undefined>();
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
