import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import type { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}
  transform(value: unknown) {
    const parsed = this.schema.safeParse(value);
    if (!parsed.success) {
      const msg = parsed.error.issues.map(i => `${i.path.join('.')} ${i.message}`).join('; ');
      throw new BadRequestException({ type: 'about:blank', title: 'Invalid payload', detail: msg, status: 400 });
    }
    return parsed.data;
  }
}
