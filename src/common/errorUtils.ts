import { ValidationError } from 'yup';

import { capitalizeFirstLetter } from './common';

export const parseValidationError = (error: ValidationError): { [key: string]: string[] } => {
  const data = error.inner
    .map((x: any) => {
      return {
        path: x.path,
        message: x.message
      };
    })
    .reduce((previousValue: any, currentValue: any) => {
      if (previousValue[currentValue.path] !== undefined) {
        return {
          ...previousValue,
          [currentValue.path]: [...previousValue[currentValue.path], currentValue.message]
        };
      }

      return {
        ...previousValue,
        [currentValue.path]: [currentValue.message]
      };
    }, {});

  return data;
};

export const getCombined = (
  errors: { [key: string]: string[] } | undefined,
  key: string,
  alternateKey?: string
): string | undefined => {
  if (errors === undefined) return undefined;
  if (errors[key] === undefined) return undefined;

  return errors[key]
    .map(r => {
      return capitalizeFirstLetter(alternateKey === undefined ? r : r.replace(key, alternateKey));
    })
    .join('. ');
};
export const hasError = (errors: { [key: string]: string[] } | undefined, key: string): boolean => {
  if (errors === undefined) return false;
  if (errors[key] === undefined) return false;

  return true;
};
