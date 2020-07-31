import {SpatialReference} from "./SpatialReference";

export interface Geometry {

    rings : Array<Array<number>>;
    spatialReference: SpatialReference;

}