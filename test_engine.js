import { runOpCoEngine } from './src/financialEngine.js';
import { INITIAL_GROUPS } from './src/constants.js';

const opCoAssumptions = {
  devDurationMonths: 25,
  beds: 100, alos: 3, opIpRatio: 4,
  ipRevenue: 1000, opRevenue: 200, medSupplyInf: 3,
  borMax: 80, borStart: 50, borIncrement: 5,
  docFeeIp: 10, docFeeOp: 10, ipMedSupply: 100, opMedSupply: 20,
  monthlyStaffCost: 100, staffCostInc: 3,
  annualRentYear1: 500, rentInc: 3, corporateTax: 22,
  priceIncYears1_6: 3, priceIncYears7_plus: 2,
  partnerAEquity: 1000, partnerBEquity: 1000, equitySplitY1: 50,
  jvaOpex: 10,
};

const op1 = runOpCoEngine(opCoAssumptions, { projYears: 5 });
const yr3 = op1.annualData.find((d) => d.year === "Year 3");
console.log("yr 3 ipRev monthly:", yr3.monthly.ipRev);
console.log("yr 3 isOperating:", yr3.isOperating);
