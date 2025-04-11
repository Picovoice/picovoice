Pod::Spec.new do |s|
    s.name = 'Picovoice-iOS'
    s.module_name = 'Picovoice'
    s.version = '3.0.3-deprecated'
    s.license = {:type => 'Apache 2.0'}
    s.summary = '⚠️ This package is deprecated and will no longer be maintained'
    s.description = '⚠️ This package is deprecated and will no longer be maintained'
    s.homepage = 'https://github.com/Picovoice/picovoice/tree/master/sdk/ios'
    s.author = { 'Picovoice' => 'hello@picovoice.ai' }
    s.source = { :git => "https://github.com/Picovoice/picovoice.git", :tag => s.version.to_s }
    s.ios.deployment_target = '13.0'
    s.swift_version = '5.0'
    s.source_files = 'sdk/ios/*.{swift}'
    s.exclude_files = 'sdk/ios/PicovoiceAppTest/**'

    s.dependency 'Porcupine-iOS', '~> 3.0.4'
    s.dependency 'Rhino-iOS', '~> 3.0.2'
    s.dependency 'ios-voice-processor', '~> 1.2.0'
  end
