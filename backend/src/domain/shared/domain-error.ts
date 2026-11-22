/**
 * Error level domain.
 *
 * Error ini tidak boleh membocorkan stack trace, credential, atau keberadaan
 * record pribadi. Pemetaan ke status HTTP dilakukan di layer interface.
 */

export class DomainError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, readonly details?: readonly string[]) {
    super('VALIDATION_ERROR', message);
  }
}

export class NotAuthenticatedError extends DomainError {
  constructor(message = 'Sesi tidak dikenali.') {
    super('NOT_AUTHENTICATED', message);
  }
}

export class AccessDeniedError extends DomainError {
  constructor(
    deniedCode: string,
    message: string,
  ) {
    super(deniedCode, message);
  }
}

export class NotFoundError extends DomainError {
  constructor(message = 'Data tidak ditemukan.') {
    super('NOT_FOUND', message);
  }
}

export class ConfigurationError extends DomainError {
  constructor(message: string) {
    super('CONFIGURATION_ERROR', message);
  }
}
