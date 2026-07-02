export type CopilotMetadataValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[];

export type CopilotMetadata = Record<string, CopilotMetadataValue>;
