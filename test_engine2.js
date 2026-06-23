import { runConsolidatedEngine, runPropCoEngine, runOpCoEngine } from './src/financialEngine.js';
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

const propCoAssumptions = {
  devDurationMonths: 25,
  interestRate: 10,
  debtTenor: 10,
  developmentBudget: 100000,
  ltv: 50,
  annualRentYear1: 500,
  rentInc: 3,
};

const op1 = runOpCoEngine(opCoAssumptions, { projYears: 5 });
const pr1 = runPropCoEngine(propCoAssumptions, op1, { projYears: 5 }, INITIAL_GROUPS);
const c1 = runConsolidatedEngine(op1, pr1, opCoAssumptions);

const opYr3 = op1.annualData.find((d) => d.year === "Year 3");
const prYr3 = pr1.annualData.find((d) => d.year === "Year 3");
const cYr3 = c1.annualData.find((d) => d.year === "Year 3");

console.log("opYr3 totalRev monthly:", opYr3.monthly.totalRev);
console.log("prYr3 rentIn monthly:", prYr3.monthly.rentIn);
console.log("cYr3 totalRev monthly:", cYr3.monthly.totalRev);
