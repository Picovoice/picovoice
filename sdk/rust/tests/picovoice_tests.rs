/*
    Copyright 2021 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/
mod platform {
    #[allow(dead_code)]
    const RPI_MACHINES: [&str; 4] = ["arm11", "cortex-a7", "cortex-a53", "cortex-a72"];
    #[allow(dead_code)]
    const JETSON_MACHINES: [&str; 1] = ["cortex-a57"];

    #[cfg(target_os = "macos")]
    pub fn pv_platform() -> String {
        return String::from("mac");
    }

    #[cfg(target_os = "windows")]
    pub fn pv_platform() -> String {
        return String::from("windows");
    }

    #[cfg(all(target_os = "linux", target_arch = "x86_64"))]
    pub fn pv_platform() -> String {
        return String::from("linux");
    }

    #[cfg(all(target_os = "linux", any(target_arch = "arm", target_arch = "aarch64")))]
    pub fn pv_platform() -> String {
        let machine = find_machine_type();
        return match machine.as_str() {
            machine if RPI_MACHINES.contains(&machine) => String::from("raspberry-pi"),
            machine if JETSON_MACHINES.contains(&machine) => String::from("jetson"),
            "beaglebone" => String::from("beaglebone"),
            _ => {
                panic!("ERROR: Please be advised that this device is not officially supported by Picovoice");
            }
        };
    }
}

#[cfg(test)]
mod tests {
    use std::collections::HashMap;
    use std::convert::TryInto;
    use std::env;
    use std::fs::File;
    use std::io::BufReader;
    use std::io::Read;
    use std::sync::{Arc, Mutex};

    use super::platform::pv_platform;
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

    #[test]
    fn test_init_with_non_ascii_model_name() {
        let access_key = env::var("PV_ACCESS_KEY")
            .expect("Pass the AccessKey in using the PV_ACCESS_KEY env variable");
        let keyword_path = format!(
                "../../resources/porcupine/resources/keyword_files_es/{}/murciélago_{}.ppn",
                pv_platform(),
                pv_platform(),
        );
        let context_path = format!(
            "../../resources/rhino/resources/contexts_es/{}/iluminación_inteligente_{}.rhn",
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

        let _picovoice = PicovoiceBuilder::new(
            access_key,
            keyword_path,
            wake_word_callback,
            context_path,
            inference_callback,
        )
        .porcupine_model_path("../../resources/porcupine/lib/common/porcupine_params_es.pv")
        .rhino_model_path("../../resources/rhino/lib/common/rhino_params_es.pv")
        .init()
        .expect("Failed to init Picovoice");
    }
}
