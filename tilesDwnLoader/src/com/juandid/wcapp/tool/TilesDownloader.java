package com.juandid.wcapp.tool;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

public class TilesDownloader {

    public static void main(String[] args) {


        //<TileSetId>/<TileRow>/<TileCol>
        List<TileRange> tileRanges = new ArrayList<>();


        tileRanges.add(new TileRange(8, 130, 137, 88, 92));
        tileRanges.add(new TileRange(9, 262, 272, 177, 183));
        tileRanges.add(new TileRange(10, 527, 529, 355, 364));
        tileRanges.add(new TileRange(11, 1052, 1087, 712, 728));
        //tileRanges.add(new TileRange(12, 2113, 2157, 1429, 1451));

        for (int i = 0; i < tileRanges.size(); i++) {
            TileRange tileRange = tileRanges.get(i);
            for (int row = tileRange.rowLower; row <= tileRange.rowUpper; row++) {
                for (int col = tileRange.colLower; col <= tileRange.colUpper; col++) {
                    String currentUrlStr = String.format("https://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/%d/%d/%d.jpeg", tileRange.zoom, row, col);
                    String folderStr = String.format("/Users/aj/ws/wcApp/src/assets/tiles/%d/%d", tileRange.zoom, row);
                    String fileStr = String.format("/Users/aj/ws/wcApp/src/assets/tiles/%d/%d/%d.jpeg", tileRange.zoom, row, col);
                    try{
                        File folderFile = new File(folderStr);
                        if (isFolderExists(folderFile)){
                            // do nothing
                        }else{
                            Files.createDirectories(Paths.get(folderStr));
                        }
                    }catch (Exception e){
                        System.err.println("failed to create folder " + e.getMessage());
                    }
                    try {
                        File imgFile = new File(fileStr);
                        if (isFileExists(imgFile)){
                            // do nothing
                            System.out.println("skip " + fileStr);
                        }else{
                            InputStream in = new URL(currentUrlStr).openStream();
                            Files.copy(in, Paths.get(fileStr));
                            System.out.println("done " + fileStr);
                        }
                    } catch (Exception e) {
                        System.err.println("failed to download picture " + e.getMessage());
                    }

                }
            }
        }


    }

    public static boolean isFileExists(File file) {
        return file.exists() && !file.isDirectory();
    }

    public static boolean isFolderExists(File file) {
        return file.exists() && file.isDirectory();
    }
}
