/*
    Copyright 2021-2023 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

#[cfg(test)]
mod tests {
    use serde_json::Value;
    use std::collections::HashMap;
    use std::convert::TryInto;
    use std::env;
    use std::fs::{read_to_string, File};
    use std::io::BufReader;
    use std::io::Read;
    use std::sync::{Arc, Mutex};

    use picovoice::porcupine::util::pv_platform;
    use picovoice::{rhino::RhinoInference, Picovoice, PicovoiceBuilder};

    fn load_test_data() -> Value {
        let test_json_path = format!(
            "{}{}",
            env!("CARGO_MANIFEST_DIR"),
            "/../../resources/.test/test_data.json"
        );
        let contents: String =
            read_to_string(test_json_path).expect("Unable to read test_data.json");
        let test_json: Value =
            serde_json::from_str(&contents).expect("Unable to parse test_data.json");
        test_json
    }

    fn append_lang(path: &str, language: &str) -> String {
        if language == "en" {
            String::from(path)
        } else {
            format!("{path}_{language}")
        }
    }

    fn porcupine_model_path_by_language(language: &str) -> String {
        format!(
            "{}{}{}",
            env!("CARGO_MANIFEST_DIR"),
            append_lang(
                "/../../resources/porcupine/lib/common/porcupine_params",
                language
            ),
            ".pv"
        )
    }

    fn rhino_model_path_by_language(language: &str) -> String {
        format!(
            "{}{}{}",
            env!("CARGO_MANIFEST_DIR"),
            append_lang("/../../resources/rhino/lib/common/rhino_params", language),
            ".pv"
        )
    }

    fn keyword_path_by_language(keyword_file: &str, language: &str) -> String {
        format!(
            "{}{}/{}/{}_{}.ppn",
            env!("CARGO_MANIFEST_DIR"),
            append_lang(
                "/../../resources/porcupine/resources/keyword_files",
                language
            ),
            pv_platform(),
            keyword_file,
            pv_platform()
        )
    }

    fn context_path_by_language(context: &str, language: &str) -> String {
        format!(
            "{}{}/{}/{}_{}.rhn",
            env!("CARGO_MANIFEST_DIR"),
            append_lang("/../../resources/rhino/resources/contexts", language),
            pv_platform(),
            context,
            pv_platform()
        )
    }

    fn run_picovoice_test(
        language: &str,
        keyword: &str,
        context: &str,
        intent: &str,
        slots: HashMap<String, String>,
        audio_file_name: &str,
    ) {
        let access_key = env::var("PV_ACCESS_KEY")
            .expect("Pass the AccessKey in using the PV_ACCESS_KEY env variable");

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
            access_key,
            keyword_path_by_language(keyword, language),
            wake_word_callback,
            context_path_by_language(context, language),
            inference_callback,
        )
        .porcupine_model_path(porcupine_model_path_by_language(language))
        .rhino_model_path(rhino_model_path_by_language(language))
        .init()
        .expect("Failed to init Picovoice");

        let soundfile_path = format!(
            "{}{}{}",
            env!("CARGO_MANIFEST_DIR"),
            "/../../resources/audio_samples/",
            audio_file_name
        );

        let mut reader = BufReader::new(File::open(&soundfile_path).unwrap());
        reader.seek_relative(44).unwrap(); // Skip .wav header

        let i16_size = std::mem::size_of::<i16>();
        let frame_length_bytes = picovoice.frame_length() as usize * i16_size;

        let mut frame_buffer = vec![0u8; frame_length_bytes];
        while reader.read_exact(&mut frame_buffer).is_ok() {
            let frame_samples: Vec<i16> = frame_buffer
                .chunks(i16_size)
                .map(|i16_slice| {
                    i16::from_le_bytes(i16_slice.try_into().expect("Incorrect i16 slice size"))
                })
                .collect();
            picovoice.process(&frame_samples).unwrap();
        }

        assert_eq!(
            *is_wake_word_detected.lock().unwrap(),
            true,
            "`{language}` wakeword not detected for keyword `{keyword}` context `{context}`"
        );

        let locked_inference = detected_inference.lock().unwrap();
        let inference = locked_inference
            .as_ref()
            .expect("Inference callback not called");
        assert_eq!(
            inference.is_understood, true,
            "`{language}` is_understood failed for keyword `{keyword}` context `{context}`"
        );
        assert_eq!(
            inference.intent.as_ref().unwrap(),
            intent,
            "`{language}` intent failed for keyword `{keyword}` context `{context}`"
        );
        assert_eq!(
            inference.slots, slots,
            "`{language}` slots failed for keyword `{keyword}` context `{context}`"
        );
    }

    #[test]
    fn test_parameters() {
        let test_json: Value = load_test_data();

        for t in test_json["tests"]["parameters"].as_array().unwrap() {
            let language = t["language"].as_str().unwrap();
            let keyword = t["wakeword"].as_str().unwrap();
            let context = t["context_name"].as_str().unwrap();
            let audio_file_name = t["audio_file"].as_str().unwrap();
            let intent = t["inference"]["intent"].as_str().unwrap();
            let slots_json = t["inference"]["slots"].as_object().unwrap();
            let mut slots = HashMap::new();
            slots_json.iter().for_each(|(key, value)| {
                slots.insert(key.to_string(), String::from(value.as_str().unwrap()));
            });

            run_picovoice_test(language, keyword, context, intent, slots, audio_file_name);
        }
    }

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
        while reader.read_exact(&mut frame_buffer).is_ok() {
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
    fn test_process_multiple() {
        let access_key = env::var("PV_ACCESS_KEY")
            .expect("Pass the AccessKey in using the PV_ACCESS_KEY env variable");
        let keyword_path = format!(
            "../../resources/porcupine/resources/keyword_files/{}/picovoice_{}.ppn",
            pv_platform(),
            pv_platform(),
        );
        let context_path = format!(
            "../../resources/rhino/resources/contexts/{}/coffee_maker_{}.rhn",
            pv_platform(),
            pv_platform(),
        );

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
            access_key,
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
