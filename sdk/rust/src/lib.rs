use std::path::{Path, PathBuf};

pub use porcupine;
pub use rhino;

pub struct PicovoiceBuilder<W, I>
where
    W: FnMut(),
    I: FnMut(rhino::RhinoInference),
{
    keyword_path: PathBuf,
    wake_word_callback: W,
    context_path: PathBuf,
    inference_callback: I,
    porcupine_library_path: Option<PathBuf>,
    porcupine_model_path: Option<PathBuf>,
    porcupine_sensitivity: Option<f32>,
    rhino_library_path: Option<PathBuf>,
    rhino_model_path: Option<PathBuf>,
    rhino_sensitivity: Option<f32>,
}

impl<W, I> PicovoiceBuilder<W, I>
where
    W: FnMut(),
    I: FnMut(rhino::RhinoInference),
{
    pub fn new<P: AsRef<Path>>(
        keyword_path: P,
        wake_word_callback: W,
        context_path: P,
        inference_callback: I,
    ) -> Self {
        return Self {
            keyword_path: PathBuf::from(keyword_path.as_ref()),
            wake_word_callback,
            context_path: PathBuf::from(context_path.as_ref()),
            inference_callback,
            porcupine_library_path: None,
            porcupine_model_path: None,
            porcupine_sensitivity: None,
            rhino_library_path: None,
            rhino_model_path: None,
            rhino_sensitivity: None,
        };
    }

    pub fn porcupine_library_path<P: AsRef<Path>>(mut self, porcupine_library_path: P) -> Self {
        self.porcupine_library_path = Some(PathBuf::from(porcupine_library_path.as_ref()));
        return self;
    }

    pub fn porcupine_model_path<P: AsRef<Path>>(mut self, porcupine_model_path: P) -> Self {
        self.porcupine_model_path = Some(PathBuf::from(porcupine_model_path.as_ref()));
        return self;
    }

    pub fn porcupine_sensitivity(mut self, porcupine_sensitivity: f32) -> Self {
        self.porcupine_sensitivity = Some(porcupine_sensitivity);
        return self;
    }

    pub fn rhino_library_path<P: AsRef<Path>>(mut self, rhino_library_path: P) -> Self {
        self.rhino_library_path = Some(PathBuf::from(rhino_library_path.as_ref()));
        return self;
    }

    pub fn rhino_model_path<P: AsRef<Path>>(mut self, rhino_model_path: P) -> Self {
        self.rhino_model_path = Some(PathBuf::from(rhino_model_path.as_ref()));
        return self;
    }

    pub fn rhino_sensitivity(mut self, rhino_sensitivity: f32) -> Self {
        self.rhino_sensitivity = Some(rhino_sensitivity);
        return self;
    }

    pub fn init(self) -> Result<Picovoice<W, I>, PicovoiceError> {
        return Picovoice::new(
            self.keyword_path,
            self.wake_word_callback,
            self.context_path,
            self.inference_callback,
            self.porcupine_library_path,
            self.porcupine_model_path,
            self.porcupine_sensitivity,
            self.rhino_library_path,
            self.rhino_model_path,
            self.rhino_sensitivity,
        );
    }
}

#[derive(Debug)]
pub enum PicovoiceError {
    RhinoError(rhino::RhinoError),
    PorcupineError(porcupine::PorcupineError),
    LibraryError(String),
}

impl PicovoiceError {
    pub fn from_rhino(rhino_err: rhino::RhinoError) -> Self {
        PicovoiceError::RhinoError(rhino_err)
    }

    pub fn from_porcupine(porcupine_err: porcupine::PorcupineError) -> Self {
        PicovoiceError::PorcupineError(porcupine_err)
    }
}

impl std::fmt::Display for PicovoiceError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match &self {
            PicovoiceError::RhinoError(err) => err.fmt(f),
            PicovoiceError::PorcupineError(err) => err.fmt(f),
            PicovoiceError::LibraryError(err) => write!(f, "Picovoice error: {}", err),
        }
    }
}

#[derive(Clone)]
pub struct Picovoice<W, I>
where
    W: FnMut(),
    I: FnMut(rhino::RhinoInference),
{
    porcupine: porcupine::Porcupine,
    rhino: rhino::Rhino,
    wake_word_callback: W,
    inference_callback: I,
    sample_rate: u32,
    frame_length: u32,
    version: String,
    wake_word_detected: bool,
}

impl<W, I> Picovoice<W, I>
where
    W: FnMut(),
    I: FnMut(rhino::RhinoInference),
{
    pub fn new<P: AsRef<Path>>(
        keyword_path: P,
        wake_word_callback: W,
        context_path: P,
        inference_callback: I,
        porcupine_library_path: Option<P>,
        porcupine_model_path: Option<P>,
        porcupine_sensitivity: Option<f32>,
        rhino_library_path: Option<P>,
        rhino_model_path: Option<P>,
        rhino_sensitivity: Option<f32>,
    ) -> Result<Self, PicovoiceError> {
        let mut porcupine_builder =
            porcupine::PorcupineBuilder::new_with_keyword_paths(&[keyword_path.as_ref()]);
        if let Some(porcupine_library_path) = porcupine_library_path {
            porcupine_builder.library_path(porcupine_library_path);
        }
        if let Some(porcupine_model_path) = porcupine_model_path {
            porcupine_builder.model_path(porcupine_model_path);
        }
        if let Some(porcupine_sensitivity) = porcupine_sensitivity {
            porcupine_builder.sensitivities(&[porcupine_sensitivity]);
        }
        let porcupine = porcupine_builder
            .init()
            .map_err(PicovoiceError::from_porcupine)?;

        let mut rhino_builder = rhino::RhinoBuilder::new(context_path);
        if let Some(rhino_library_path) = rhino_library_path {
            rhino_builder.library_path(rhino_library_path);
        }
        if let Some(rhino_model_path) = rhino_model_path {
            rhino_builder.model_path(rhino_model_path);
        }
        if let Some(rhino_sensitivity) = rhino_sensitivity {
            rhino_builder.sensitivity(rhino_sensitivity);
        }
        let rhino = rhino_builder.init().map_err(PicovoiceError::from_rhino)?;

        if porcupine.sample_rate() != rhino.sample_rate() {
            return Err(PicovoiceError::LibraryError(format!(
                "Porcupine sample_rate ({}) was different than Rhino sample_rate ({})",
                porcupine.sample_rate(),
                rhino.sample_rate()
            )));
        }
        let sample_rate = porcupine.sample_rate();

        if porcupine.frame_length() != rhino.frame_length() {
            return Err(PicovoiceError::LibraryError(format!(
                "Porcupine frame_length ({}) was different than Rhino frame_length ({})",
                porcupine.sample_rate(),
                rhino.sample_rate()
            )));
        }
        let frame_length = porcupine.frame_length();

        let version = format!(
            "1.1.0 (Porcupine v{}) (Rhino v{})",
            porcupine.version(),
            rhino.version()
        );

        return Ok(Self {
            porcupine,
            rhino,
            wake_word_callback,
            inference_callback,
            sample_rate,
            frame_length,
            version,
            wake_word_detected: false,
        });
    }

    pub fn process(&mut self, pcm: &[i16]) -> Result<(), PicovoiceError> {
        if !self.wake_word_detected {
            let keyword_index = self
                .porcupine
                .process(pcm)
                .map_err(PicovoiceError::from_porcupine)?;

            if keyword_index == 0 {
                self.wake_word_detected = true;
                (self.wake_word_callback)();
            }
        } else {
            let is_finalized = self
                .rhino
                .process(pcm)
                .map_err(PicovoiceError::from_rhino)?;

            if is_finalized {
                self.wake_word_detected = false;
                let inference = self
                    .rhino
                    .get_inference()
                    .map_err(PicovoiceError::from_rhino)?;
                (self.inference_callback)(inference);
            }
        }

        return Ok(());
    }

    pub fn frame_length(&self) -> u32 {
        return self.frame_length as u32;
    }

    pub fn sample_rate(&self) -> u32 {
        return self.sample_rate as u32;
    }

    pub fn version(&self) -> String {
        return self.version.clone();
    }
}
