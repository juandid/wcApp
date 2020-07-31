import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import { Observable } from 'rxjs';
import {Lv95} from "./lv95";
import {CantonSearchResult} from "./CantonSearchResult";

@Injectable({
    providedIn: 'root'
})
export class GeoAdminChService {

    constructor(private http: HttpClient) { }

    getLv95(longitude: number, latitude: number): Observable<HttpResponse<Lv95>> {
        //console.log("getLv95 called");
        let url = 'http://geodesy.geo.admin.ch/reframe/wgs84tolv95?easting=' + longitude + '&northing=' + latitude + '&format=json';
        return this.http.get<Lv95>(
            url, { observe: 'response' });
    }

    getCanton(easting: number, northing: number){
        //console.log("getCanton called");
        let url = 'https://api3.geo.admin.ch/rest/services/all/MapServer/identify?geometry=' + easting + ',' + northing + '&geometryType=esriGeometryPoint&lang=de&layers=all:ch.swisstopo.swissboundaries3d-kanton-flaeche.fill&returnGeometry=true&sr=4326&tolerance=0';
        //console.log(urlCanton);
        return this.http.get<CantonSearchResult>(
            url, { observe: 'response' });
    }

}