#
# Copyright 2020-2023 Picovoice Inc.
#
# You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
# file accompanying this source.
#
# Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
# an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.
#
import os
from typing import Callable, Optional, Sequence

import pvporcupine
import pvrhino


class PicovoiceError(Exception):
    pass


class PicovoiceMemoryError(PicovoiceError):
    pass


class PicovoiceIOError(PicovoiceError):
    pass


class PicovoiceInvalidArgumentError(PicovoiceError):
    pass


class PicovoiceStopIterationError(PicovoiceError):
    pass


class PicovoiceKeyError(PicovoiceError):
    pass


class PicovoiceInvalidStateError(PicovoiceError):
    pass


class PicovoiceRuntimeError(PicovoiceError):
    pass


class PicovoiceActivationError(PicovoiceError):
    pass


class PicovoiceActivationLimitError(PicovoiceError):
    pass


class PicovoiceActivationThrottledError(PicovoiceError):
    pass


class PicovoiceActivationRefusedError(PicovoiceError):
    pass


_PPN_RHN_ERROR_TO_PICOVOICE_ERROR = {
    pvporcupine.PorcupineError: PicovoiceError,
    pvrhino.RhinoError: PicovoiceError,
    pvporcupine.PorcupineMemoryError: PicovoiceMemoryError,
    pvrhino.RhinoMemoryError: PicovoiceMemoryError,
    pvporcupine.PorcupineIOError: PicovoiceIOError,
    pvrhino.RhinoIOError: PicovoiceIOError,
    pvporcupine.PorcupineInvalidArgumentError: PicovoiceInvalidArgumentError,
    pvrhino.RhinoInvalidArgumentError: PicovoiceInvalidArgumentError,
    pvporcupine.PorcupineStopIterationError: PicovoiceStopIterationError,
    pvrhino.RhinoStopIterationError: PicovoiceStopIterationError,
    pvporcupine.PorcupineKeyError: PicovoiceKeyError,
    pvrhino.RhinoKeyError: PicovoiceKeyError,
    pvporcupine.PorcupineInvalidStateError: PicovoiceInvalidStateError,
    pvrhino.RhinoInvalidStateError: PicovoiceInvalidStateError,
    pvporcupine.PorcupineRuntimeError: PicovoiceRuntimeError,
    pvrhino.RhinoRuntimeError: PicovoiceRuntimeError,
    pvporcupine.PorcupineActivationError: PicovoiceActivationError,
    pvrhino.RhinoActivationError: PicovoiceActivationError,
    pvporcupine.PorcupineActivationLimitError: PicovoiceActivationLimitError,
    pvrhino.RhinoActivationLimitError: PicovoiceActivationLimitError,
    pvporcupine.PorcupineActivationThrottledError: PicovoiceActivationThrottledError,
    pvrhino.RhinoActivationThrottledError: PicovoiceActivationThrottledError,
    pvporcupine.PorcupineActivationRefusedError: PicovoiceActivationRefusedError,
    pvrhino.RhinoActivationRefusedError: PicovoiceActivationRefusedError,
}


class Picovoice(object):
    """
    Python binding for Picovoice end-to-end platform. Picovoice enables building voice experiences similar to Alexa but
    runs entirely on-device (offline).

    Picovoice detects utterances of a customizable wake word (phrase) within an incoming stream of audio in real-time.
    After detection of wake word, it begins to infer the user's intent from the follow-on spoken command. Upon detection
    of wake word and completion of voice command, it invokes user-provided callbacks to signal these events.

    Picovoice processes incoming audio in consecutive frames. The number of samples per frame is
    `.frame_length`. The incoming audio needs to have a sample rate equal to `.sample_rate` and be 16-bit
    linearly-encoded. Picovoice operates on single-channel audio. It uses Porcupine wake word engine for wake word
    detection and Rhino Speech-to-Intent engine for intent inference.
    """

    def __init__(
            self,
            access_key: str,
            keyword_path: str,
            wake_word_callback: Callable[[], None],
            context_path: str,
            inference_callback: Callable[[pvrhino.Inference], None],
            porcupine_library_path: Optional[str] = None,
            porcupine_model_path: Optional[str] = None,
            porcupine_sensitivity: float = 0.5,
            rhino_library_path: Optional[str] = None,
            rhino_model_path: Optional[str] = None,
            rhino_sensitivity: float = 0.5,
            endpoint_duration_sec: float = 1.,
            require_endpoint: bool = True):
        """
        Constructor.

        :param access_key: AccessKey obtained from Picovoice Console (https://console.picovoice.ai/).
        :param keyword_path: Absolute path to Porcupine's keyword model file.
        :param wake_word_callback: User-defined callback invoked upon detection of the wake phrase. The callback accepts
        no input arguments.
        :param context_path: Absolute path to file containing context parameters. A context represents the set of
        expressions (spoken commands), intents, and intent arguments (slots) within a domain of interest.
        :param inference_callback: User-defined callback invoked upon completion of intent inference. The callback
        accepts a single input argument of type `Inference` that exposes the following immutable fields:
        (1) `is_understood` is a flag indicating if the spoken command is understood.
        (2) `intent` is the inferred intent from the voice command. If the command is not understood then it's set to
        `None`.
        (3) `slots` is a dictionary mapping slot keys to their respective values. If the command is not understood then
        it's set to an empty dictionary.
        :param porcupine_library_path: Absolute path to Porcupine's dynamic library.
        :param porcupine_model_path: Absolute path to the file containing Porcupine's model parameters.
        :param porcupine_sensitivity: Wake word detection sensitivity. It should be a number within [0, 1]. A higher
        sensitivity results in fewer misses at the cost of increasing the false alarm rate.
        :param rhino_library_path: Absolute path to Rhino's dynamic library.
        :param rhino_model_path: Absolute path to the file containing Rhino's model parameters.
        :param rhino_sensitivity: Inference sensitivity. It should be a number within [0, 1]. A higher sensitivity value
        results in fewer misses at the cost of (potentially) increasing the erroneous inference rate.
        :param endpoint_duration_sec: Endpoint duration in seconds. An endpoint is a chunk of silence at the end of an
        utterance that marks the end of spoken command. It should be a positive number within [0.5, 5]. A lower endpoint
        duration reduces delay and improves responsiveness. A higher endpoint duration assures Rhino doesn't return
        inference pre-emptively in case the user pauses before finishing the request.
        require_endpoint: If set to `True`, Rhino requires an endpoint (a chunk of silence) after the spoken command.
        If set to `False`, Rhino tries to detect silence, but if it cannot, it still will provide inference regardless.
        Set to `False` only if operating in an environment with overlapping speech (e.g. people talking in the
        background).
        """

        if not access_key:
            raise ValueError("access_key should be a non-empty string.")

        if not os.path.exists(keyword_path):
            raise ValueError("Couldn't find Porcupine's keyword file at '%s'." % keyword_path)

        if not callable(wake_word_callback):
            raise ValueError("Invalid wake word callback.")

        if not os.path.exists(context_path):
            raise ValueError("Couldn't find Rhino's context file at '%s'." % context_path)

        if not callable(inference_callback):
            raise ValueError("Invalid inference callback.")

        if porcupine_library_path is not None and not os.path.exists(porcupine_library_path):
            raise ValueError("Couldn't find Porcupine's dynamic library at '%s'." % porcupine_library_path)

        if porcupine_model_path is not None and not os.path.exists(porcupine_model_path):
            raise ValueError("Couldn't find Porcupine's model file at '%s'." % porcupine_model_path)

        if not 0 <= porcupine_sensitivity <= 1:
            raise ValueError("Porcupine's sensitivity should be within [0, 1].")

        if rhino_library_path is not None and not os.path.exists(rhino_library_path):
            raise ValueError("Couldn't find Rhino's dynamic library at '%s'." % rhino_library_path)

        if rhino_model_path is not None and not os.path.exists(rhino_model_path):
            raise ValueError("Couldn't find Rhino's model file at '%s'." % rhino_model_path)

        if not 0 <= rhino_sensitivity <= 1:
            raise ValueError("Rhino's sensitivity should be within [0, 1]")

        if not 0.5 <= endpoint_duration_sec <= 5.:
            raise ValueError("Endpoint duration should be within [0.5, 5]")

        try:
            self._porcupine = pvporcupine.create(
                access_key=access_key,
                library_path=porcupine_library_path,
                model_path=porcupine_model_path,
                keyword_paths=[keyword_path],
                sensitivities=[porcupine_sensitivity])
        except pvporcupine.PorcupineError as e:
            raise _PPN_RHN_ERROR_TO_PICOVOICE_ERROR[type(e)] from e

        self._wake_word_callback = wake_word_callback

        self._is_wake_word_detected = False

        try:
            self._rhino = pvrhino.create(
                access_key=access_key,
                library_path=rhino_library_path,
                model_path=rhino_model_path,
                context_path=context_path,
                sensitivity=rhino_sensitivity,
                endpoint_duration_sec=endpoint_duration_sec,
                require_endpoint=require_endpoint)
        except pvrhino.RhinoError as e:
            raise _PPN_RHN_ERROR_TO_PICOVOICE_ERROR[type(e)] from e

        self._inference_callback = inference_callback

        assert self._porcupine.sample_rate == self._rhino.sample_rate
        self._sample_rate = self._porcupine.sample_rate

        assert self._porcupine.frame_length == self._rhino.frame_length
        self._frame_length = self._porcupine.frame_length

    def delete(self):
        """Releases resources acquired."""

        self._porcupine.delete()
        self._rhino.delete()

    def process(self, pcm: Sequence[int]) -> None:
        """
        Processes a frame of the incoming audio stream. Upon detection of wake word and completion of follow-on command
        inference invokes user-defined callbacks.

        :param pcm: A frame of audio samples. The number of samples per frame can be attained by calling
        `.frame_length`. The incoming audio needs to have a sample rate equal to `.sample_rate` and be 16-bit
        linearly-encoded. Picovoice operates on single-channel audio.
        """

        if len(pcm) != self.frame_length:
            raise ValueError("Invalid frame length. expected %d but received %d" % (self.frame_length, len(pcm)))

        if not self._is_wake_word_detected:
            try:
                self._is_wake_word_detected = self._porcupine.process(pcm) == 0
                if self._is_wake_word_detected:
                    self._wake_word_callback()
            except pvporcupine.PorcupineError as e:
                raise _PPN_RHN_ERROR_TO_PICOVOICE_ERROR[type(e)] from e
        else:
            try:
                is_finalized = self._rhino.process(pcm)
                if is_finalized:
                    self._is_wake_word_detected = False
                    inference = self._rhino.get_inference()
                    self._inference_callback(inference)
            except pvrhino.RhinoError as e:
                raise _PPN_RHN_ERROR_TO_PICOVOICE_ERROR[type(e)] from e

    def reset(self) -> None:
        """
        Resets the internal state of Picovoice. It should be called before processing a new stream of audio
        or when Picovoice was stopped whilst processing a stream of audio.
        """
        try:
            self._is_wake_word_detected = False
            self._rhino.reset()
        except pvrhino.RhinoError as e:
            raise _PPN_RHN_ERROR_TO_PICOVOICE_ERROR[type(e)] from e

    @property
    def sample_rate(self) -> int:
        """Audio sample rate accepted by Picovoice."""

        return self._sample_rate

    @property
    def frame_length(self) -> int:
        """Number of audio samples per frame."""

        return self._frame_length

    @property
    def version(self) -> str:
        """Version"""

        return '3.0.0'

    @property
    def context_info(self) -> str:
        """Context information."""

        return self._rhino.context_info

    def __str__(self):
        return 'Picovoice %s {Porcupine %s, Rhino %s}' % (self.version, self._porcupine.version, self._rhino.version)


__all__ = [
    'Picovoice',
    'PicovoiceError',
    'PicovoiceMemoryError',
    'PicovoiceIOError',
    'PicovoiceInvalidArgumentError',
    'PicovoiceStopIterationError',
    'PicovoiceKeyError',
    'PicovoiceInvalidStateError',
    'PicovoiceRuntimeError',
    'PicovoiceActivationError',
    'PicovoiceActivationLimitError',
    'PicovoiceActivationThrottledError',
    'PicovoiceActivationRefusedError'
]
