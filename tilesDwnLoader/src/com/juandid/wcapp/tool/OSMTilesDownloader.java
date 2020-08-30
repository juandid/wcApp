package com.juandid.wcapp.tool;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

public class OSMTilesDownloader {

    public static void main(String[] args) {


        //<TileSetId>/<TileRow>/<TileCol>
        List<TileRange> tileRanges = new ArrayList<>();
        tileRanges.add(new TileRange(7, 65, 68, 43, 46));
        tileRanges.add(new TileRange(8, 130, 137, 87, 92));
        tileRanges.add(new TileRange(9, 263, 271, 176, 183));
        tileRanges.add(new TileRange(10, 530, 542, 355, 365));
        tileRanges.add(new TileRange(11, 1052, 1087, 711, 731));
        // tileRanges.add(new TileRange(12, 2116, 2168, 1426, 1461));

        for (int i = 0; i < tileRanges.size(); i++) {
            TileRange tileRange = tileRanges.get(i);
            for (int row = tileRange.rowLower; row <= tileRange.rowUpper; row++) {
                for (int col = tileRange.colLower; col <= tileRange.colUpper; col++) {
                    String sourceUrlStr = String.format("https://tile.openstreetmap.org/%d/%d/%d.png", tileRange.zoom, row, col);
                    String folderStr = String.format("src/assets/osmtiles/%d/%d", tileRange.zoom, row);
                    String targetFileStr = String.format("src/assets/osmtiles/%d/%d/%d.png", tileRange.zoom, row, col);
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
                        File imgFile = new File(targetFileStr);
                        if (isFileExists(imgFile)){
                            // do nothing
                            System.out.println("skip " + targetFileStr);
                        }else{
                            int code = downloadImage(sourceUrlStr, targetFileStr);
                            System.out.println("done " + targetFileStr + " with status code " + code);
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


    private static int downloadImage(String sourceUrlStr, String targetFileStr) {
        int code = 0;
        try {
            CloseableHttpClient client = HttpClientBuilder.create().build();
            HttpGet request = new HttpGet(sourceUrlStr);
            request.addHeader("Accept", "image/webp,image/apng,image/*,*/*;q=0.8");
            request.addHeader("Referer", "http://localhost:4200/home");
            request.addHeader("User-Agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1");
            HttpResponse response = client.execute(request);
            HttpEntity entity = response.getEntity();

            code = response.getStatusLine().getStatusCode();

            // System.out.println("Request Url: " + request.getURI());
            // System.out.println("Response Code: " + responseCode);

            InputStream is = entity.getContent();

            FileOutputStream fos = new FileOutputStream(new File(targetFileStr));

            int inByte;
            while ((inByte = is.read()) != -1) {
                fos.write(inByte);
            }

            is.close();
            fos.close();

            client.close();
            // System.out.println("File Download Completed!!!");
        } catch (ClientProtocolException e) {
            e.printStackTrace();
        } catch (UnsupportedOperationException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return code;
    }

}
