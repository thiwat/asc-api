import { SetMetadata } from "@nestjs/common";

export const MaskFields = (fields?: string[]) => SetMetadata('mask_fields', fields);

export const IgnoreMaskField = () => SetMetadata('ignore_mask_fields', true);