//Implementation according to official flowchart. For more details see: https://www.bundesfinanzministerium.de/Content/DE/Downloads/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/2020-11-09-PAP-2021-anlage-1.pdf?__blob=publicationFile&v=2
const lzz: number = 1; //Lohnzahlungszeitraum: 1 = Jahr, 2 = Monat, 3 = Wochem, 4 = Tag
const gfb: number = 0; //Grundfreibetrag in Euro
const solzfrei: number = 16956; //Freigrenze für den Solidaritätszuschlag in Euro

class TaxCalculator2021 {
    zve: number = 100000; //Zu versteuerndes Einkommen in Euro, Cent (2 Dezimalstellen)
    kztab: number = 1; //Kennzahl für die Einkommensteuer-Tarifarten. 1 = Grundtarif, 2 = Splittingverfahren
    r: number = 0; //Religionsgemeinschaft des Arbeitnehmers lt. elektronischer Lohnsteuerabzugsmerkmale oder der Bescheinigung für den Lohnsteuerabzug 2021 (bei keiner Religionszugehörigkeit = 0)

    constructor(zve: number, kztab: number, r: number) {
        this.zve = zve;
        this.kztab = kztab;
        this.r = r;
    }

    getTaxableIncome(): number {
        return this.upmlst(this.zve, this.kztab);
    }

    getIncomeTax(): number {
        let taxableIncome = this.getTaxableIncome();
        return this.uptab21(taxableIncome, gfb, this.kztab);
    }

    getSolidarityTax(): number {
        let jbmg = this.getIncomeTax();
        return +(this.msolz(jbmg, solzfrei, this.kztab, lzz) / 100).toFixed(2);
    }

    getChurchTax(): number {
        let churchTax: number = 0;
        if (this.r === 0) {
            return churchTax;
        }

        let jbmg = this.getIncomeTax();
        let bk = this.bk(jbmg, this.r);

        if (this.r === 1 || this.r === 2) {
            churchTax = bk * 0.08;
        } else {
            churchTax = bk * 0.09;
        }

        return +(churchTax / 100).toFixed(2)
    }

    private msolz(jbmg: number, currentSolzfrei: number, kztab: number, lzz: number): number {

        let solzlzz: number = 0;

        let solzfrei: number = currentSolzfrei * kztab;

        if (jbmg > solzfrei) {
            let solzj: number = jbmg * 5.5 / 100;

            let solzmin: number = (jbmg - solzfrei) * 11.9 / 100;

            if (solzmin < solzj) {
                solzj = solzmin;
            }

            let jw: number = solzj * 100;

            solzlzz = this.upanteil(lzz, jw);
        }

        return solzlzz
    }

    private bk(jbmg: number, r: number): number {
        let bk: number = 0;

        if (r > 0) {
            let jw: number = jbmg * 100;
            bk = this.upanteil(lzz, jw);
        }

        return bk;
    }

    private upanteil(lzz: number, jw: number): number {
        if (lzz === 1) {
            return jw;
        }

        if (lzz === 2) {
            return Math.floor(jw / 12);
        }

        if (lzz === 3) {
            return Math.floor(jw * 7 / 360);
        }

        return Math.floor(jw / 360);
    }

    private upmlst(zve: number, kztab: number): number {
        if (zve < 1) {
            return 0;
        }

        return zve / kztab;
    }

    private uptab21(x: number, gfb: number, kztab: number): number {
        let st: number = 0;

        if (x < (gfb + 1)) {
            return st;
        }

        if (x < 14754) {
            let y: number = (x - gfb) / 10000;
            let rw: number = y * 995.21;
            rw += 1400;
            st = rw * y;
        } else if (x < 57919) {
            let y: number = (x - 14753) / 10000;
            let rw: number = y * 208.85;
            rw += 2397;
            rw *= y;
            st = rw + 950.96;
        } else if (x < 274613) {
            st = x * 0.42 - 9136.63;
        } else {
            st = x * 0.45 - 17374.99;
        }

        return Math.floor(st) * kztab;
    }
}

let gross = 100000;
if (process.argv.length >= 3)
    gross = Number(process.argv[2]);
let taxCalculator2021 = new TaxCalculator2021(gross, 1, 1);
console.log("TaxableIncome  Zu versteuerndes Einkommen gem. § 32a Absatz 1 und 5 EStG: " + taxCalculator2021.getTaxableIncome());
console.log("IncomeTax      Einkommenssteuer: " + taxCalculator2021.getIncomeTax());
console.log("SolidarityTax  Solidaritätszuschlag: " + taxCalculator2021.getSolidarityTax());
console.log("ChurchTax      Kirchensteuer: " + taxCalculator2021.getChurchTax());