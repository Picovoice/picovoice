import { createHash } from 'crypto';

import { Picovoice, PicovoiceWorker } from '../';
import testData from './test_data.json';

// @ts-ignore
import picovoiceKeyword from './keyword_files/picovoice_wasm';
// @ts-ignore
import porcupineParams from './porcupine/porcupine_params';
// @ts-ignore
import coffeeMakerContext from './contexts/coffee_maker_wasm';
// @ts-ignore
import rhinoParams from './rhino/rhino_params';

import { PvModel } from '@picovoice/web-utils';
import { PorcupineKeyword } from '@picovoice/porcupine-web';
import { RhinoContext, RhinoInference } from '@picovoice/rhino-web';

const ACCESS_KEY: string = Cypress.env('ACCESS_KEY');

function delay(time: number) {
  return new Promise(resolve => setTimeout(resolve, time));
}

const runInitTest = async (
  instance: typeof Picovoice | typeof PicovoiceWorker,
  params: {
    accessKey?: string;
    keyword?: PorcupineKeyword;
    context?: RhinoContext;
    porcupineModel?: PvModel;
    rhinoModel?: PvModel;
    expectFailure?: boolean;
  } = {}
) => {
  const {
    accessKey = ACCESS_KEY,
    keyword = {
      publicPath: '/test/keyword_files/picovoice_wasm.ppn',
      forceWrite: true,
      label: 'picovoice',
    },
    context = {
      publicPath: '/test/contexts/coffee_maker_wasm.rhn',
      forceWrite: true,
    },
    porcupineModel = {
      publicPath: '/test/porcupine/porcupine_params.pv',
      forceWrite: true,
    },
    rhinoModel = {
      publicPath: '/test/rhino/rhino_params.pv',
      forceWrite: true,
    },
    expectFailure = false,
  } = params;

  let isFailed = false;

  try {
    const picovoice = await instance.create(
      accessKey,
      keyword,
      () => {},
      porcupineModel,
      context,
      () => {},
      rhinoModel
    );
    expect(picovoice.sampleRate).to.be.eq(16000);
    expect(typeof picovoice.version).to.eq('string');
    expect(picovoice.version.length).to.be.greaterThan(0);

    if (picovoice instanceof PicovoiceWorker) {
      picovoice.terminate();
    } else {
      await picovoice.release();
    }
  } catch (e) {
    if (expectFailure) {
      isFailed = true;
    } else {
      expect(e).to.be.undefined;
    }
  }

  if (expectFailure) {
    expect(isFailed).to.be.true;
  }
};

const runProcTest = async (
  instance: typeof Picovoice | typeof PicovoiceWorker,
  inputPcm: Int16Array,
  params: {
    accessKey?: string;
    keyword?: PorcupineKeyword;
    context?: RhinoContext;
    porcupineModel?: PvModel;
    rhinoModel?: PvModel;
  } = {},
  expectedContext?: any
) => {
  const {
    accessKey = ACCESS_KEY,
    keyword = {
      publicPath: '/test/keyword_files/picovoice_wasm.ppn',
      forceWrite: true,
      label: 'picovoice',
    },
    context = {
      publicPath: '/test/contexts/coffee_maker_wasm.rhn',
      forceWrite: true,
    },
    porcupineModel = {
      publicPath: '/test/porcupine/porcupine_params.pv',
      forceWrite: true,
    },
    rhinoModel = {
      publicPath: '/test/rhino/rhino_params.pv',
      forceWrite: true,
    },
  } = params;

  let keywordDetection = false;
  let inference: RhinoInference;

  const runProcess = () =>
    new Promise<void>(async (resolve, reject) => {
      const picovoice = await instance.create(
        accessKey,
        keyword,
        () => {
          keywordDetection = true;
        },
        porcupineModel,
        context,
        (rhinoInference: RhinoInference) => {
          if (keywordDetection && rhinoInference.isFinalized) {
            inference = rhinoInference;
            resolve();
          }
        },
        rhinoModel,
        {
          processErrorCallback: (error: string) => {
            reject(error);
          },
        }
      );

      for (
        let i = 0;
        i < inputPcm.length - picovoice.frameLength! + 1;
        i += picovoice.frameLength!
      ) {
        await picovoice.process(inputPcm.slice(i, i + picovoice.frameLength!));
        await delay(32);
      }

      await delay(1000);

      if (picovoice instanceof PicovoiceWorker) {
        picovoice.terminate();
      } else {
        await picovoice.release();
      }
    });

  try {
    await runProcess();
    expect(inference!.intent).to.deep.eq(expectedContext.intent);
    expect(inference!.slots).to.deep.eq(expectedContext.slots);
  } catch (e) {
    expect(e).to.be.undefined;
  }
};

describe('Picovoice Binding', function () {
  for (const instance of [Picovoice, PicovoiceWorker]) {
    const instanceString = instance === PicovoiceWorker ? 'worker' : 'main';

    it(`should be able to init with public path (${instanceString})`, () => {
      cy.wrap(null).then(async () => {
        await runInitTest(instance);
      });
    });

    it(`should be able to init with base64 (${instanceString})`, () => {
      cy.wrap(null).then(async () => {
        await runInitTest(instance, {
          keyword: {
            base64: picovoiceKeyword,
            forceWrite: true,
            label: picovoiceKeyword,
          },
          porcupineModel: { base64: porcupineParams, forceWrite: true },
          context: { base64: coffeeMakerContext, forceWrite: true },
          rhinoModel: { base64: rhinoParams, forceWrite: true },
        });
      });
    });

    it(`should be able to handle UTF-8 public path (${instanceString})`, () => {
      cy.wrap(null).then(async () => {
        await runInitTest(instance, {
          porcupineModel: {
            publicPath: '/test/porcupine/porcupine_params.pv',
            forceWrite: true,
            customWritePath: '테스트',
          },
          rhinoModel: {
            publicPath: '/test/rhino/rhino_params.pv',
            forceWrite: true,
            customWritePath: 'オレンジ',
          },
        });
      });
    });

    it(`should be able to handle invalid public path (${instanceString})`, () => {
      cy.wrap(null).then(async () => {
        await runInitTest(instance, {
          porcupineModel: { publicPath: 'invalid', forceWrite: true },
          expectFailure: true,
        });
      });
    });

    it(`should be able to handle invalid base64 (${instanceString})`, () => {
      cy.wrap(null).then(async () => {
        await runInitTest(instance, {
          rhinoModel: { base64: 'invalid', forceWrite: true },
          expectFailure: true,
        });
      });
    });

    it(`should be able to handle invalid access key (${instanceString})`, () => {
      cy.wrap(null).then(async () => {
        await runInitTest(instance, {
          accessKey: 'invalid',
          expectFailure: true,
        });
      });
    });

    it(`should be able to handle invalid sensitivity(${instanceString})`, () => {
      cy.wrap(null).then(async () => {
        await runInitTest(instance, {
          context: {
            publicPath: '/test/contexts/picovoice.rhn',
            forceWrite: true,
            sensitivity: -1,
          },
          expectFailure: true,
        });
      });
    });

    for (const testParam of testData.tests.parameters) {
      it(`should be able to process (${testParam.language}) (${instanceString})`, () => {
        try {
          const encodedAudioName = createHash('md5')
            .update(testParam.audio_file.replace('.wav', ''))
            .digest('hex');
          const suffix =
            testParam.language === 'en' ? '' : `_${testParam.language}`;
          cy.getFramesFromFile(`audio_samples/${encodedAudioName}.wav`).then(
            async pcm => {
              let keywordName = testParam.wakeword;
              let contextName = testParam.context_name;
              if (testParam.language !== 'en') {
                // Bug in Cypress means we can't read utf-8 file names, so we have to hash them
                keywordName = createHash('md5')
                  .update(testParam.wakeword)
                  .digest('hex');
                contextName = createHash('md5')
                  .update(testParam.context_name)
                  .digest('hex');
              }

              await runProcTest(
                instance,
                pcm,
                {
                  keyword: {
                    publicPath: `/test/keyword_files/${keywordName}_wasm.ppn`,
                    forceWrite: true,
                    label: testParam.wakeword,
                  },
                  porcupineModel: {
                    publicPath: `/test/porcupine/porcupine_params${suffix}.pv`,
                    forceWrite: true,
                  },
                  context: {
                    publicPath: `/test/contexts/${contextName}_wasm.rhn`,
                    forceWrite: true,
                  },
                  rhinoModel: {
                    publicPath: `/test/rhino/rhino_params${suffix}.pv`,
                    forceWrite: true,
                  },
                },
                testParam.inference
              );
            }
          );
        } catch (e) {
          expect(e).to.be.undefined;
        }
      });
    }
  }
});
