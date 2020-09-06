import {Component, NgZone} from '@angular/core';
import * as L from 'leaflet';
import {CRS, icon, LatLng, latLng, latLngBounds, LayerGroup, marker, polygon} from 'leaflet';
import {CallbackID, Plugins} from '@capacitor/core';

import {GeoService} from '../geo.service';
import {AlertController, MenuController} from '@ionic/angular';
import {CantonDisplay} from '../CantonDisplay';
import {TranslateService} from '@ngx-translate/core';
import {MapViewSettings} from '../MapViewSettings';

const {Geolocation} = Plugins;


@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {

    // map presentation
    map: L.Map;
    layerGroup: LayerGroup;
    mvs: MapViewSettings;
    doCenter: boolean;
    // geolocation
    latitude: number;
    longitude: number;
    accuracy: number;
    watchId: CallbackID;
    // canton selected
    title: string;
    abbr: string;

    // Hint Outside CH
    txthint: string;
    txterror: string;
    txtoutsidech: string;
    txtlocatingerror: string;
    txtdismiss: string;
    txtlocating: string;
    txtyouareat: string;

    constructor(
        public menuCtrl: MenuController,
        private alertCtrl: AlertController,
        private translate: TranslateService,
        private geoService: GeoService,
        private zone: NgZone
    ) {
        this.doCenter = true;
        this.title = this.txtlocating;
        this.layerGroup = new LayerGroup<any>();
    }

    // The below function is added
    ionViewDidEnter() {
        this._initialiseTranslation();
        this.watchPosition();
    }

    ionViewDidLeave() {
        if (this.watchId != null) {
            // console.log('clearWatch with id ' + this.watchId);
            Plugins.Geolocation.clearWatch({id: this.watchId});
        }
    }

    ionViewWillEnter() {
        this.menuCtrl.enable(false);
    }

    watchPosition() {
        try {
            this.watchId = Geolocation.watchPosition({enableHighAccuracy: false, timeout: 5000, maximumAge: 3000}, (position, err) => {
                // console.log('subscribed to watchPosition ' + this.watchId);
                if (err) {
                    // console.log('failed to receive position: ' + err);
                    this.showNoCanton();
                } else {
                    // console.log('received location lat: ' + position.coords.latitude + '; lng: ' + position.coords.longitude);
                    this.zone.run(() => {
                        this.latitude = position.coords.latitude;
                        this.longitude = position.coords.longitude;
                        this.accuracy = position.coords.accuracy;
                        this.showCanton();
                    });

                }
            });
        } catch (e) {
            console.error('failed to receive position due to ' + e);
        }

    }

    centerLocation() {
        this.map.panTo([this.latitude, this.longitude]);
    }

    // The below function is added
    deprecated_showCurrentCanton() {

        Geolocation.getCurrentPosition({enableHighAccuracy: false, timeout: 5000, maximumAge: 3000}).then((resp) => {

            this.latitude = resp.coords.latitude;
            this.longitude = resp.coords.longitude;
            this.accuracy = resp.coords.accuracy;

            this.showCanton();

        }).catch((error) => {
            this.alertCtrl.create({
                animated: true,
                header: this.txterror,
                message: this.txtlocatingerror,
                buttons: [this.txtdismiss]
            }).then(alertEl => alertEl.present());
            this.showNoCanton();
        });

    }

    showNoCanton() {
        this.setupMap();
        this.title = '';
        this.map.setView([47.0, 8.3], 8);
    }

    showCanton() {

        this.setupMap();
        this.abbr = this.geoService.findCanton(this.longitude, this.latitude);
        // console.log('abbr=' + this.abbr);

        if (this.abbr === undefined) {

            this.map.setView([47.0, 8.3], 8);
            this.presentOutsideSwitzerlandAlert();

        } else {

            const cantonDisplay: CantonDisplay = CantonDisplay[this.abbr];
            // this.title = this.txtyouareat + ' ' + cantonDisplay.label;

            const baseIcon = icon({
                iconUrl: '/assets/icon/base-marker.png',
                iconSize: [20, 29], // size of the icon
                iconAnchor: [10, 25], // point of the icon which will correspond to marker's location
            });
            marker([this.latitude, this.longitude], {icon: baseIcon}).addTo(this.layerGroup);

            const cantonIcon = icon({
                iconUrl: '/assets/icon/' + this.abbr + '.png',
                iconSize: [20, 25], // size of the icon
                iconAnchor: [10, 45], // point of the icon which will correspond to marker's location
            });
            marker([this.latitude, this.longitude], {icon: cantonIcon}).addTo(this.layerGroup);
            // .bindPopup(`Latitude: ${this.latitude}<br>Longitude: ${this.longitude}<br>Accuracy: ${this.accuracy}`).openPopup();

            let cnt = 0;
            for (const polygonArray of this.geoService.getRingsFor(this.abbr)) {

                const polyArr: LatLng[] = [];
                // swap x and y
                for (const posArray of polygonArray) {
                    polyArr.push(new LatLng(posArray[1], posArray[0]));
                }

                const polygons: LatLng[][][] = [[polyArr], []];

                const exclusions = this.geoService.getExclusionsFor(this.abbr, cnt);
                if (this.abbr === 'SG' && cnt === 0) {

                    // union of ar 0 and all ai exclusions
                    polygons[1].push(this.geoService.getUnionedPolygonsOfArAndAi());
                    // exclusion of tg 1
                    polygons[1].push(this.geoService.getAndSwapPolygonCoordinates(this.geoService.getCantInd('TG'), 1));

                } else {
                    const type = typeof exclusions;
                    // tslint:disable-next-line:prefer-for-of
                    for (let i = 0; i < exclusions.length; i++) {
                        const exclusion = exclusions[i];
                        polygons[1].push(this.geoService.getAndSwapPolygonCoordinates(exclusion.cantInd, exclusion.ringInd));
                    }
                }

                // tslint:disable-next-line:max-line-length
                polygon(polygons, {
                    color: cantonDisplay.color,
                    fillColor: cantonDisplay.fillColor,
                    fillOpacity: cantonDisplay.fillOpacity
                }).addTo(this.layerGroup);

                cnt++;
            }

            // finally add all objects to the map
            this.map.addLayer(this.layerGroup);
            if (this.doCenter) {
                this.mvs = this.geoService.calculateMapViewSettings(this.abbr);
                this.map.setView([this.mvs.centerLat, this.mvs.centerLng], this.mvs.zoom);
                this.doCenter = false; // now the user takes control of zoom and centering
            }

            this.title = this.txtyouareat + ' ' + cantonDisplay.label;
            // console.log('title set to ' + this.txtyouareat + ' ' + cantonDisplay.label);


        }

    }

    setupMap() {
        if (this.map === undefined) {

            const tileUrlOffline = '/assets/stctiles/{z}/{x}/{y}.jpeg';
            const attribution = 'Map data © <a href="https://geo.admin.ch">geo.admin.ch</a>';

            this.map = new L.Map('map', {crs: CRS.EPSG3857, minZoom: 7, maxZoom: 12});
            L.tileLayer(tileUrlOffline, {minZoom: 7, maxZoom: 12, attribution}).addTo(this.map);

            // tslint:disable-next-line:one-variable-per-declaration
            const southWest = latLng(45.24, 5.3), // Grenoble
                northEast = latLng(48.10, 10.9); // München

            const bounds = latLngBounds(southWest, northEast);
            this.map.setMaxBounds(bounds);

        }

        // remove old stuff
        this.map.removeLayer(this.layerGroup);
        // initialize
        this.layerGroup = new LayerGroup<any>();
    }

    _initialiseTranslation(): void {
        this.translate.get('txthint').subscribe((res: string) => {
            this.txthint = res;
        });
        this.translate.get('txterror').subscribe((res: string) => {
            this.txterror = res;
        });
        this.translate.get('txtoutsidech').subscribe((res: string) => {
            this.txtoutsidech = res;
        });
        this.translate.get('txtlocatingerror').subscribe((res: string) => {
            this.txtlocatingerror = res;
        });
        this.translate.get('txtdismiss').subscribe((res: string) => {
            this.txtdismiss = res;
        });
        this.translate.get('txtlocating').subscribe((res: string) => {
            this.txtlocating = res;
        });
        this.translate.get('txtyouareat').subscribe((res: string) => {
            this.txtyouareat = res;
        });
    }

    presentOutsideSwitzerlandAlert() {

        this.alertCtrl.create({
            animated: true,
            header: this.txthint,
            message: this.txtoutsidech,
            buttons: [this.txtdismiss]
        }).then(alertEl => alertEl.present());
        this.title = '';
        this.doCenter = true;
    }

    simKt(abbr: string) {
        const cantonDisplay: CantonDisplay = CantonDisplay[abbr];
        this.latitude = cantonDisplay.lat;
        this.longitude = cantonDisplay.lng;
        this.accuracy = 10;
        this.doCenter = true;
        this.showCanton();
    }

    simRandom() {
        const arr: string[] = Object.keys(CantonDisplay);
        const random = Math.floor(Math.random() * arr.length);
        const randomAbbr = arr[random];
        const cantonDisplay: CantonDisplay = CantonDisplay[randomAbbr];
        this.latitude = cantonDisplay.lat;
        this.longitude = cantonDisplay.lng;
        this.accuracy = 10;
        this.doCenter = true;
        this.showCanton();
    }


    simVorarlberg() {

        this.latitude = 47.503040;
        this.longitude = 9.747070;
        this.accuracy = 10;
        this.doCenter = true;
        this.showCanton();
    }

    simHornTG() {

        this.latitude = 47.495701;
        this.longitude = 9.463580;
        this.accuracy = 10;
        this.doCenter = true;
        this.showCanton();
    }

}
