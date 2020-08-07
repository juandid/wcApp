export interface CantonData {
    layerName: string;
    featureId: number;
    geometry: { rings: number[][][]; spatialReference: { wkid: number; }; };
    bbox: number[];
    attributes: { ak: string; label: string; name: string; flaeche: number; };
    layerBodId: string;
    id: number;
}
