import {Exclusion} from './Exclusion';

export class CantonExclusions {

    public static readonly FR = new CantonExclusions([{cantInd: 9, ringInd: 2}, ]);
    public static readonly TG = new CantonExclusions([{cantInd: 15, ringInd: 1}, ]);
    public static readonly BE = new CantonExclusions([{cantInd: 3, ringInd: 4}, {cantInd: 18, ringInd: 3}, ]);
    public static readonly ZH = new CantonExclusions([{cantInd: 23, ringInd: 1}, ]);
    public static readonly SG = new CantonExclusions([{cantInd: 4, ringInd: 1}, {cantInd: 17, ringInd: 0}, {cantInd: 17, ringInd: 1}, {cantInd: 17, ringInd: 2}, {cantInd: 17, ringInd: 3}, {cantInd: 17, ringInd: 4}, {cantInd: 21, ringInd: 0}, ]);
    public static readonly AR = new CantonExclusions([{cantInd: 17, ringInd: 3}, {cantInd: 17, ringInd: 4}, ]);
    public static readonly VD = new CantonExclusions([{cantInd: 0, ringInd: 1}, {cantInd: 0, ringInd: 2}, {cantInd: 3, ringInd: 2}, {cantInd: 3, ringInd: 3}, {cantInd: 3, ringInd: 5}, ]);

    private constructor(public readonly exclusions: Exclusion[]) {
    }

}
