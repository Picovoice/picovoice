/*
    Copyright 2021 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

use clap::{App, Arg};
use hound;
use itertools::Itertools;
use picovoice::{rhino::RhinoInference, PicovoiceBuilder};
use std::path::PathBuf;

fn picovoice_demo(
    input_audio_path: PathBuf,
    keyword_path: &str,
    context_path: &str,
    porcupine_model_path: Option<&str>,
    rhino_model_path: Option<&str>,
    porcupine_sensitivity: Option<f32>,
    rhino_sensitivity: Option<f32>,
) {
    let wake_word_callback = || println!("[wake word]");
    let inference_callback = |inference: RhinoInference| {
        if inference.is_understood {
            println!("Inferred:");
            println!("{{");
            println!("\tintent : '{}'", inference.intent.unwrap());
            println!("\tslots : {{");
            for (slot, value) in inference.slots.iter() {
                println!("\t\t{} : {}", slot, value);
            }
            println!("\t}}");
            println!("}}\n");
        } else {
            println!("Did not understand the command");
        }
    };

    let mut picovoice_builder = PicovoiceBuilder::new(
        keyword_path,
        wake_word_callback,
        context_path,
        inference_callback,
    );

    if let Some(porcupine_model_path) = porcupine_model_path {
        picovoice_builder = picovoice_builder.porcupine_model_path(porcupine_model_path);
    }
    if let Some(rhino_model_path) = rhino_model_path {
        picovoice_builder = picovoice_builder.rhino_model_path(rhino_model_path);
    }
    if let Some(porcupine_sensitivity) = porcupine_sensitivity {
        picovoice_builder = picovoice_builder.porcupine_sensitivity(porcupine_sensitivity);
    }
    if let Some(rhino_sensitivity) = rhino_sensitivity {
        picovoice_builder = picovoice_builder.rhino_sensitivity(rhino_sensitivity);
    }

    let mut picovoice = picovoice_builder
        .init()
        .expect("Failed to create Picovoice");

    let mut wav_reader = match hound::WavReader::open(input_audio_path.clone()) {
        Ok(reader) => reader,
        Err(err) => panic!(
            "Failed to open .wav audio file {}: {}",
            input_audio_path.display(),
            err
        ),
    };

    if wav_reader.spec().sample_rate != picovoice.sample_rate() {
        panic!(
            "Audio file should have the expected sample rate of {}, got {}",
            picovoice.sample_rate(),
            wav_reader.spec().sample_rate
        );
    }

    if wav_reader.spec().channels != 1u16 {
        panic!(
            "Audio file should have the expected number of channels 1, got {}",
            wav_reader.spec().channels
        );
    }

    if wav_reader.spec().bits_per_sample != 16u16
        || wav_reader.spec().sample_format != hound::SampleFormat::Int
    {
        panic!("WAV format should be in the signed 16 bit format",);
    }

    for frame in &wav_reader
        .samples()
        .chunks(picovoice.frame_length() as usize)
    {
        let frame: Vec<i16> = frame.map(|s| s.unwrap()).collect_vec();
        if frame.len() == picovoice.frame_length() as usize {
            picovoice.process(&frame).unwrap();
        }
    }
}

fn main() {
    let matches = App::new("Picovoice Rhino Rust File Demo")
        .arg(
            Arg::with_name("input_audio_path")
            .long("input_audio_path")
            .value_name("PATH")
            .help("Path to input audio file (mono, WAV, 16-bit, 16kHz).")
            .takes_value(true)
            .required(true)
        )
        .arg(
            Arg::with_name("keyword_path")
            .long("keyword_path")
            .value_name("PATH")
            .help("Path to Porcupine context file (.ppn).")
            .takes_value(true)
            .required(true)
        )
        .arg(
            Arg::with_name("context_path")
            .long("context_path")
            .value_name("PATH")
            .help("Path to Rhino context file (.rhn).")
            .takes_value(true)
            .required(true)
        )
        .arg(
            Arg::with_name("porcupine_model_path")
            .long("porcupine_model_path")
            .value_name("PATH")
            .help("Path to Porcupine model file (.pv).")
            .takes_value(true)
        )
        .arg(
            Arg::with_name("rhino_model_path")
            .long("rhino_model_path")
            .value_name("PATH")
            .help("Path to Rhino model file (.pv).")
            .takes_value(true)
        )
        .arg(
            Arg::with_name("porcupine_sensitivity")
            .long("porcupine_sensitivity")
            .value_name("SENSITIVITY")
            .help("Wake word sensitivity. The value should be a number within [0, 1]. A higher sensitivity results in fewer misses at the cost of increasing the false alarm rate. If not set 0.5 will be used.")
            .takes_value(true)
            .default_value("0.5")
        )
        .arg(
            Arg::with_name("rhino_sensitivity")
            .long("rhino_sensitivity")
            .value_name("SENSITIVITY")
            .help("Inference sensitivity. The value should be a number within [0, 1]. A higher sensitivity results in fewer misses at the cost of increasing the false alarm rate. If not set 0.5 will be used.")
            .takes_value(true)
            .default_value("0.5")
        )
        .get_matches();

    let input_audio_path = PathBuf::from(matches.value_of("input_audio_path").unwrap());
    let keyword_path = matches.value_of("keyword_path").unwrap();
    let context_path = matches.value_of("context_path").unwrap();
    let porcupine_model_path = matches.value_of("porcupine_model_path");
    let rhino_model_path = matches.value_of("rhino_model_path");
    let porcupine_sensitivity = matches
        .value_of("porcupine_sensitivity")
        .map(|s| s.parse().unwrap());
    let rhino_sensitivity = matches
        .value_of("rhino_sensitivity")
        .map(|s| s.parse().unwrap());

    picovoice_demo(
        input_audio_path,
        keyword_path,
        context_path,
        porcupine_model_path,
        rhino_model_path,
        porcupine_sensitivity,
        rhino_sensitivity,
    );
}
