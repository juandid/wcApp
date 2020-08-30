export class CantonDisplay {
    public static readonly SG = new CantonDisplay('St. Gallen', '#139e3d', '#139e3d', 0.3, 47.424480, 9.376717);
    public static readonly NW = new CantonDisplay('Nidwalden', '#e84c48', '#e84c48', 0.3, 46.957142, 8.366120);
    public static readonly AR = new CantonDisplay('Appenzell Ausserrhoden', '#0c0c0c', '#0c0c0c', 0.3, 47.385849, 9.278850);
    public static readonly UR = new CantonDisplay('Uri', '#0c0c0c', '#0c0c0c', 0.3, 46.880260, 8.644860);
    public static readonly AI = new CantonDisplay('Appenzell Innerrhoden', '#0c0c0c', '#0c0c0c', 0.3, 47.334930, 9.406594);
    public static readonly TI = new CantonDisplay('Tessin', '#3190ce', '#3190ce', 0.3, 46.193291, 9.018020);
    public static readonly TG = new CantonDisplay('Thurgau', '#139e3d', '#139e3d', 0.3, 47.553600, 8.898754);
    public static readonly VS = new CantonDisplay('Wallis', '#e84c48', '#e84c48', 0.3, 46.233124, 7.360626);
    public static readonly GR = new CantonDisplay('Graubünden', '#3190ce', '#3190ce', 0.3, 46.849491, 9.530670);
    public static readonly BE = new CantonDisplay('Bern', '#e84c48', '#e84c48', 0.3, 46.947975, 7.447447);
    public static readonly SH = new CantonDisplay('Schaffhausen', '#0c0c0c', '#0c0c0c', 0.3, 47.695889, 8.638049);
    public static readonly SO = new CantonDisplay('Solothurn', '#e84c48', '#e84c48', 0.3, 47.206959, 7.533310);
    public static readonly ZH = new CantonDisplay('Zürich', '#3190ce', '#3190ce', 0.3, 47.376888, 8.541694);
    public static readonly BS = new CantonDisplay('Basel Stadt', '#0c0c0c', '#0c0c0c', 0.3, 47.559601, 7.588576);
    public static readonly SZ = new CantonDisplay('Schwyz', '#e84c48', '#e84c48', 0.3, 47.021030, 8.653600);
    public static readonly BL = new CantonDisplay('Basel Land', '#e84c48', '#e84c48', 0.3, 47.482792, 7.735810);
    public static readonly GL = new CantonDisplay('Glarus', '#e84c48', '#e84c48', 0.3, 47.042690, 9.067510);
    public static readonly JU = new CantonDisplay('Jura', '#e84c48', '#e84c48', 0.3, 47.365210, 7.343580);
    public static readonly AG = new CantonDisplay('Aargau', '#3190ce', '#3190ce', 0.3, 47.390434, 8.045701);
    public static readonly NE = new CantonDisplay('Neuenburg', '#139e3d', '#139e3d', 0.3, 46.992008, 6.930920);
    public static readonly ZG = new CantonDisplay('Zug', '#3190ce', '#3190ce', 0.3, 47.169877, 8.518913);
    public static readonly FR = new CantonDisplay('Freiburg', '#0c0c0c', '#0c0c0c', 0.3, 46.806477, 7.161972);
    public static readonly LU = new CantonDisplay('Luzern', '#3190ce', '#3190ce', 0.3, 47.045540, 8.308010);
    public static readonly VD = new CantonDisplay('Waadt', '#139e3d', '#139e3d', 0.3, 46.519653, 6.632273);
    public static readonly OW = new CantonDisplay('Obwalden', '#e84c48', '#e84c48', 0.3, 46.895779, 8.245590);
    public static readonly GE = new CantonDisplay('Genf', '#e84c48', '#e84c48', 0.3, 46.204391, 6.143158);

    // tslint:disable-next-line:max-line-length
    private constructor(public readonly label: string, readonly color: string, public readonly fillColor: string, public readonly fillOpacity: number, public readonly lat: number, public readonly lng: number) {
    }

}
