import ConductorClient from 'conductor-client';
import R from 'ramda';
import path from 'path';
import config from '../index';
import fileLoader from '../../utils/fileLoader';

export const conductorClient = new ConductorClient({
  baseURL: 'http://localhost:8080/api'
});

const taskDefs = [
  {
    name: 'start_task',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ['orderId'],
    outputKeys: ['tripId', 'orderId', 'status'],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: 'close_task',
    retryCount: 1,
    timeoutSeconds: 0,
    inputKeys: ['orderId', 'status'],
    outputKeys: ['tripId', 'orderId', 'date', 'status'],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 0,
    responseTimeoutSeconds: 1
  },
  {
    name: 'failure_task',
    retryCount: 1,
    timeoutSeconds: 0,
    inputKeys: ['orderId', 'status'],
    outputKeys: ['tripId', 'orderId', 'date', 'status'],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 0,
    responseTimeoutSeconds: 1
  }
];

const workflowDefs = [
  {
    name: 'failure_workflow',
    description: 'failure_workflow',
    version: 1,
    tasks: [
      {
        name: 'failure_task',
        taskReferenceName: 'failure_task',
        inputParameters: {
          data: '${workflow.input}'
        },
        type: 'SIMPLE',
        startDelay: 0,
        optional: false
      }
    ],
    inputParameters: [],
    schemaVersion: 2
  },
  {
    name: 'start_task_demo',
    description: 'start_task_demo',
    version: 1,
    tasks: [
      {
        name: 'start_task',
        taskReferenceName: 'start_task',
        inputParameters: {
          orderId: '${workflow.input.orderId}'
        },
        type: 'SIMPLE',
        startDelay: 0,
        optional: false
      },
      {
        name: 'close_task',
        taskReferenceName: 'close_task',
        inputParameters: {
          orderId: '${workflow.input.orderId}',
          tripId: '${start_task.output.tripId}',
          status: '${start_task.output.status}'
        },
        type: 'SIMPLE',
        startDelay: 0,
        optional: false
      }
    ],
    inputParameters: ['orderId'],
    failureWorkflow: 'failure_workflow',
    schemaVersion: 2
  }
];

export default async dirname => {
  try {
    if (config.env === 'staging') {
      // TERMINATED WORKFLOW
      const workflowList = await conductorClient.getRunningWorkflows(
        'start_task_demo'
      );
      const workflowFailureList = await conductorClient.getRunningWorkflows(
        'failure_workflow'
      );
      await Promise.all([
        R.path(['data'], workflowList).map(
          async workflow => {
            conductorClient.terminateWorkflow(workflow);
          }
        ),
        R.path(['data'], workflowFailureList).map(
          async workflow => {
            conductorClient.terminateWorkflow(workflow);
          }
        )
      ]);

      await conductorClient.registerTaskDefs(taskDefs);

      await conductorClient.updateWorkflowDefs(
        workflowDefs
      );

      const initialWorker = fileLoader(
        path.resolve(dirname, 'services'),
        'worker'
      );
      const workerKeys = R.keys(initialWorker);
      await Promise.all(
        workerKeys.map(key => initialWorker[key].default())
      );
    }
  } catch (error) {
    throw error;
  }
};
