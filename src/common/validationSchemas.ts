import * as yup from 'yup';

import { CriteriaTypes } from '../common/types';

export const getSchema = (type: CriteriaTypes, approverRequired = false): yup.ObjectSchema<any> => {
  const baseSchema = yup.object().shape({
    title: yup.string().required().min(4).max(300),
    requiredApprover: approverRequired
      ? yup.object().required('Required approver must be defined. Configured by policy')
      : yup.object()
  });

  switch (type) {
    case 'checklist': {
      return baseSchema.concat(
        yup.object().shape({
          checklist: yup.object().shape({
            criterias: yup
              .array()
              .of(
                yup.object().shape({
                  text: yup.string().required().min(4)
                })
              )
              .min(1)
          })
        })
      );
    }
    case 'scenario': {
      return baseSchema.concat(
        yup.object().shape({
          scenario: yup.object().shape({
            scenario: yup.string().required().min(4),
            criterias: yup
              .array()
              .of(
                yup.object().shape({
                  text: yup.string().required().min(4)
                })
              )
              .min(1)
          })
        })
      );
    }
    case 'text': {
      return baseSchema.concat(
        yup.object().shape({
          text: yup
            .object()
            .shape({
              description: yup.string().required().min(4)
            })
            .required()
        })
      );
    }
  }
};
