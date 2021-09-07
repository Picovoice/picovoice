/*
    Copyright 2021 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

use chrono::prelude::*;
use clap::{App, Arg, ArgGroup};
use ctrlc;
use hound;
use picovoice::{rhino::RhinoInference, PicovoiceBuilder};
use pv_recorder::{Recorder, RecorderBuilder};
use std::sync::atomic::{AtomicBool, Ordering};

static LISTENING: AtomicBool = AtomicBool::new(false);

fn picovoice_demo(
    audio_device_index: i32,
    keyword_path: &str,
    context_path: &str,
    porcupine_model_path: Option<&str>,
    rhino_model_path: Option<&str>,
    porcupine_sensitivity: Option<f32>,
    rhino_sensitivity: Option<f32>,
    output_path: Option<&str>,
) {
    let wake_word_callback = || println!("[{}] [wake word]", Local::now().format("%F %T"));
    let inference_callback = |inference: RhinoInference| {
        if inference.is_understood {
            println!("[{}] Inferred:", Local::now().format("%F %T"));
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

    let recorder = RecorderBuilder::new()
    .device_index(audio_device_index)
    .frame_length(picovoice.frame_length() as i32)
    .init()
    .expect("Failed to initialize pvrecorder");
    recorder.start().expect("Failed to start audio recording");

    LISTENING.store(true, Ordering::SeqCst);
    ctrlc::set_handler(|| {
        LISTENING.store(false, Ordering::SeqCst);
    })
    .expect("Unable to setup signal handler");

    println!("Listening for commands...");
    
    let mut audio_data = Vec::new();
    while LISTENING.load(Ordering::SeqCst) {
        let mut pcm = vec![0; recorder.frame_length()];
        recorder.read(&mut pcm).expect("Failed to read audio frame");

        picovoice.process(&pcm).unwrap();

        if !output_path.is_none() {
            audio_data.extend_from_slice(&pcm);
        }
    }

    println!("\nStopping...");
    recorder.stop().expect("Failed to stop audio recording");

    if let Some(output_path) = output_path {
        let wavspec = hound::WavSpec {
            channels: 1,
            sample_rate: picovoice.sample_rate(),
            bits_per_sample: 16,
            sample_format: hound::SampleFormat::Int,
        };
        let mut writer = hound::WavWriter::create(output_path, wavspec).expect("Failed to open output audio file");
        for sample in audio_data {
            writer.write_sample(sample).unwrap();
        };
    }
}

fn show_audio_devices() {
    let audio_devices = Recorder::get_audio_devices();
    match audio_devices {
        Ok(audio_devices) => {
            for (idx, device) in audio_devices.iter().enumerate() {
                println!("index: {}, device name: {:?}", idx, device);
            }
        }
        Err(err) => panic!("Failed to get audio devices: {}", err),
    };
}

fn main() {
    let matches = App::new("Picovoice Rust Mic Demo")
        .group(
            ArgGroup::with_name("commands_group")
            .arg("context_path")
            .arg("keyword_path")
            .arg("show_audio_devices")
            .multiple(true)
            .required(true)
        )
        .arg(
            Arg::with_name("keyword_path")
            .long("keyword_path")
            .value_name("PATH")
            .help("Path to Porcupine context file (.ppn).")
            .takes_value(true)
            .requires("context_path")
        )
        .arg(
            Arg::with_name("context_path")
            .long("context_path")
            .value_name("PATH")
            .help("Path to Rhino context file (.rhn).")
            .takes_value(true)
            .requires("keyword_path")
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
        .arg(
            Arg::with_name("audio_device_index")
            .long("audio_device_index")
            .value_name("INDEX")
            .help("Index of input audio device.")
            .takes_value(true)
            .default_value("-1")
        )
        .arg(
            Arg::with_name("output_path")
            .long("output_path")
            .value_name("PATH")
            .help("Path to recorded audio (for debugging).")
            .takes_value(true)
        )
        .arg(
            Arg::with_name("show_audio_devices")
            .long("show_audio_devices")
        )
        .get_matches();

    if matches.is_present("show_audio_devices") {
        return show_audio_devices();
    }

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
    let audio_device_index = matches
        .value_of("audio_device_index")
        .unwrap()
        .parse()
        .unwrap();
    let output_path = matches.value_of("output_path");

    picovoice_demo(
        audio_device_index,
        keyword_path,
        context_path,
        porcupine_model_path,
        rhino_model_path,
        porcupine_sensitivity,
        rhino_sensitivity,
        output_path,
    );
}
