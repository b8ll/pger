export class CustomError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class CommandError extends CustomError {
  constructor(message: string) {
    super(message, 400, true);
  }
}

export class PermissionError extends CustomError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, true);
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string) {
    super(message, 500, true);
  }
} 