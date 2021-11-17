using System;

namespace Pv
{
    public class PicovoiceException : Exception
    {
        public PicovoiceException() { }

        public PicovoiceException(string message) : base(message) { }
    }

    public class PicovoiceMemoryException : PicovoiceException
    {
        public PicovoiceMemoryException() { }

        public PicovoiceMemoryException(string message) : base(message) { }
    }

    public class PicovoiceIOException : PicovoiceException
    {
        public PicovoiceIOException() { }

        public PicovoiceIOException(string message) : base(message) { }
    }

    public class PicovoiceInvalidArgumentException : PicovoiceException
    {
        public PicovoiceInvalidArgumentException() { }

        public PicovoiceInvalidArgumentException(string message) : base(message) { }
    }

    public class PicovoiceStopIterationException : PicovoiceException
    {
        public PicovoiceStopIterationException() { }

        public PicovoiceStopIterationException(string message) : base(message) { }
    }

    public class PicovoiceKeyException : PicovoiceException
    {
        public PicovoiceKeyException() { }

        public PicovoiceKeyException(string message) : base(message) { }
    }

    public class PicovoiceInvalidStateException : PicovoiceException
    {
        public PicovoiceInvalidStateException() { }

        public PicovoiceInvalidStateException(string message) : base(message) { }
    }

    public class PicovoiceRuntimeException : PicovoiceException
    {
        public PicovoiceRuntimeException() { }

        public PicovoiceRuntimeException(string message) : base(message) { }
    }

    public class PicovoiceActivationException : PicovoiceException
    {
        public PicovoiceActivationException() { }

        public PicovoiceActivationException(string message) : base(message) { }
    }

    public class PicovoiceActivationLimitException : PicovoiceException
    {
        public PicovoiceActivationLimitException() { }

        public PicovoiceActivationLimitException(string message) : base(message) { }
    }

    public class PicovoiceActivationThrottledException : PicovoiceException
    {
        public PicovoiceActivationThrottledException() { }

        public PicovoiceActivationThrottledException(string message) : base(message) { }
    }

    public class PicovoiceActivationRefusedException : PicovoiceException
    {
        public PicovoiceActivationRefusedException() { }

        public PicovoiceActivationRefusedException(string message) : base(message) { }
    }
}
