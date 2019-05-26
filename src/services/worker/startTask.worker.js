import R from 'ramda';
import { info, error } from 'graylog-koa-client';
import { conductorClient } from '../../config/conductor/index';

export default async () => {
  await conductorClient.registerWatcher(
    'start_task',
    (data, updater) => {
      try {
        console.log('>>>>-------start_task----------');
        updater.complete({
          outputData: {
            ...data.inputData,
            status: 'START_COMPLETED',
            tripId: 'TRE_111111'
          }
        });
        info('start_task', {
          taskType: 'start_task',
          orderId: data.inputData.orderId,
          taskId: data.taskId,
          workflowId: data.workflowInstanceId,
          taskStatus: 'START_COMPLETED'
        });
      } catch (error) {
        console.log(error);
      }
    },
    { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
    true
  );

  await conductorClient.registerWatcher(
    'close_task',
    async (data, updater) => {
      try {
        console.log(
          `>>>-----retryCount=${data.retryCount + 1}-------`
        );
        console.log(data);
        console.log('------------------------');

        await updater.fail({
          taskId: data.taskId,
          outputData: {
            date: Date.now(),
            status: [
              data.inputData.status,
              'DOSOMETING_FAILED'
            ],
            reason: 'Cancel Workflow xxxxx'
          }
        });
        error('close_task', {
          taskType: 'close_task',
          taskId: data.taskId,
          workflowId: data.workflowInstanceId,
          taskStatus: 'DOSOMETING_FAILED'
        });
        // await updater.inprogress({
        //   outputData: { ...data.inputData },
        //   callbackAfterSeconds: 1
        // });
      } catch (error) {
        console.log('error :: ', error);
      }
    },
    { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
    true
  );

  await conductorClient.registerWatcher(
    'failure_task',
    async (data, updater) => {
      console.log('>>>-------failure_task----------');
      try {
        const getCurrentState = await conductorClient.getWorkflow(
          data.inputData.data.workflowId,
          true
        );
        // console.log(
        //   'TCL: getCurrentState',
        //   getCurrentState
        // );
        const getTaskData = R.pipe(
          R.path(['data', 'tasks']),
          R.last
        )(getCurrentState);

        // console.log(data.taskType, data.inputData);
        updater.complete({
          outputData: {
            ...getTaskData.outputData,
            referenceTaskName:
              getTaskData.referenceTaskName,
            date: Date.now()
          }
        });
        error('failure_task', {
          taskType: 'failure_task',
          taskId: data.taskId,
          workflowId: data.workflowInstanceId,
          taskStatus: 'FAILURE_TASK'
        });
      } catch (error) {
        console.log('error :: ', error);
      }
    },
    { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
    true
  );
};
