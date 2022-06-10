import { WebLogger } from '@joachimdalen/azdevops-ext-core/WebLogger';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { FormItem } from 'azure-devops-ui/FormItem';
import { MessageCard, MessageCardSeverity } from 'azure-devops-ui/MessageCard';

import ApproverDisplay from '../common/components/ApproverDisplay';
import StatusTag from '../common/components/StatusTag';
import { isCompleted, isProcessed } from '../common/criteriaUtils';
import CriteriaService from '../common/services/CriteriaService';
import {
  AcceptanceCriteriaState,
  CriteriaDetailDocument,
  IAcceptanceCriteria,
  ProcessEvent
} from '../common/types';
import ChecklistCriteriaViewSection from './components/checklist/ChecklistCriteriaViewSection';
import CompletedProcessContainer from './components/CompletedProcessContainer';
import CompletionContainer from './components/CompletionContainer';
import ProcessingContainer from './components/ProcessingContainer';
import RejectionProcessContainer from './components/RejectionProcessContainer';
import ScenarioCriteriaViewSection from './components/scenario/ScenarioCriteriaViewSection';
import TextCriteriaViewSection from './components/text/TextCriteriaViewSection';

interface ReadOnlyViewProps {
  workItemId?: string;
  criteria: IAcceptanceCriteria;
  details?: CriteriaDetailDocument;
  criteriaService: CriteriaService;
  onDataChange: (criteria: IAcceptanceCriteria, details?: CriteriaDetailDocument) => void;
  canApproveCriteria: boolean;
}

const ReadOnlyView = ({
  criteria,
  details,
  criteriaService,
  workItemId,
  onDataChange,
  canApproveCriteria
}: ReadOnlyViewProps): JSX.Element => {
  async function processCriteria(id: string, approve: ProcessEvent, comment?: string) {
    if (workItemId && parseInt(workItemId) > 0) {
      const result = await criteriaService.processCriteria(workItemId, id, approve, comment);
      if (result !== undefined) {
        // toggleWasChanged(true);
        onDataChange(result.criteria, result.details);
      }
    } else {
      WebLogger.error('Precondition failed');
    }
  }

  async function processCheckListCriteria(id: string, complete: boolean) {
    if (workItemId && parseInt(workItemId) > 0 && criteria?.id) {
      const result = await criteriaService.processCheckListCriteria(
        workItemId,
        criteria?.id,
        id,
        complete
      );
      if (result !== undefined && result.criteria !== undefined) {
        onDataChange(result.criteria, result.details);

        // if (result.criteria) {
        //   await checkApproval(result.criteria);
        // }
      }
    } else {
      WebLogger.error('Precondition failed ' + workItemId, criteria?.id);
    }
  }
  return (
    <>
      <div className="rhythm-vertical-16 flex-grow border-bottom-light padding-bottom-16">
        {/* <ConditionalChildren
          renderChildren={
            isCompleted(criteria) &&
            editAfterComplete === false &&
            canEdit &&
            criteria.state !== AcceptanceCriteriaState.Rejected
          }
        >
          <MessageCard
            className="flex-self-stretch"
            severity={MessageCardSeverity.Warning}
            buttonProps={[
              {
                text: 'Edit',
                onClick: () => {
                  toggleEditAfterComplete();
                  setIsReadOnly(false);
                }
              }
            ]}
          >
            {`This criteria has already been ${criteria.state}. You can still edit it, but it may reset history and progress.`}
          </MessageCard>
        </ConditionalChildren> */}
        <div className="flex-row rhythm-horizontal-8">
          <FormItem label="Required Approver" className="flex-grow">
            <ApproverDisplay approver={criteria?.requiredApprover} large />
          </FormItem>
          <ConditionalChildren renderChildren={isProcessed(criteria, details)}>
            <FormItem
              label={
                criteria.state === AcceptanceCriteriaState.Approved ? 'Approved by' : 'Rejected by'
              }
              className="flex-grow"
            >
              <ApproverDisplay approver={details?.processed?.processedBy} large />
            </FormItem>
          </ConditionalChildren>
          <FormItem label="State" className="flex-grow">
            <StatusTag state={criteria.state} />
          </FormItem>
        </div>
        <ConditionalChildren
          renderChildren={details?.latestComment !== undefined && isCompleted(criteria)}
        >
          <FormItem label="Latest Comment" className="flex-grow">
            {details?.latestComment}
          </FormItem>
        </ConditionalChildren>
      </div>
      <ConditionalChildren
        renderChildren={
          canApproveCriteria &&
          workItemId !== undefined &&
          criteria.state === AcceptanceCriteriaState.AwaitingApproval
        }
      >
        <ProcessingContainer processCriteria={processCriteria} criteriaId={criteria.id} />
      </ConditionalChildren>
      <ConditionalChildren renderChildren={criteria.state === AcceptanceCriteriaState.Rejected}>
        <RejectionProcessContainer
          criteriaId={criteria.id}
          onProcess={async (criteriaId: string, action: ProcessEvent) => {
            await criteriaService.toggleCompletion(criteriaId, action);
          }}
        />
      </ConditionalChildren>
      <ConditionalChildren
        renderChildren={
          criteria.state === AcceptanceCriteriaState.Completed ||
          criteria.state === AcceptanceCriteriaState.Approved
        }
      >
        <CompletedProcessContainer
          criteriaId={criteria.id}
          onProcess={async (criteriaId: string, action: ProcessEvent) => {
            await criteriaService.toggleCompletion(criteriaId, action);
          }}
        />
      </ConditionalChildren>
      <ConditionalChildren
        renderChildren={
          criteria.state === AcceptanceCriteriaState.New &&
          (criteria.type !== 'checklist' ||
            (criteria.type === 'checklist' &&
              details?.checklist?.criterias?.every(x => x.completed)))
        }
      >
        <CompletionContainer
          criteria={criteria}
          onComplete={async (criteriaId: string) => {
            await criteriaService.toggleCompletion(criteriaId, ProcessEvent.Complete);
          }}
        />
      </ConditionalChildren>
      <ConditionalChildren renderChildren={criteria.type === 'scenario' && details !== undefined}>
        {details?.scenario && <ScenarioCriteriaViewSection details={details} />}
      </ConditionalChildren>
      <ConditionalChildren renderChildren={criteria.type === 'text' && details !== undefined}>
        {details?.text && <TextCriteriaViewSection details={details} />}
      </ConditionalChildren>
      <ConditionalChildren renderChildren={criteria.type === 'checklist' && details !== undefined}>
        {details?.checklist && (
          <ChecklistCriteriaViewSection
            isCompleted={
              isCompleted(criteria) || criteria.state === AcceptanceCriteriaState.AwaitingApproval
            }
            details={details}
            processItem={processCheckListCriteria}
          />
        )}
      </ConditionalChildren>
    </>
  );
};

export default ReadOnlyView;
