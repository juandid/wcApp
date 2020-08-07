import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import { Observable } from 'rxjs';
import {Lv95} from './lv95';
import {CantonSearchResult} from './CantonSearchResult';
import {cantons} from './../assets/geo/CH';
import {Exclusion} from './Exclusion';
import {CantonData} from './CantonData';
import {booleanContains, polygon as TurfPolygon} from '@turf/turf';
import {LatLng} from 'leaflet';

@Injectable({
    providedIn: 'root'
})
export class GeoAdminChService {

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
                                // console.log('      ' + abbr2 + ':' + cnt2 + ' is part of ' + abbr1 + ':' + cnt1);
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
        console.log('elapsed Time = ' + elapsed);

    }

    getExclusionsFor(abbr: string, cnt: number): Exclusion[] {
        if (cnt === 0 && this.cantonExclusionMap.has(abbr)){
            return this.cantonExclusionMap.get(abbr);
        }
        return new Array();
    }

    public getRingsFor(abbr: string): number[][][]{
        const ind = this.cantonMap.get(abbr);
        return this.cantonArr[ind].geometry.rings;
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

    getLv95(longitude: number, latitude: number): Observable<HttpResponse<Lv95>> {
        // console.log("getLv95 called");
        const url = 'http://geodesy.geo.admin.ch/reframe/wgs84tolv95?easting=' + longitude + '&northing=' + latitude + '&format=json';
        return this.http.get<Lv95>(
            url, { observe: 'response' });
    }

    getCanton(easting: number, northing: number){
        // console.log("getCanton called");
        const url = 'https://api3.geo.admin.ch/rest/services/all/MapServer/identify?geometry=' + easting + ',' + northing + '&geometryType=esriGeometryPoint&lang=de&layers=all:ch.swisstopo.swissboundaries3d-kanton-flaeche.fill&returnGeometry=true&sr=4326&tolerance=0';
        // console.log(urlCanton);
        return this.http.get<CantonSearchResult>(
            url, { observe: 'response' });
    }


}
