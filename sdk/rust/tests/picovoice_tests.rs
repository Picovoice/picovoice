/*
    Copyright 2021 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

#[cfg(test)]
mod tests {
    use std::collections::HashMap;
    use std::convert::TryInto;
    use std::fs::File;
    use std::io::BufReader;
    use std::io::Read;
    use std::sync::{Arc, Mutex};

    use picovoice::{rhino::RhinoInference, Picovoice, PicovoiceBuilder};

    fn do_test<W: FnMut(), I: FnMut(RhinoInference)>(
        picovoice: &mut Picovoice<W, I>,
        is_wake_word_detected: Arc<Mutex<bool>>,
        detected_inference: Arc<Mutex<Option<RhinoInference>>>,
    ) {
        {
            // Reset test asserts in block expression to drop mutex locks before processing
            let mut is_wake_word_detected = is_wake_word_detected.lock().unwrap();
            let mut detected_inference = detected_inference.lock().unwrap();
            *is_wake_word_detected = false;
            *detected_inference = None;
        }

        let testfile = "../../resources/audio_samples/picovoice-coffee.wav";
        let mut reader = BufReader::new(File::open(testfile).unwrap());
        reader.seek_relative(44).unwrap(); // Skip .wav header

        let i16_size = std::mem::size_of::<i16>();
        let frame_length_bytes = picovoice.frame_length() as usize * i16_size;

        let mut frame_buffer = vec![0u8; frame_length_bytes];
        while let Ok(_) = reader.read_exact(&mut frame_buffer) {
            let frame_samples: Vec<i16> = frame_buffer
                .chunks(i16_size)
                .map(|i16_slice| {
                    i16::from_le_bytes(i16_slice.try_into().expect("Incorrect i16 slice size"))
                })
                .collect();
            picovoice.process(&frame_samples).unwrap();
        }

        assert_eq!(*is_wake_word_detected.lock().unwrap(), true);

        let locked_inference = detected_inference.lock().unwrap();
        let inference = locked_inference
            .as_ref()
            .expect("Inference callback not called");
        assert_eq!(inference.is_understood, true);
        assert_eq!(inference.intent.as_ref().unwrap(), "orderBeverage");

        let mut expected_slot_values = HashMap::new();
        expected_slot_values.insert(String::from("beverage"), String::from("coffee"));
        expected_slot_values.insert(String::from("size"), String::from("large"));
        assert_eq!(inference.slots, expected_slot_values);
    }

    #[test]
    fn test_process() {
        let keyword_path =
            "../../resources/porcupine/resources/keyword_files/linux/picovoice_linux.ppn";
        let context_path = "../../resources/rhino/resources/contexts/linux/coffee_maker_linux.rhn";

        let is_wake_word_detected = Arc::new(Mutex::new(false));
        let detected_inference = Arc::new(Mutex::new(None));

        let wake_word_callback = || {
            if let Ok(mut is_wake_word_detected) = is_wake_word_detected.lock() {
                *is_wake_word_detected = true;
            }
        };
        let inference_callback = |inference| {
            if let Ok(mut detected_inference) = detected_inference.lock() {
                *detected_inference = Some(inference);
            }
        };
        let mut picovoice = PicovoiceBuilder::new(
            keyword_path,
            wake_word_callback,
            context_path,
            inference_callback,
        )
        .init()
        .expect("Failed to init Picovoice");

        do_test(
            &mut picovoice,
            is_wake_word_detected.clone(),
            detected_inference.clone(),
        );

        do_test(
            &mut picovoice,
            is_wake_word_detected.clone(),
            detected_inference.clone(),
        );
    }
}
