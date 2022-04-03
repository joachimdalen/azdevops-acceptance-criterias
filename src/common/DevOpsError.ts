export interface DevOpsError {
  $id: string;
  innerException?: any;
  errorCode: number;
  eventId: number;
  message: string;
  typeKey: string;
  typeName: string;
}
