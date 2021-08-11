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
use miniaudio;
use picovoice::{rhino::RhinoInference, PicovoiceBuilder};
use std::collections::VecDeque;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};

static LISTENING: AtomicBool = AtomicBool::new(false);

fn picovoice_demo(
    miniaudio_backend: &[miniaudio::Backend],
    audio_device_index: usize,
    keyword_path: &str,
    context_path: &str,
    porcupine_model_path: Option<&str>,
    rhino_model_path: Option<&str>,
    porcupine_sensitivity: Option<f32>,
    rhino_sensitivity: Option<f32>,
    output_path: Option<&str>,
) {
    let mut buffer: VecDeque<i16> = VecDeque::new();

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

    let wavspec = hound::WavSpec {
        channels: 1,
        sample_rate: 16000,
        bits_per_sample: 16,
        sample_format: hound::SampleFormat::Int,
    };
    let output_file_writer = match output_path {
        Some(output_path) => Some(Arc::new(Mutex::new(
            hound::WavWriter::create(output_path, wavspec)
                .expect("Failed to open output audio file"),
        ))),
        None => None,
    };

    let miniaudio_context =
        miniaudio::Context::new(&miniaudio_backend, None).expect("Failed to create audio context");
    miniaudio_context
        .with_capture_devices(|_: _| {})
        .expect("Failed to access capture devices");
    let device_id = miniaudio_context
        .capture_devices()
        .get(audio_device_index)
        .expect("No device available given audio device index.")
        .id()
        .clone();

    println!("Using {:?} backend", miniaudio_context.backend());

    let mut device_config = miniaudio::DeviceConfig::new(miniaudio::DeviceType::Capture);
    device_config
        .capture_mut()
        .set_format(miniaudio::Format::S16);
    device_config.capture_mut().set_channels(1);
    device_config.capture_mut().set_device_id(Some(device_id));
    device_config.set_sample_rate(picovoice.sample_rate());
    device_config.set_data_callback(move |_, _, frames| {
        buffer.extend(frames.as_samples().iter());
        while buffer.len() >= picovoice.frame_length() as usize && LISTENING.load(Ordering::SeqCst)
        {
            let frame: Vec<i16> = buffer.drain(..picovoice.frame_length() as usize).collect();
            picovoice.process(&frame).unwrap();
        }

        if let Some(output_file_writer_mutex) = &output_file_writer {
            let mut output_file_writer = output_file_writer_mutex.lock().unwrap();
            let samples: &[i16] = frames.as_samples();
            for sample in samples {
                output_file_writer.write_sample(*sample).unwrap();
            }
        }
    });

    let device = miniaudio::Device::new(Some(miniaudio_context), &device_config)
        .expect("Failed to initialize capture device");

    LISTENING.store(true, Ordering::SeqCst);
    device.start().expect("Failed to start device");
    println!("Listening for commands...");

    ctrlc::set_handler(|| {
        LISTENING.store(false, Ordering::SeqCst);
    })
    .expect("Unable to setup signal handler");

    // Spin loop until we receive the ctrlc handler
    while LISTENING.load(Ordering::SeqCst) {
        std::hint::spin_loop();
        std::thread::sleep(std::time::Duration::from_millis(10));
    }

    println!("\nStopping!");
    device.stop().expect("Failed to stop device");
    println!("Stopped");
}

fn show_audio_devices(miniaudio_backend: &[miniaudio::Backend]) {
    let miniaudio_context =
        miniaudio::Context::new(miniaudio_backend, None).expect("failed to create context");
    miniaudio_context
        .with_capture_devices(|capture_devices| {
            println!("Capture Devices:");
            for (idx, device) in capture_devices.iter().enumerate() {
                println!("\t{}: {}", idx, device.name());
            }
        })
        .expect("failed to get devices");
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
            .help("Path to Porcupine context file (.ppn)")
            .takes_value(true)
            .requires("context_path")
        )
        .arg(
            Arg::with_name("context_path")
            .long("context_path")
            .value_name("PATH")
            .help("Path to Rhino context file (.rhn)")
            .takes_value(true)
            .requires("keyword_path")
        )
        .arg(
            Arg::with_name("porcupine_model_path")
            .long("porcupine_model_path")
            .value_name("PATH")
            .help("Path to Porcupine model file (.pv)")
            .takes_value(true)
        )
        .arg(
            Arg::with_name("rhino_model_path")
            .long("rhino_model_path")
            .value_name("PATH")
            .help("Path to Rhino model file (.pv)")
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
            .default_value("0")
        )
        .arg(
            Arg::with_name("audio_backend")
            .long("audio_backend")
            .value_name("BACKEND")
            .help("The name of a specific audio backend to use. Note: not all options will work on a given platform.")
            .takes_value(true)
            .possible_values(&["Wasapi", "DSound", "WinMM", "CoreAudio", "SNDIO", "Audio4", "OSS", "PulseAudio", "Alsa", "Jack", "AAudio", "OpenSL", "WebAudio"])
        )
        .arg(
            Arg::with_name("output_path")
            .long("output_path")
            .value_name("PATH")
            .help("Path to recorded audio (for debugging)")
            .takes_value(true)
        )
        .arg(
            Arg::with_name("show_audio_devices")
            .long("show_audio_devices")
        )
        .get_matches();

    let miniaudio_backend = match matches.value_of("audio_backend") {
        Some(audio_backend_str) => vec![match audio_backend_str {
            "Wasapi" => miniaudio::Backend::Wasapi,
            "DSound" => miniaudio::Backend::DSound,
            "WinMM" => miniaudio::Backend::WinMM,
            "CoreAudio" => miniaudio::Backend::CoreAudio,
            "SNDIO" => miniaudio::Backend::SNDIO,
            "Audio4" => miniaudio::Backend::Audio4,
            "OSS" => miniaudio::Backend::OSS,
            "PulseAudio" => miniaudio::Backend::PulseAudio,
            "Alsa" => miniaudio::Backend::Alsa,
            "Jack" => miniaudio::Backend::Jack,
            "AAudio" => miniaudio::Backend::AAudio,
            "OpenSL" => miniaudio::Backend::OpenSL,
            "WebAudio" => miniaudio::Backend::WebAudio,
            _ => panic!("Unsupported audio backend"),
        }],
        _ => vec![],
    };

    if matches.is_present("show_audio_devices") {
        return show_audio_devices(&miniaudio_backend);
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
        &miniaudio_backend,
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
