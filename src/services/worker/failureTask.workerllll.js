import { conductorClient } from '../../config/conductor/index';

export default async () => {
  await conductorClient.registerWatcher(
    'failure_task',
    async (data, updater) => {
      try {
        const getCurrentState = await conductorClient.getWorkflow(
          data.inputData.data.workflowId,
          true
        );
        console.log(
          'TCL: getCurrentState',
          getCurrentState
        );
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
      } catch (error) {
        console.log('error :: ', error);
      }
    },
    { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
    true
  );
};
