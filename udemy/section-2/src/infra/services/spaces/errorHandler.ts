import { SpaceProps } from "./types";

export class MissingFieldsError extends Error {
  constructor(missingField: string) {
    super(`You must provide a value for ${missingField}`);
  }
}

export const fieldsValidator = (arg: any) => {
  if (!(arg as SpaceProps).id) throw new MissingFieldsError("id");
  if (!(arg as SpaceProps).location) throw new MissingFieldsError("location");
  if (!(arg as SpaceProps).name) throw new MissingFieldsError("name");
};
