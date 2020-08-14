package com.juandid.wcapp.tool;

public class TileRange {

    public int zoom;
    public int rowLower;
    public int rowUpper;
    public int colLower;
    public int colUpper;

    public TileRange(int zoom, int rowLower, int rowUpper, int colLower, int colUpper) {
        this.zoom = zoom;
        this.rowLower = rowLower;
        this.rowUpper = rowUpper;
        this.colLower = colLower;
        this.colUpper = colUpper;
    }
}
