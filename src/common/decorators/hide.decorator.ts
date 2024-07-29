import { SetMetadata } from "@nestjs/common";

export const HideFields = (fields?: string[]) => SetMetadata('hide_fields', fields);
