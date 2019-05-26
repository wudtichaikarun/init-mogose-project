import { conductorClient } from '../../config/conductor/index';

export default async () => {
  await conductorClient.registerWatcher(
    'close_task',
    async (data, updater) => {
      try {
        console.log(data.taskType, data.inputData);
        console.log('after inprogress -------->');
        console.log('data.inputData :: ', data.inputData);
        if (data.outputData) {
          console.log(
            'data.outputData :: ',
            data.outputData
          );
          console.log('--------------------');
        }

        await updater.fail({
          taskId: data.taskId,
          outputData: {
            date: Date.now(),
            reason: 'Cancel Workflow xxxxx'
          }
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
};
