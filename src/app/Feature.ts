import {CantonAttributes} from "./CantonAttributes";
import {Geometry} from "./Geometry";

export interface Feature {
    id: number;
    featureId: number;
    layerBodId: string;
    layerName: string;
    attributes: CantonAttributes;
    bbox : Array<number>;
    geometry: Geometry;
}