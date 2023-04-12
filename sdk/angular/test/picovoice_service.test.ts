import { PicovoiceService } from '../dist/picovoice-angular';

import porcupineParams from './porcupine/porcupine_params.js';
import rhinoParams from './rhino/rhino_params.js';
import picovoiceWakeWord from './keyword_files/picovoice_wasm.js';
import coffeeMakerContext from './contexts/coffee_maker_wasm.js';

import testData from './test_data.json';

const ACCESS_KEY = Cypress.env('ACCESS_KEY');

describe('Picovoice SDK', () => {
  it('should be able to init via public path', (done) => {
    let i = 0;
    const expected = [true, false];

    const picovoiceService = new PicovoiceService();

    cy.wrapFn(
      () => picovoiceService.init(
        ACCESS_KEY,
        { label: 'picovoice', publicPath: "./keyword_files/picovoice_wasm.ppn", forceWrite: true },
        { publicPath: "./porcupine/porcupine_params.pv", forceWrite: true },
        { publicPath: "./contexts/coffee_maker_wasm.rhn", forceWrite: true },
        { publicPath: "./rhino/rhino_params.pv", forceWrite: true }
      )
    );

    cy.wrapFn(
      () => picovoiceService.release()
    );

    picovoiceService.isLoaded$.subscribe(isLoaded => {
      expect(isLoaded).to.eq(expected[i++]);
      if (i == expected.length) {
        done();
      }
    });
  });

  it('should be able to init via base64', (done) => {
    const picovoiceService = new PicovoiceService();

    cy.wrapFn(
      () => picovoiceService.init(
        ACCESS_KEY,
        { label: 'picovoice', base64: picovoiceWakeWord, forceWrite: true },
        { base64: porcupineParams, forceWrite: true },
        { base64: coffeeMakerContext, forceWrite: true },
        { base64: rhinoParams, forceWrite: true }
      )
    );

    cy.wrapFn(
      () => picovoiceService.release()
    );

    picovoiceService.isLoaded$.subscribe(isLoaded => {
      expect(isLoaded).to.be.true;
      done();
    });
  });

  it('should show invalid model path error message', (done) => {
    const picovoiceService = new PicovoiceService();

    cy.wrapFn(
      () => picovoiceService.init(
        ACCESS_KEY,
        { label: 'picovoice', publicPath: "./keyword_files/picovoice_wasm.ppn", forceWrite: true },
        { publicPath: "./porcupine/porcupine_params_failed.pv", forceWrite: true },
        { publicPath: "./contexts/coffee_maker_wasm.rhn", forceWrite: true },
        { publicPath: "./rhino/rhino_params.pv", forceWrite: true }
      )
    );

    picovoiceService.isLoaded$.subscribe(isLoaded => {
      expect(isLoaded).to.be.false;
    });

    picovoiceService.error$.subscribe(error => {
      expect(error?.toString()).to.contain("Error response returned while fetching model from './porcupine/porcupine_params_failed.pv'");
      done();
    });
  });

  it('should show invalid access key error message', (done) => {
    const picovoiceService = new PicovoiceService();

    cy.wrapFn(
      () => picovoiceService.init(
        '',
        { label: 'picovoice', publicPath: "./keyword_files/picovoice_wasm.ppn", forceWrite: true },
        { publicPath: "./porcupine/porcupine_params.pv", forceWrite: true },
        { publicPath: "./contexts/coffee_maker_wasm.rhn", forceWrite: true },
        { publicPath: "./rhino/rhino_params.pv", forceWrite: true }
      )
    );

    picovoiceService.isLoaded$.subscribe(isLoaded => {
      expect(isLoaded).to.be.false;
    });

    picovoiceService.error$.subscribe(error => {
      expect(error?.toString()).to.contain("Invalid AccessKey");
      done();
    });
  });

  for (const testInfo of testData.tests.parameters) {
    it(`should be able to process audio (${testInfo.language})`, (done) => {
      const picovoiceService = new PicovoiceService();

      cy.wrapFn(
        () => picovoiceService.init(
          ACCESS_KEY,
          { label: testInfo.wakeword, publicPath: `./keyword_files/${testInfo.wakeword}_wasm.ppn`, forceWrite: true },
          { publicPath: `./porcupine/porcupine_params${testInfo.language === 'en' ? '' : '_' + testInfo.language}.pv`, forceWrite: true },
          { publicPath: `./contexts/${testInfo.context_name}_wasm.rhn`, forceWrite: true },
          { publicPath: `./rhino/rhino_params${testInfo.language === 'en' ? '' : '_' + testInfo.language}.pv`, forceWrite: true }
        )
      );

      cy.wrapFn(
        () => picovoiceService.start()
      );

      cy.mockRecording(
        `audio_samples/${testInfo.audio_file}`
      );

      cy.wrapFn(
        () => picovoiceService.stop()
      );

      cy.wrapFn(
        () => picovoiceService.release()
      );

      let i = 0;
      const expected = [true, false];

      picovoiceService.isLoaded$.subscribe(isLoaded => {
        if (!isLoaded) {
          done();
        }
      });

      picovoiceService.isListening$.subscribe(isListening => {
        if (i < expected.length) {
          expect(isListening).to.eq(expected[i++]);
        }
      });

      picovoiceService.inference$.subscribe(inference => {
        expect(inference?.intent).to.eq(testInfo.inference.intent);
        expect(inference?.slots).to.deep.eq(testInfo.inference.slots);
      });
    });
  }
});
