export type UpdateLocationProps = {
  location: string;
};

export type SpaceProps = {
  id: string;
  location: string;
  name: string;
  photoUrl?: string;
};

export type GetSpacesProps = {
  TableName: string;
};

export type GetSpacesByIdProps = {
  TableName: string;
  Key: {
    id: {
      S: string;
    };
  };
};
