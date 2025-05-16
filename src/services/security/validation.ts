import { CustomError } from '../../utils/errors/CustomError';
import { logger } from '../core/logger';

interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export class ValidationService {
  private rules: Map<string, ValidationRule<any>[]> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    // Add some common validation rules
    this.addRule('string', {
      validate: (value: string) => typeof value === 'string',
      message: 'Value must be a string'
    });

    this.addRule('number', {
      validate: (value: number) => typeof value === 'number' && !isNaN(value),
      message: 'Value must be a valid number'
    });

    this.addRule('boolean', {
      validate: (value: boolean) => typeof value === 'boolean',
      message: 'Value must be a boolean'
    });

    this.addRule('email', {
      validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: 'Invalid email format'
    });

    this.addRule('url', {
      validate: (value: string) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Invalid URL format'
    });
  }

  public addRule<T>(type: string, rule: ValidationRule<T>): void {
    const existingRules = this.rules.get(type) || [];
    this.rules.set(type, [...existingRules, rule]);
    logger.debug(`Added validation rule for type: ${type}`);
  }

  public validate<T>(value: T, type: string): { isValid: boolean; errors: string[] } {
    const rules = this.rules.get(type);
    if (!rules) {
      logger.warn(`No validation rules found for type: ${type}`);
      return { isValid: true, errors: [] };
    }

    const errors: string[] = [];
    
    for (const rule of rules) {
      try {
        if (!rule.validate(value)) {
          errors.push(rule.message);
        }
      } catch (error) {
        logger.error(`Validation error for type ${type}:`, error);
        errors.push('Internal validation error');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  public validateObject<T extends object>(
    obj: T,
    schema: Record<keyof T, string>
  ): { isValid: boolean; errors: Record<keyof T, string[]> } {
    const errors: Partial<Record<keyof T, string[]>> = {};
    let isValid = true;

    for (const [key, type] of Object.entries(schema) as [keyof T, string][]) {
      const value = obj[key];
      const validation = this.validate(value, type);

      if (!validation.isValid) {
        errors[key] = validation.errors;
        isValid = false;
      }
    }

    return {
      isValid,
      errors: errors as Record<keyof T, string[]>
    };
  }

  public validateArray<T>(
    array: T[],
    type: string
  ): { isValid: boolean; errors: Array<{ index: number; errors: string[] }> } {
    const errors: Array<{ index: number; errors: string[] }> = [];

    array.forEach((item, index) => {
      const validation = this.validate(item, type);
      if (!validation.isValid) {
        errors.push({ index, errors: validation.errors });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 