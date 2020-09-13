package com.juandid.wcapp.tool;

import java.awt.*;

public class ChPolygon {


    public static Polygon getDummyPolygon(int maxXY) {
        Polygon polygon = new Polygon();
        polygon.addPoint(0,0);
        polygon.addPoint(maxXY,0);
        polygon.addPoint(maxXY,maxXY);
        polygon.addPoint(0,maxXY);
        polygon.addPoint(0,0);
        return polygon;
    }
    public static Polygon getPolygonForZoom(int zoom) {


        double chPolygon[][] =
                {
                        {5.438232, 45.97406},
                        {7.053223, 45.598666},
                        {8.382568, 45.805829},
                        {9.162598, 45.598666},
                        {9.569092, 46.057985},
                        {10.305176, 46.042736},
                        {10.788574, 46.55886},
                        {10.722656, 47.077604},
                        {9.997559, 47.197178},
                        {10.118408, 47.569114},
                        {9.250488, 47.908978},
                        {8.503418, 47.960502},
                        {7.371826, 47.746711},
                        {6.82251, 47.635784},
                        {6.16333, 47.15984},
                        {5.471191, 46.589069},
                        {5.438232, 45.97406}
                };

        Polygon polygon = new Polygon();
        for (int i = 0; i < chPolygon.length; i++) {
            double[] lonlat = chPolygon[i];
            TilePoint tilePoint = getTileNumber(lonlat[1], lonlat[0], zoom);
            polygon.addPoint(tilePoint.x, tilePoint.y);
        }

        return polygon;

    }


    public static TilePoint getTileNumber(final double lat, final double lon, final int zoom) {
        int xtile = (int)Math.floor( (lon + 180) / 360 * (1<<zoom) ) ;
        int ytile = (int)Math.floor( (1 - Math.log(Math.tan(Math.toRadians(lat)) + 1 / Math.cos(Math.toRadians(lat))) / Math.PI) / 2 * (1<<zoom) ) ;
        if (xtile < 0)
            xtile=0;
        if (xtile >= (1<<zoom))
            xtile=((1<<zoom)-1);
        if (ytile < 0)
            ytile=0;
        if (ytile >= (1<<zoom))
            ytile=((1<<zoom)-1);
        return new TilePoint(zoom, xtile, ytile);
    }

}
