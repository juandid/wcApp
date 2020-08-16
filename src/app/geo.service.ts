import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {cantons} from './../assets/geo/CH';
import {Exclusion} from './Exclusion';
import {CantonData} from './CantonData';
import {CantonExclusions} from './CantonExclusions';
import {booleanContains, polygon as TurfPolygon, booleanPointInPolygon, union, Feature, MultiPolygon} from '@turf/turf';
import {latLng, LatLng, LatLngBounds, latLngBounds} from 'leaflet';
import {MapViewSettings} from './MapViewSettings';



@Injectable({
    providedIn: 'root'
})
export class GeoService {

    cantonMap: Map<string, number>;
    cantonExclusionMap: Map<string, Exclusion[]>;

    // tslint:disable-next-line:max-line-length
    public cantonArr: CantonData[] = cantons;

    constructor(private http: HttpClient) {
        this.cantonMap = new Map();
        this.cantonExclusionMap = new Map();

        let cnt = 0;
        for (const canton of this.cantonArr) {
            this.cantonMap.set(canton.attributes.ak, cnt);
            // console.log(cnt + ':' + canton.attributes.ak);
            cnt++;
        }

/*
        const start = new Date().getTime();
        this.cantonArr.forEach((canton1: CantonData) => {
            let cnt1 = 0;
            for ( const polygonArray1 of canton1.geometry.rings ){
                const abbr1 = canton1.attributes.ak;
                // console.log(abbr1 + ':' + cnt1);

                // inner loop
                this.cantonArr.forEach((canton2: CantonData) => {
                    let cnt2 = 0;
                    for (const polygonArray2 of canton2.geometry.rings) {
                        const abbr2 = canton2.attributes.ak;
                        if (abbr1 + ':' + cnt1 === abbr2 + ':' + cnt2){
                            // do not compare with itself
                        }else{
                            const poly1 = TurfPolygon([polygonArray1]);
                            const poly2 = TurfPolygon([polygonArray2]);

                            if (booleanContains(poly1, poly2)){
                                // console.log(abbr2 + ':' + cnt2 + ' is part of ' + abbr1 + ':' + cnt1);
                                if (!this.cantonExclusionMap.has(abbr1)){
                                    this.cantonExclusionMap.set(abbr1, new Array());
                                }
                                this.cantonExclusionMap.get(abbr1).push({cantInd: this.cantonMap.get(abbr2), ringInd: cnt2});
                            }
                        }
                        cnt2++;
                    }
                });

                cnt1++;
            }
        });
        const elapsed = new Date().getTime() - start;
        console.log('elapsed Time to find containing polygons= ' + elapsed);

        this.cantonExclusionMap.forEach((exclusionArr: Exclusion[], abbr: string) => {
            let line = 'public static readonly ' + abbr + ' = new CantonExclusions([';
            for ( const exclusion of exclusionArr){
                line = line + '{cantInd: ' + exclusion.cantInd + ', ringInd: ' + exclusion.ringInd + '}, ';
            }
            line = line + ']);';
            console.log(line);
        });
*/

    }

    getExclusionsFor(abbr: string, cnt: number): Exclusion[] {
        const exclusionArr: Exclusion[] = CantonExclusions[abbr];
        if (cnt === 0 && exclusionArr !== undefined){
            return exclusionArr;
        }
        /*
        if (cnt === 0 && this.cantonExclusionMap.has(abbr)){
            return this.cantonExclusionMap.get(abbr);
        }
         */
        return new Array();
    }

    public getRingsFor(abbr: string): number[][][]{
        const ind = this.cantonMap.get(abbr);
        return this.cantonArr[ind].geometry.rings;
    }

    public getCantInd(abbr: string): number{
        return this.cantonMap.get(abbr);
    }

    public getUnionedPolygonsOfArAndAi(): LatLng[]{
        const arInd = this.cantonMap.get('AR');
        // console.log('arInd = ' + arInd);
        const aiInd = this.cantonMap.get('AI');
        // console.log('aiInd = ' + aiInd);

        // @ts-ignore
        let unionedPolygon: Feature<TurfPolygon | MultiPolygon> = TurfPolygon([this.cantonArr[arInd].geometry.rings[0]]);
        for ( const polyAi of this.cantonArr[aiInd].geometry.rings){
            const poly2 = TurfPolygon([polyAi]);
            unionedPolygon  = union(unionedPolygon, poly2);
        }

        // swap x and y
        const unionedArr: LatLng[] = [];
        for (const posArray of unionedPolygon.geometry.coordinates[0]){

            // @ts-ignore
            const latlng = new LatLng(posArray[1], posArray[0]);
            unionedArr.push(latlng);
        }
        return unionedArr;
    }

    public getAndSwapPolygonCoordinates(cantInd: number, ringInd: number): LatLng[] {

        const polyArr: LatLng[] = [];
        // swap x and y
        for (const posArray of this.cantonArr[cantInd].geometry.rings[ringInd]){
            const latlng = new LatLng(posArray[1], posArray[0]);
            polyArr.push(latlng);
        }
        return polyArr;
    }

    public findCanton(lng: number, lat: number): string {

        const findArr = new Array<string>();
        const start = new Date().getTime();
        this.cantonArr.forEach((canton: CantonData) => {
            // tslint:disable-next-line:no-shadowed-variable
            let cnt = 0;
            for ( const polygonArray of canton.geometry.rings ){
                const abbr = canton.attributes.ak;
                // console.log(abbr + ':' + cnt);
                const poly = TurfPolygon([polygonArray]);
                if ( booleanPointInPolygon([lng, lat], poly) ){
                    // console.log('point inside ' + abbr + ':' + cnt);
                    findArr[cnt] = abbr;
                }
                cnt++;
            }
        });
        const elapsed = new Date().getTime() - start;
        // console.log('elapsed Time find polygon = ' + elapsed);

        let abbrResult;
        let cnt = 0;
        findArr.forEach((abbr: string) => {
            // console.log('findArr[' + cnt + '] = ' + abbr);
            abbrResult = abbr;
            cnt++;
        });

        return abbrResult;
    }

    public calculateMapViewSettings(abbr: string): MapViewSettings{

        const cantInd: number = this.cantonMap.get(abbr);

        // calculate the center of the bounding box
        const bBoxArr: Array<number> = this.cantonArr[cantInd].bbox;
        const centerLat = (bBoxArr[1] + bBoxArr[3]) / 2;
        const centerLng = (bBoxArr[0] + bBoxArr[2]) / 2;

        // calculate the extent of the cantons width -> calc the zoom
        const extentLng = bBoxArr[2] - bBoxArr[0];
        let zoom = Math.round(10.4 - (extentLng * 1.8 ));
        console.log(abbr + ' extentLng=' + extentLng + ' -> zoom=' + zoom);

        if (zoom < 8){
            zoom = 8;
        }
        if (zoom > 9){
            zoom = 9;
        }
        console.log(abbr + ' -> final zoom=' + zoom);
        return {centerLat, centerLng, zoom};
    }

    public getBounds(abbr: string): LatLngBounds{

        const cantInd: number = this.cantonMap.get(abbr);

        // calculate the center of the bounding box
        const bBoxArr: Array<number> = this.cantonArr[cantInd].bbox;

        const corner1 = latLng(bBoxArr[1], bBoxArr[0]);
        const corner2 = latLng(bBoxArr[3], bBoxArr[2]);
        return latLngBounds(corner1, corner2);

    }
}
