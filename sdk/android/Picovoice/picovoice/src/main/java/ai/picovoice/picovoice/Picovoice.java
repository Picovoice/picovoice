/*
    Copyright 2020 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is
    located in the "LICENSE" file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the
    License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
    express or implied. See the License for the specific language governing permissions and
    limitations under the License.
*/

package ai.picovoice.picovoice;

import ai.picovoice.porcupine.Porcupine;
import ai.picovoice.porcupine.PorcupineException;
import ai.picovoice.rhino.Rhino;
import ai.picovoice.rhino.RhinoException;

public class Picovoice {
    final private Porcupine porcupine;
    final private PicovoiceWakeWordCallback wakeWordCallback;
    private boolean isWakeWordDetected = false;
    final private Rhino rhino;
    final private PicovoiceInferenceCallback inferenceCallback;

    public Picovoice(
            String porcupineModelPath,
            String keywordPath,
            float porcupineSensitivity,
            PicovoiceWakeWordCallback wakeWordCallback,
            String rhinoModelPath,
            String contextPath,
            float rhinoSensitivity,
            PicovoiceInferenceCallback inferenceCallback) throws PicovoiceException {
        try {
            porcupine = new Porcupine(porcupineModelPath, keywordPath, porcupineSensitivity);
            this.wakeWordCallback = wakeWordCallback;
            rhino = new Rhino(rhinoModelPath, contextPath, rhinoSensitivity);
            this.inferenceCallback = inferenceCallback;
        } catch (PorcupineException | RhinoException e) {
            throw new PicovoiceException(e);
        }
    }

    public void delete() {
        porcupine.delete();
        rhino.delete();
    }

    public void process(short[] pcm) throws PicovoiceException {
        try {
            if (!isWakeWordDetected) {
                isWakeWordDetected = (porcupine.process(pcm) == 0);
                if (isWakeWordDetected) {
                    wakeWordCallback.invoke();
                }
            } else {
                if (rhino.process(pcm)) {
                    inferenceCallback.invoke(rhino.getInference());
                    isWakeWordDetected = false;
                }
            }
        } catch (PorcupineException | RhinoException e) {
            throw new PicovoiceException(e);
        }
    }

    public String getVersion() {
        return "1.0.0";
    }

    public int getFrameLength() {
        return rhino.getFrameLength();
    }

    public int getSampleRate() {
        return porcupine.getSampleRate();
    }
}
