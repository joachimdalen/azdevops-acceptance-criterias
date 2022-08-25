export interface DevOpsError {
  name: string;
  status: number;
  responseText: string;
  serverError: {
    $id: string;
    innerException: any;
    message: string;
    typeName: string;
    typeKey: DevOpsErrorCodes;
    errorCode: number;
    eventId: number;
  };
  message: string;
}

export enum DevOpsErrorCodes {
  InvalidDocumentVersionException = 'InvalidDocumentVersionException',
  DocumentDoesNotExistException = 'DocumentDoesNotExistException'
}

export const knownDevOpsErros: { [key in DevOpsErrorCodes]: string } = {
  InvalidDocumentVersionException:
    'Failed to save changes due to the {section} being outdated. This can be due to someone else performing changes as the same time. Close the panel and try again',
  DocumentDoesNotExistException: 'Failed to find {section}'
};
