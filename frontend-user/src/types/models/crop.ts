export interface CropData {
  id: string;
  farmerId: string;
  cropName: string;
  variety: string;
  plantingDate: string;
  expectedHarvestDate: string;
  fieldArea: number;
  fieldAreaUnit: string;
  status: CropStatus;
  createdAt: string;
  updatedAt: string;
}

export enum CropStatus {
  PLANTED = "PLANTED",
  GROWING = "GROWING",
  READY_TO_HARVEST = "READY_TO_HARVEST",
  HARVESTED = "HARVESTED",
}

export interface SubmitCropRequest {
  cropName: string;
  variety: string;
  plantingDate: string;
  expectedHarvestDate: string;
  fieldArea: number;
  fieldAreaUnit: string;
}
