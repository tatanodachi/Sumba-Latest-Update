const calculatePMT = (rate, nper, pv) =>
  rate === 0 ? -(pv / nper) : -(pv * rate) / (1 - Math.pow(1 + rate, -nper));

const calculatePayback = (cfs, frequency = "annual") => {
  if (!cfs || cfs.length === 0) return 0;
  let cumulative = 0;
  for (let i = 0; i < cfs.length; i++) {
    let prevCumulative = cumulative;
    cumulative += cfs[i] || 0;
    if (cumulative >= 0 && prevCumulative < 0) {
      const fraction = Math.abs(prevCumulative) / (cfs[i] || 1);
      const periods = i + fraction;
      return frequency === "monthly" ? periods / 12 : periods;
    }
  }
  return 0; // Return 0 if the project never catches up, preventing fake extrapolation
};

const calculateIRR = (cfs, frequency = "annual") => {
  if (!cfs || cfs.length === 0) return 0;

  // Quick check to see if we have both positive and negative values. If not, IRR is mathematically invalid.
  let hasPositive = false;
  let hasNegative = false;
  for (let i = 0; i < cfs.length; i++) {
    const v = cfs[i] || 0;
    if (v > 1e-6) hasPositive = true;
    if (v < -1e-6) hasNegative = true;
  }
  if (!hasPositive || !hasNegative) return 0;

  // Try Newton-Raphson first (high precision and speed)
  let rate = frequency === "monthly" ? 0.01 : 0.1;
  let converged = false;

  for (let i = 0; i < 120; i++) {
    let npv = 0;
    let dNpv = 0;
    for (let t = 0; t < cfs.length; t++) {
      const val = cfs[t] || 0;
      const factor = Math.pow(1 + rate, t);
      npv += val / factor;
      if (t > 0) dNpv -= (t * val) / Math.pow(1 + rate, t + 1);
    }
    if (Number.isNaN(npv) || Number.isNaN(dNpv) || !Number.isFinite(npv) || !Number.isFinite(dNpv)) {
      break;
    }
    if (Math.abs(dNpv) < 1e-12) break;
    let newRate = rate - npv / dNpv;
    if (Math.abs(newRate - rate) < 1e-7) {
      rate = newRate;
      converged = true;
      break;
    }
    // Prevent the rate estimate from leaping out of reasonable physical bounds
    if (newRate < -0.999) {
      rate = -0.5;
    } else if (newRate > 5.0) {
      rate = 2.0;
    } else {
      rate = newRate;
    }
  }

  if (converged) {
    if (frequency === "monthly") {
      const annualEquivalent = Math.pow(1 + rate, 12) - 1;
      if (!isNaN(annualEquivalent) && isFinite(annualEquivalent)) return annualEquivalent;
    } else {
      return rate;
    }
  }

  // Bisection Fallback (guaranteed convergence on signs changes)
  let low = -0.99;
  let high = 5.0;
  for (let i = 0; i < 80; i++) {
    let mid = (low + high) / 2;
    let npv = 0;
    for (let t = 0; t < cfs.length; t++) {
      npv += (cfs[t] || 0) / Math.pow(1 + mid, t);
    }
    if (Math.abs(npv) < 1e-6) {
      if (frequency === "monthly") {
        return Math.pow(1 + mid, 12) - 1;
      }
      return mid;
    }
    // Find initial non-zero sign to handle conventional vs unconventional patterns
    const firstNonZero = cfs.find((v) => Math.abs(v) > 1e-6) || -1;
    if (npv > 0) {
      if (firstNonZero < 0) {
        low = mid;
      } else {
        high = mid;
      }
    } else {
      if (firstNonZero < 0) {
        high = mid;
      } else {
        low = mid;
      }
    }
  }

  let finalMid = (low + high) / 2;
  if (frequency === "monthly") {
    return Math.pow(1 + finalMid, 12) - 1;
  }
  return finalMid;
};

const calculateNPV = (cfs, rate, frequency = "annual") => {
  if (!cfs) return 0;
  const discountRate = rate || 12;
  if (frequency === "monthly") {
    const rMonthly = Math.pow(1 + discountRate / 100, 1 / 12) - 1;
    return cfs.reduce(
      (acc, val, t) => acc + (val || 0) / Math.pow(1 + rMonthly, t),
      0,
    );
  }
  return cfs.reduce(
    (acc, val, i) => acc + (val || 0) / Math.pow(1 + discountRate / 100, i),
    0,
  );
};

const DEFAULT_OPCO_ASSUMPTIONS = {
  beds: 120,
  alos: 4,
  opIpRatio: 40,
  borStart: 45,
  borMax: 65,
  borIncrement: 5,
  ipRevenue: 25,
  opRevenue: 0.5,
  priceIncYears1_6: 6,
  priceIncYears7_plus: 5,
  monthlyStaffCost: 3.8,
  staffInf: 4,
  ipMedSupply: 4.5,
  opMedSupply: 0.2,
  medSupplyInf: 3,
  adminExpRate: 2,
  utilExpRate: 5,
  mktgExpRate: 2,
  operatorFeeRate: 2.5,
  insuranceMonthly: 52.3,
  docFeeIp: 16,
  docFeeOp: 24,
  rentStructureType: "flatEbitdar",
  rentFlatEbitdarRate: 15,
  rentRevRate: 6,
  rentProfitRate: 2,
  rentTier1Rate: 15,
  rentTier2Rate: 15,
  rentTier3Rate: 15,
  rentTier1Limit: 1.8,
  rentTier2Limit: 2.2,
  corporateTax: 22,
  partnerAEquity: 41.87,
  partnerBEquity: 40.23,
  jvaOpex: 2.5,
  commOpex: 15,
  workingCapitalOpex: 64.671175,
  sharingPercentA: 51.0,
  equitySplitY1: 100,
  discountRate: 12,
  holdCoDiscountRate: 11,
  includeTerminalValue: true,
  exitMultiple: 10,
  sellingCosts: 0,
  dividendPayoutRatio: 80,
};

const DEFAULT_PROPCO_ASSUMPTIONS = {
  linkToOpCo: true,
  manualBaseRent: 35,
  manualRentEscalation: 3,
  includeLand: false,
  landArea: 12643,
  landPrice: 15,
  buildArea: 13000,
  buildCost: 11.5,
  capexInfraQty: 8310,
  capexInfraPrice: 0.45,
  includeFFE: true,
  capexFFEQty: 1,
  capexFFEPrice: 26000,
  capexSharingDevQty: 5361,
  capexSharingDevPrice: 0.8,
  capexContingencyPct: 5,
  capexConsultantPct: 2.5,
  capexLicensePct: 1.5,
  capexVat: 11,
  devDurationMonths: 24,
  equityDrawYear1Pct: 100,
  devGaMonthly: 0.5,
  devCarPct: 0.15,
  opOverheadMonthly: 0,
  opOverheadInc: 4,
  ffeReservePct: 2,
  includeFinancing: false,
  drawdownScenario: "tranches",
  drawdownTranches: [20, 40, 60, 80, 100],
  ltv: 70,
  interestRate: 8.5,
  loanTenor: 15,
  ioGracePeriodYears: 3,
  maintRate: 0,
  propTaxRate: 0,
  corporateTax: 22,
  discountRate: 11,
  depLifeBuilding: 20,
  depMethodBuilding: "SL",
  depLifeInfra: 20,
  depMethodInfra: "SL",
  depLifeFFE: 20,
  depMethodFFE: "SL",
  depLifeSoftCost: 20,
  depMethodSoftCost: "SL",
  includeTerminalValue: true,
  exitMethod: "multiple",
  exitCapRate: 8.5,
  exitMultiple: 10,
  sellingCosts: 0,
};

const parseTimelineTimings = (groups, projYears, fallbackDevDuration) => {
  const allTasks = (groups || []).flatMap((g) => g.tasks || []);
  const hasTimeline = allTasks.length > 0;

  const commOpeningTask = allTasks.find(
    (t) => t.id === "t13" || t.name.toLowerCase().includes("commercial opening")
  );
  
  const totalDevMonths =
    hasTimeline && commOpeningTask
      ? Math.max(1, commOpeningTask.start - 1)
      : fallbackDevDuration || 24;

  const getTaskTimingDistribution = (matchStrs) => {
    const monthly = new Array(projYears * 12).fill(0);
    const tasks = allTasks.filter((t) =>
      matchStrs.some((str) => t.name.toLowerCase().includes(str.toLowerCase()))
    );
    if (tasks.length === 0) return null;

    let totalActiveMonths = 0;
    tasks.forEach((task) => {
      totalActiveMonths += Math.max(1, task.duration);
    });

    tasks.forEach((task) => {
      const s = Math.max(0, task.start - 1);
      const d = Math.max(1, task.duration);
      for (let m = s; m < s + d && m < monthly.length; m++) {
        monthly[m] += 1 / totalActiveMonths;
      }
    });
    return monthly;
  };

  const getSingleTaskTimingDistribution = (taskId, fallbackKeywords) => {
    const task = allTasks.find((t) => t.id === taskId);
    if (task) {
      const monthly = new Array(projYears * 12).fill(0);
      const s = Math.max(0, (parseInt(task.start) || 1) - 1);
      const d = Math.max(1, parseInt(task.duration) || 1);
      for (let m = s; m < s + d && m < monthly.length; m++) {
        monthly[m] = 1 / d;
      }
      return monthly;
    }
    if (fallbackKeywords && fallbackKeywords.length > 0) {
      return getTaskTimingDistribution(fallbackKeywords);
    }
    return null;
  };

  if (!hasTimeline) return null;

  return {
    totalDevMonths,
    constrTiming: getSingleTaskTimingDistribution("c7", ["structure", "construction", "piling", "foundation", "superstructure"]),
    infraTiming: getSingleTaskTimingDistribution("c5", ["infrastructure"]),
    ffeTiming: getSingleTaskTimingDistribution("c4", ["ff&e", "interior", "fit-out", "furniture"]),
    sharingTiming: getSingleTaskTimingDistribution("c6", ["sharing"]),
    consultantTiming: getSingleTaskTimingDistribution("c3", ["consultant", "feasibility", "architectural", "layouts"]),
    licenseTiming: getSingleTaskTimingDistribution("c2", ["licens", "permit", "clearance"]),
    landTiming: getSingleTaskTimingDistribution("c1", ["land"]),
    eqTiming: getSingleTaskTimingDistribution("c8", ["asset lease", "equipment", "medical equip"]),
  };
};

const CANCER_DATA = [
  { name: "Breast", cases: 66271, fill: "#1C6048" },
  { name: "Lung", cases: 38904, fill: "#9B8B70" },
  { name: "Cervical", cases: 36964, fill: "#99B6AA" },
  { name: "Colorectal", cases: 35676, fill: "#EFEBE7" },
  { name: "Liver", cases: 23805, fill: "#D8D8D8" },
];

const INSURANCE_DATA = [
  { year: "2021", value: 14.3 },
  { year: "2022", value: 16.2 },
  { year: "2023", value: 18.8 },
  { year: "2024", value: 21.4 },
  { year: "2025", value: 24.1 },
  { year: "2026", value: 27.2 },
];

const callGemini = async (prompt, systemInstruction) => {
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemInstruction }),
      });
      if (!response.ok) {
        let errMsg = "API Error";
        try {
          const errJson = await response.json();
          errMsg = errJson.error || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }
      const result = await response.json();
      return result.text || "No response generated.";
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed:`, error.message);
      if (i === 2) throw error;
      await new Promise((res) => setTimeout(res, Math.pow(2, i) * 1000));
    }
  }
};

// ==========================================
// 2. FINANCIAL ENGINES
// ==========================================
const runOpCoEngine = (assumptions, config) => {
  const requestedYears = config?.projYears || 10;
  const projYears = Math.min(requestedYears, 30);
  const totalDevMonths = assumptions.devDurationMonths || 24;

  let exitYear = null;
  if (config?.exitYear !== undefined && config?.exitYear !== null) {
    exitYear = Math.min(config.exitYear, 30);
  } else if (assumptions.includeTerminalValue) {
    exitYear = 10;
  }
  const totalEquity = assumptions.partnerAEquity + assumptions.partnerBEquity;
  
  const MAX_MONTHS = 360; 
  let projectCfsMonthly = Array(MAX_MONTHS).fill(0);
  let partnerACfsMonthly = Array(MAX_MONTHS).fill(0);
  let partnerBCfsMonthly = Array(MAX_MONTHS).fill(0);

  let cumulativeNetIncome = 0;
  let partnerA_CumCF = 0;
  let partnerB_CumCF = 0;
  let cumulativeRetainedEarnings = 0;
  let prior_pA_Outlay_Total = 0;
  let prior_pB_Outlay_Total = 0;

  const monthlyLocal = {
      ipRev: [], opRev: [], totalRev: [], totalMedSupp: [], totalDocFee: [],
      grossProfit: [], staffCost: [], recurringOpex: [], ebitdar: [], rent: [],
      ebitda: [], tax: [], netIncome: [], cumNI: [], distributableProfit: [],
      retainedThisYear: [], cumulativeRetainedEarnings: [], shareA: [], shareB: [],
      opCoExit: [], pA_Exit: [], pB_Exit: [], ev: [], pA_Div: [], pA_Net: [], pA_Outlay: [],
      pA_Cum: [], pB_Div: [], pB_Net: [], pB_Outlay: [], pB_Cum: [], fcf: [], bor: [],
      pA_Yield: [], pB_Yield: [], ipCases: [], opVisits: [], otherOpex: [], adminOpex: [],
      utilOpex: [], mktgOpex: [], operatorOpex: [], insOpex: [],
      cfo: [], cfo_in: [], cfo_out: [], cfi: [], cfi_in: [], cfi_out: [], cff: [], cff_in: [], cff_out: []
  };

  const maxYearAllowed = Math.ceil(MAX_MONTHS / 12);
  
  for (let m = 1; m <= MAX_MONTHS; m++) {
    const y = Math.ceil(m / 12);
    const monthIdxInYear = (m - 1) % 12;
    const isLeap = ((2025 + y) % 4 === 0 && ((2025 + y) % 100 !== 0)) || ((2025 + y) % 400 === 0);
    const daysInYear = isLeap ? 366 : 365;
    const daysInMonth = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][monthIdxInYear];
    const daysShare = daysInMonth / daysInYear;
    
    let m_netInc = 0;
    let pA_Outlay = 0;
    let pB_Outlay = 0;
    
    if (m <= totalDevMonths) {
        const isY1 = m <= 12;
        const splitFactor = isY1 ? assumptions.equitySplitY1 / 100 : (100 - assumptions.equitySplitY1) / 100;
        const monthsInThisSplit = isY1 ? Math.min(12, totalDevMonths) : Math.max(1, totalDevMonths - 12);
        
        let net_month = 0;
        if (m === 1) net_month = -assumptions.jvaOpex;
        else if (m >= totalDevMonths - 5 && m <= totalDevMonths) net_month = -(assumptions.commOpex || 0) / 6;
        
        m_netInc = net_month;
        cumulativeNetIncome += m_netInc;
        
        pA_Outlay = (-assumptions.partnerAEquity * splitFactor) / Math.max(1, monthsInThisSplit);
        pB_Outlay = (-assumptions.partnerBEquity * splitFactor) / Math.max(1, monthsInThisSplit);
        
        prior_pA_Outlay_Total += pA_Outlay;
        prior_pB_Outlay_Total += pB_Outlay;
        
        partnerA_CumCF += pA_Outlay;
        partnerB_CumCF += pB_Outlay;
        
        projectCfsMonthly[m - 1] = pA_Outlay + pB_Outlay;
        partnerACfsMonthly[m - 1] = pA_Outlay;
        partnerBCfsMonthly[m - 1] = pB_Outlay;
        
        monthlyLocal.pA_Outlay.push(pA_Outlay); monthlyLocal.pB_Outlay.push(pB_Outlay);
        monthlyLocal.pA_Net.push(pA_Outlay); monthlyLocal.pB_Net.push(pB_Outlay);
        monthlyLocal.fcf.push(pA_Outlay + pB_Outlay);
        
        monthlyLocal.ipRev.push(0); monthlyLocal.opRev.push(0); monthlyLocal.totalRev.push(0);
        monthlyLocal.totalMedSupp.push(0); monthlyLocal.totalDocFee.push(0); monthlyLocal.grossProfit.push(0);
        
        let staffCost = assumptions.monthlyStaffCost * 12;
        let m_recOpex = (staffCost / 12) + (assumptions.insuranceMonthly / 1000); 
        
        monthlyLocal.staffCost.push(staffCost / 12);
        monthlyLocal.otherOpex.push(m_recOpex);
        monthlyLocal.adminOpex.push(0); monthlyLocal.utilOpex.push(0); monthlyLocal.mktgOpex.push(0);
        monthlyLocal.operatorOpex.push(0); monthlyLocal.insOpex.push(0);
        
        monthlyLocal.recurringOpex.push(m_recOpex); monthlyLocal.ebitdar.push(-m_recOpex);
        monthlyLocal.rent.push(0); monthlyLocal.ebitda.push(-m_recOpex);
        monthlyLocal.tax.push(0); monthlyLocal.netIncome.push(m_netInc);
        monthlyLocal.cumNI.push(cumulativeNetIncome);
        
        monthlyLocal.distributableProfit.push(0); monthlyLocal.retainedThisYear.push(0);
        monthlyLocal.cumulativeRetainedEarnings.push(0); monthlyLocal.shareA.push(0);
        monthlyLocal.shareB.push(0); monthlyLocal.opCoExit.push(0); monthlyLocal.pA_Exit.push(0);
        monthlyLocal.pB_Exit.push(0); monthlyLocal.ev.push(0); monthlyLocal.pA_Div.push(0);
        monthlyLocal.pA_Cum.push(partnerA_CumCF); monthlyLocal.pB_Div.push(0); monthlyLocal.pB_Cum.push(partnerB_CumCF);
        monthlyLocal.bor.push(0); monthlyLocal.pA_Yield.push(0); monthlyLocal.pB_Yield.push(0);
        monthlyLocal.ipCases.push(0); monthlyLocal.opVisits.push(0);
        
        monthlyLocal.cfo_in.push(0); monthlyLocal.cfo_out.push(m_netInc); monthlyLocal.cfo.push(m_netInc);
        monthlyLocal.cfi.push(0); monthlyLocal.cfi_in.push(0); monthlyLocal.cfi_out.push(0);
        let m_cff_in = -pA_Outlay - pB_Outlay; 
        monthlyLocal.cff_in.push(m_cff_in); monthlyLocal.cff_out.push(0); monthlyLocal.cff.push(m_cff_in);
    } else {
        const opMonth = m - totalDevMonths;
        const yearOfOp = Math.ceil(opMonth / 12);
        
        let bor = Math.min(
            assumptions.borMax / 100,
            assumptions.borStart / 100 + (yearOfOp - 1) * (assumptions.borIncrement / 100)
        );
        
        let bedDays = assumptions.beds * daysInYear * bor;
        let m_ipCases = (bedDays / assumptions.alos) * daysShare;
        let m_opVisits = m_ipCases * assumptions.opIpRatio;
        
        let priceMultiplier = 1;
        for (let j = 2; j <= yearOfOp; j++) {
            priceMultiplier *= 1 + (j <= 6 ? assumptions.priceIncYears1_6 : assumptions.priceIncYears7_plus) / 100;
        }

        let m_ipRev = (m_ipCases * (assumptions.ipRevenue * priceMultiplier)) / 1000;
        let m_opRev = (m_opVisits * (assumptions.opRevenue * priceMultiplier)) / 1000;
        let m_totalRev = m_ipRev + m_opRev;

        let costMultiplier = 1;
        for (let j = 2; j <= yearOfOp; j++) {
            costMultiplier *= 1 + assumptions.medSupplyInf / 100;
        }

        let m_totalMedSupp = ((m_ipCases * assumptions.ipMedSupply + m_opVisits * assumptions.opMedSupply) * costMultiplier) / 1000;
        let m_totalDocFee = (assumptions.docFeeIp / 100) * m_ipRev + (assumptions.docFeeOp / 100) * m_opRev;
        let m_grossProfit = m_totalRev - m_totalMedSupp - m_totalDocFee;

        let staffCost = assumptions.monthlyStaffCost * 12;
        let baseAnnualRent = assumptions.annualRentYear1 * 12;
        let staffMultiplier = 1; let rentMultiplier = 1;
        for (let j = 2; j <= yearOfOp; j++) {
            staffMultiplier *= 1 + assumptions.staffCostInc / 100;
            rentMultiplier *= 1 + assumptions.rentInc / 100;
        }
        
        let m_staffCost = (staffCost * staffMultiplier) / 12;
        let m_annualRent = baseAnnualRent * rentMultiplier;

        let m_adminOpex = ((assumptions.adminExpRate || 0) / 100) * m_totalRev;
        let m_utilOpex = ((assumptions.utilExpRate || 0) / 100) * m_totalRev;
        let m_mktgOpex = ((assumptions.mktgExpRate || 0) / 100) * m_totalRev;
        let m_operatorOpex = ((assumptions.operatorFeeRate || 0) / 100) * m_totalRev;
        let m_insOpex = (assumptions.insuranceMonthly || 0) / 1000;
        let m_otherOpex = m_adminOpex + m_utilOpex + m_mktgOpex + m_operatorOpex + m_insOpex;
        
        let m_recurringOpex = m_staffCost + m_otherOpex;
        let m_ebitdar = m_grossProfit - m_recurringOpex;
        let m_rent = m_annualRent / 12;
        let m_ebitda = m_ebitdar - m_rent;
        
        let pastYtdEbitda = 0;
        for (let pm = (yearOfOp - 1) * 12 + totalDevMonths + 1; pm < m; pm++) {
            pastYtdEbitda += monthlyLocal.ebitda[pm - 1]; 
        }
        let ytdEbitda = pastYtdEbitda + m_ebitda;
        let m_tax = 0;
        if (monthIdxInYear === 11 && ytdEbitda > 0) {
            m_tax = ytdEbitda * (assumptions.corporateTax / 100);
        }
        
        m_netInc = m_ebitda - m_tax;
        cumulativeNetIncome += m_netInc;
        
        let m_distributableProfit = 0;
        let m_retainedThisYear = 0; 
        let m_shareA = 0; 
        let m_shareB = 0;
        
        if (monthIdxInYear === 11 && cumulativeNetIncome > 0) {
           let prevCumNI = monthlyLocal.cumNI[m - 2] || 0;
           let available = prevCumNI < 0 ? cumulativeNetIncome : m_netInc;
           m_distributableProfit = Math.max(0, available) * ((assumptions.dividendPayoutRatio ?? 100) / 100);
           m_retainedThisYear = Math.max(0, available) - m_distributableProfit;
           cumulativeRetainedEarnings += m_retainedThisYear;
           m_shareA = m_distributableProfit * ((assumptions.sharingPercentA ?? 51) / 100);
           m_shareB = m_distributableProfit * (1 - (assumptions.sharingPercentA ?? 51) / 100);
        }

        monthlyLocal.ipRev.push(m_ipRev); monthlyLocal.opRev.push(m_opRev); monthlyLocal.totalRev.push(m_totalRev);
        monthlyLocal.totalMedSupp.push(m_totalMedSupp); monthlyLocal.totalDocFee.push(m_totalDocFee);
        monthlyLocal.grossProfit.push(m_grossProfit); monthlyLocal.staffCost.push(m_staffCost);
        monthlyLocal.otherOpex.push(m_otherOpex); monthlyLocal.adminOpex.push(m_adminOpex);
        monthlyLocal.utilOpex.push(m_utilOpex); monthlyLocal.mktgOpex.push(m_mktgOpex);
        monthlyLocal.operatorOpex.push(m_operatorOpex); monthlyLocal.insOpex.push(m_insOpex);
        monthlyLocal.recurringOpex.push(m_recurringOpex); monthlyLocal.ebitdar.push(m_ebitdar);
        monthlyLocal.rent.push(m_rent); monthlyLocal.ebitda.push(m_ebitda); monthlyLocal.tax.push(m_tax);
        monthlyLocal.netIncome.push(m_netInc); monthlyLocal.cumNI.push(cumulativeNetIncome);
        monthlyLocal.distributableProfit.push(m_distributableProfit); monthlyLocal.retainedThisYear.push(m_retainedThisYear);
        monthlyLocal.cumulativeRetainedEarnings.push(cumulativeRetainedEarnings); monthlyLocal.shareA.push(m_shareA);
        monthlyLocal.shareB.push(m_shareB); monthlyLocal.bor.push(bor * 100); monthlyLocal.ipCases.push(m_ipCases);
        monthlyLocal.opVisits.push(m_opVisits);
        
        let m_opCoExit = 0; let m_ev = 0; let m_pA_Exit = 0; let m_pB_Exit = 0;
        
        if (exitYear !== null && yearOfOp === exitYear && monthIdxInYear === 11) {
            let tv = assumptions.exitMethod === "multiple" 
                ? (ytdEbitda * (assumptions.exitMultiple || 10))
                : (ytdEbitda / ((assumptions.exitCapRate || 8.5) / 100));
            m_ev = tv;
            m_opCoExit = tv * (1 - ((assumptions.sellingCosts || 0) / 100));
            m_pA_Exit = m_opCoExit * ((assumptions.sharingPercentA ?? 51) / 100);
            m_pB_Exit = m_opCoExit * (1 - (assumptions.sharingPercentA ?? 51) / 100);
        }
        
        monthlyLocal.opCoExit.push(m_opCoExit); monthlyLocal.ev.push(m_ev);
        monthlyLocal.pA_Exit.push(m_pA_Exit); monthlyLocal.pB_Exit.push(m_pB_Exit);
        
        let m_pA_Net = m_shareA + m_pA_Exit;
        let m_pB_Net = m_shareB + m_pB_Exit;
        
        partnerA_CumCF += m_pA_Net;
        partnerB_CumCF += m_pB_Net;
        
        monthlyLocal.pA_Outlay.push(0); monthlyLocal.pB_Outlay.push(0);
        monthlyLocal.pA_Div.push(m_shareA); monthlyLocal.pA_Net.push(m_pA_Net); monthlyLocal.pA_Cum.push(partnerA_CumCF);
        monthlyLocal.pB_Div.push(m_shareB); monthlyLocal.pB_Net.push(m_pB_Net); monthlyLocal.pB_Cum.push(partnerB_CumCF);
        monthlyLocal.fcf.push(m_pA_Net + m_pB_Net);
        
        projectCfsMonthly[m - 1] = m_pA_Net + m_pB_Net;
        partnerACfsMonthly[m - 1] = m_pA_Net;
        partnerBCfsMonthly[m - 1] = m_pB_Net;
        
        monthlyLocal.pA_Yield.push(prior_pA_Outlay_Total !== 0 ? (m_shareA / Math.abs(prior_pA_Outlay_Total)) * 100 : 0);
        monthlyLocal.pB_Yield.push(prior_pB_Outlay_Total !== 0 ? (m_shareB / Math.abs(prior_pB_Outlay_Total)) * 100 : 0);
        
        monthlyLocal.cfo_in.push(m_ebitdar); 
        monthlyLocal.cfo_out.push(-m_rent - m_tax); 
        monthlyLocal.cfo.push(m_ebitdar - m_rent - m_tax);
        monthlyLocal.cfi.push(0); monthlyLocal.cfi_in.push(0); monthlyLocal.cfi_out.push(0);
        monthlyLocal.cff_in.push(0); monthlyLocal.cff_out.push(-m_shareA - m_shareB - m_pA_Exit - m_pB_Exit); 
        monthlyLocal.cff.push(-m_shareA - m_shareB - m_pA_Exit - m_pB_Exit);
    }
  }

  let annualDataOut = [];
  let currentCash = 0;
  for (let yr = 1; yr <= maxYearAllowed; yr++) {
      const isOperating = (yr * 12) > totalDevMonths;
      
      const yearRow = {
          year: `Year ${yr}`,
          isOperating,
          ipRev: 0, opRev: 0, totalRev: 0, totalMedSupp: 0, totalDocFee: 0, grossProfit: 0,
          staffCost: 0, recurringOpex: 0, ebitdar: 0, rent: 0, ebitda: 0, tax: 0, netIncome: 0,
          distributableProfit: 0, retainedThisYear: 0, shareA: 0, shareB: 0, pA_Outlay: 0, pB_Outlay: 0,
          pA_Div: 0, pB_Div: 0, pA_Net: 0, pB_Net: 0, pA_Exit: 0, pB_Exit: 0, fcf: 0,
          ipCases: 0, opVisits: 0,
          otherOpex: 0, adminOpex: 0, utilOpex: 0, mktgOpex: 0, operatorOpex: 0, insOpex: 0,
          cfo: 0, cfo_in: 0, cfo_out: 0, cfi: 0, cfi_in: 0, cfi_out: 0, cff: 0, cff_in: 0, cff_out: 0, netFlow: 0
      };
      
      const localMonthly = {};
      Object.keys(monthlyLocal).forEach(k => { localMonthly[k] = []; });
      
      for (let m = 0; m < 12; m++) {
          const globalMonthIdx = (yr - 1) * 12 + m;
          
          Object.keys(monthlyLocal).forEach(k => {
              const val = monthlyLocal[k][globalMonthIdx] || 0;
              localMonthly[k].push(val);
              
              if (k !== 'bor' && k !== 'pA_Yield' && k !== 'pB_Yield' && k !== 'cumNI' && k !== 'cumulativeRetainedEarnings' && k !== 'pA_Cum' && k !== 'pB_Cum' && k !== 'ev') {
                  yearRow[k] += val;
              }
          });
      }
      
      yearRow.bor = monthlyLocal.bor[(yr * 12) - 1] || 0;
      yearRow.cumNI = monthlyLocal.cumNI[(yr * 12) - 1] || 0;
      yearRow.cumulativeRetainedEarnings = monthlyLocal.cumulativeRetainedEarnings[(yr * 12) - 1] || 0;
      yearRow.pA_Cum = monthlyLocal.pA_Cum[(yr * 12) - 1] || 0;
      yearRow.pB_Cum = monthlyLocal.pB_Cum[(yr * 12) - 1] || 0;
      yearRow.ev = monthlyLocal.ev[(yr * 12) - 1] || 0;
      yearRow.pA_Yield = prior_pA_Outlay_Total !== 0 ? (yearRow.shareA / Math.abs(prior_pA_Outlay_Total)) * 100 : 0;
      yearRow.pB_Yield = prior_pB_Outlay_Total !== 0 ? (yearRow.shareB / Math.abs(prior_pB_Outlay_Total)) * 100 : 0;
      
      yearRow.ebitdaMargin = yearRow.totalRev > 0 ? (yearRow.ebitda / yearRow.totalRev) * 100 : 0;
      yearRow.ebitdarMargin = yearRow.totalRev > 0 ? (yearRow.ebitdar / yearRow.totalRev) * 100 : 0;
      yearRow.netMargin = yearRow.totalRev > 0 ? (yearRow.netIncome / yearRow.totalRev) * 100 : 0;
      yearRow.roe = yearRow.cumNI > 0 && totalEquity > 0 ? (yearRow.netIncome / totalEquity) * 100 : 0;
      yearRow.breakEvenBor = assumptions.totalRev > 0 ? (Math.abs(yearRow.netIncome) / assumptions.totalRev) * 100 : 0;
      
      localMonthly.netFlow = localMonthly.cfo.map((x, i) => x + localMonthly.cfi[i] + localMonthly.cff[i]);
      yearRow.netFlow = yearRow.cfo + yearRow.cfi + yearRow.cff;
      
      currentCash += yearRow.netFlow;
      
      annualDataOut.push({
          ...yearRow,
          endCash: currentCash,
          monthly: localMonthly
      });
  }

  const projNpv = calculateNPV(projectCfsMonthly, assumptions.discountRate, "monthly");
  const projIrr = calculateIRR(projectCfsMonthly, "monthly");
  const projPb = calculatePayback(projectCfsMonthly, "monthly");

  const pA_Npv = calculateNPV(partnerACfsMonthly, assumptions.discountRate, "monthly");
  const pA_Irr = calculateIRR(partnerACfsMonthly, "monthly");
  const pA_Pb = calculatePayback(partnerACfsMonthly, "monthly");

  const pB_Npv = calculateNPV(partnerBCfsMonthly, assumptions.discountRate, "monthly");
  const pB_Irr = calculateIRR(partnerBCfsMonthly, "monthly");
  const pB_Pb = calculatePayback(partnerBCfsMonthly, "monthly");
  
  const operatingData = annualDataOut.filter((d) => d.isOperating);

  return {
    assumptions,
    annualData: annualDataOut,
    operatingData,
    totals: {
      totalRev: annualDataOut.reduce((acc, d) => acc + (d.totalRev || 0), 0),
      ipRev: annualDataOut.reduce((acc, d) => acc + (d.ipRev || 0), 0),
      opRev: annualDataOut.reduce((acc, d) => acc + (d.opRev || 0), 0),
      totalMedSupp: annualDataOut.reduce((acc, d) => acc + (d.totalMedSupp || 0), 0),
      totalDocFee: annualDataOut.reduce((acc, d) => acc + (d.totalDocFee || 0), 0),
      grossProfit: annualDataOut.reduce((acc, d) => acc + (d.grossProfit || 0), 0),
      staffCost: annualDataOut.reduce((acc, d) => acc + (d.staffCost || 0), 0),
      recurringOpex: annualDataOut.reduce((acc, d) => acc + (d.recurringOpex || 0), 0),
      otherOpex: annualDataOut.reduce((acc, d) => acc + (d.otherOpex || 0), 0),
      adminOpex: annualDataOut.reduce((acc, d) => acc + (d.adminOpex || 0), 0),
      utilOpex: annualDataOut.reduce((acc, d) => acc + (d.utilOpex || 0), 0),
      mktgOpex: annualDataOut.reduce((acc, d) => acc + (d.mktgOpex || 0), 0),
      operatorOpex: annualDataOut.reduce((acc, d) => acc + (d.operatorOpex || 0), 0),
      insOpex: annualDataOut.reduce((acc, d) => acc + (d.insOpex || 0), 0),
      ebitdar: annualDataOut.reduce((acc, d) => acc + (d.ebitdar || 0), 0),
      rent: annualDataOut.reduce((acc, d) => acc + (d.rent || 0), 0),
      ebitda: annualDataOut.reduce((acc, d) => acc + (d.ebitda || 0), 0),
      tax: annualDataOut.reduce((acc, d) => acc + (d.tax || 0), 0),
      netIncome: annualDataOut.reduce((acc, d) => acc + (d.netIncome || 0), 0),
      distributableProfit: annualDataOut.reduce((acc, d) => acc + (d.distributableProfit || 0), 0),
      retainedThisYear: annualDataOut.reduce((acc, d) => acc + (d.retainedThisYear || 0), 0),
      ev: annualDataOut.reduce((acc, d) => acc + (d.ev || 0), 0),
      opCoExit: annualDataOut.reduce((acc, d) => acc + (d.opCoExit || 0), 0),
      pA_Exit: annualDataOut.reduce((acc, d) => acc + (d.pA_Exit || 0), 0),
      pB_Exit: annualDataOut.reduce((acc, d) => acc + (d.pB_Exit || 0), 0),
      pA_Outlay: annualDataOut.reduce((acc, d) => acc + (d.pA_Outlay || 0), 0),
      pB_Outlay: annualDataOut.reduce((acc, d) => acc + (d.pB_Outlay || 0), 0),
      fcf: annualDataOut.reduce((acc, d) => acc + (d.fcf || 0), 0),
      shareA: annualDataOut.reduce((acc, d) => acc + (d.shareA || 0), 0),
      shareB: annualDataOut.reduce((acc, d) => acc + (d.shareB || 0), 0),
      cfo: annualDataOut.reduce((acc, d) => acc + (d.cfo || 0), 0),
      cfo_in: annualDataOut.reduce((acc, d) => acc + (d.cfo_in || 0), 0),
      cfo_out: annualDataOut.reduce((acc, d) => acc + (d.cfo_out || 0), 0),
      cfi: annualDataOut.reduce((acc, d) => acc + (d.cfi || 0), 0),
      cfi_in: annualDataOut.reduce((acc, d) => acc + (d.cfi_in || 0), 0),
      cfi_out: annualDataOut.reduce((acc, d) => acc + (d.cfi_out || 0), 0),
      cff: annualDataOut.reduce((acc, d) => acc + (d.cff || 0), 0),
      cff_in: annualDataOut.reduce((acc, d) => acc + (d.cff_in || 0), 0),
      cff_out: annualDataOut.reduce((acc, d) => acc + (d.cff_out || 0), 0),
      netFlow: annualDataOut.reduce((acc, d) => acc + (d.netFlow || 0), 0),
    },
    metrics: {
      totalEquity,
      ev: annualDataOut[annualDataOut.length - 1]?.ev || 0,
      partnerAEquity: assumptions.partnerAEquity,
      partnerBEquity: assumptions.partnerBEquity,
      npv: projNpv, irr: projIrr, payback: projPb,
      pA_Npv, pA_Irr, pA_Pb,
      pB_Npv, pB_Irr, pB_Pb,
    },
  };
};


const runPropCoEngine = (assumptions, opCoModelData, config, groups = []) => {
  const requestedYears = config?.projYears || 10;
  const projYears = Math.min(requestedYears, 30);

  // Link Timeline Capex
  const allTasks = (groups || []).flatMap((g) => g.tasks || []);
  const parsedTimings = parseTimelineTimings(groups, projYears, assumptions.devDurationMonths);
  const hasTimeline = !!parsedTimings;
  
  const totalDevMonths = parsedTimings ? parsedTimings.totalDevMonths : (assumptions.devDurationMonths || 24);
  const constrTiming = parsedTimings ? parsedTimings.constrTiming : null;
  const infraTiming = parsedTimings ? parsedTimings.infraTiming : null;
  const ffeTiming = parsedTimings ? parsedTimings.ffeTiming : null;
  const sharingTiming = parsedTimings ? parsedTimings.sharingTiming : null;
  const consultantTiming = parsedTimings ? parsedTimings.consultantTiming : null;
  const licenseTiming = parsedTimings ? parsedTimings.licenseTiming : null;
  const landTiming = parsedTimings ? parsedTimings.landTiming : null;
  
  // Custom for PropCo not in global helper
  const eqTimingRaw = (groups || []).flatMap((g) => g.tasks || []).find((t) => t.id === "c8");
  let eqTiming = null;
  if (eqTimingRaw) {
    eqTiming = new Array(projYears * 12).fill(0);
    const s = Math.max(0, (parseInt(eqTimingRaw.start) || 1) - 1);
    const d = Math.max(1, parseInt(eqTimingRaw.duration) || 1);
    for (let m = s; m < s + d && m < eqTiming.length; m++) {
      eqTiming[m] = 1 / d;
    }
  }

  let exitYear = null;
  if (config?.exitYear !== undefined && config.exitYear !== null) {
    exitYear = Math.min(config.exitYear, 30);
  } else if (assumptions.includeTerminalValue) {
    exitYear = 10;
  }
  let annualData = [],
    equityCfsMonthly = [],
    equityCfsExLandMonthly = [],
    unleveredCfsMonthly = [],
    operatingCfsMonthly = [],
    devGaMonthly = [],
    devCarMonthly = [],
    hardSpendMonthly = [],
    softSpendMonthly = [],
    totalSpendMonthly = [];

  const landCost =
    (assumptions.includeLand ?? true)
      ? (assumptions.landArea * assumptions.landPrice) / 1000
      : 0;

  const glampingMix = assumptions.glampingMix || [];
  const acomUnits = glampingMix.filter(item => item.isAccommodation);
  const acomQty = acomUnits.reduce((sum, item) => sum + (item.qty || 0), 0);
  const totalMixCost = glampingMix.reduce((sum, item) => sum + (item.qty || 0) * (item.villaCost || 0), 0);
  
  const rawBuildCost = assumptions.type === "glamping" && glampingMix.length > 0
    ? totalMixCost
    : (assumptions.buildArea * assumptions.buildCost) / 1000;

  const medEqCost = 0;

  const ffeCost = assumptions.type === "glamping" && glampingMix.length > 0
    ? glampingMix.reduce((sum, item) => sum + (item.qty || 0) * (item.ffeCost || item.interiorCost || item.interior || 0), 0)
    : (assumptions.includeFFE ? (assumptions.capexFFEQty * assumptions.capexFFEPrice) / 1000 : 0);

  const rawInfraCost = (assumptions.capexInfraQty * assumptions.capexInfraPrice) / 1000;
  const infraCost = assumptions.type === "glamping" && glampingMix.length > 0
    ? (glampingMix.reduce((sum, item) => sum + (item.qty || 0) * (item.infraCost || 0), 0) || rawInfraCost)
    : rawInfraCost;

  const civilMepMixCost = glampingMix.reduce((sum, item) => sum + (item.qty || 0) * (item.civilMepCost || 0), 0);
  const civilMepCost = assumptions.type === "glamping"
    ? (civilMepMixCost > 0 ? civilMepMixCost : (acomQty > 0 ? (acomQty * (assumptions.civilMepCostPerUnit || 150)) / 1000 : rawBuildCost * 0.20))
    : 0;

  const sharingDevCost =
    ((assumptions.sharingArea || assumptions.capexSharingDevQty || 0) * (assumptions.capexSharingDevPrice || 0)) / 1000;

  // Unify Glamping Tent and Glamping Civil & MEP as "buildCost" for downstream VAT, contingency, and depreciation calculations.
  const buildCost = rawBuildCost + civilMepCost;

  const totalHardCosts =
    buildCost + infraCost + ffeCost + sharingDevCost;

  const consultantBase = rawBuildCost + civilMepCost + ffeCost + infraCost + sharingDevCost;
  const licenseBase = consultantBase;

  const upfrontConsultantCost =
    consultantBase * ((assumptions.capexConsultantPct || 0) / 100);
  const upfrontLicenseCost =
    licenseBase * ((assumptions.capexLicensePct || 0) / 100);
  const deferredConsultantCost = 0;
  const deferredLicenseCost = 0;

  const consultantCost = upfrontConsultantCost + deferredConsultantCost;
  const licenseCost = upfrontLicenseCost + deferredLicenseCost;

  const upfrontVatBase =
    upfrontConsultantCost +
    buildCost +
    ffeCost +
    infraCost +
    sharingDevCost;
  const upfrontVatCost = upfrontVatBase * ((assumptions.capexVat || 0) / 100);
  const deferredVatBase = deferredConsultantCost;
  const deferredVatCost = deferredVatBase * ((assumptions.capexVat || 0) / 100);

  const vatCost = upfrontVatCost + deferredVatCost;

  const carCost = buildCost * ((assumptions.devCarPct || 0) / 100);
  // totalDevMonths is pre-calculated based on the timeline above
  const devGaTotalCost = (assumptions.devGaMonthly || 0) * totalDevMonths;

  const upfrontContingencyBase =
    upfrontLicenseCost +
    upfrontConsultantCost +
    buildCost +
    ffeCost +
    infraCost +
    sharingDevCost +
    upfrontVatCost;
  const upfrontContingencyCost =
    upfrontContingencyBase * ((assumptions.capexContingencyPct || 0) / 100);
  const deferredContingencyBase =
    deferredLicenseCost +
    deferredConsultantCost +
    deferredVatCost;
  const deferredContingencyCost =
    deferredContingencyBase * ((assumptions.capexContingencyPct || 0) / 100);

  const contingencyCost = upfrontContingencyCost + deferredContingencyCost;

  const deferredSoftCosts =
    deferredConsultantCost +
    deferredLicenseCost +
    deferredVatCost +
    deferredContingencyCost;

  const totalCapex = // Pure PSAK 16 Capitalized Assets (Removing Dev G&A and CAR to comply with PSAK 19 immediate expensing)
    landCost +
    buildCost +
    infraCost +
    ffeCost +
    consultantCost +
    licenseCost +
    sharingDevCost +
    vatCost +
    contingencyCost;

  const totalProjectCost = totalCapex + carCost + devGaTotalCost; // Total investment required

  const upfrontTotalCapex = totalCapex;
  const upfrontTotalProjectCost = totalProjectCost;

  const totalSoftCosts = totalCapex - landCost - totalHardCosts;
  const upfrontSoftCosts = totalSoftCosts - deferredSoftCosts;
  const effectiveLtv = assumptions.includeFinancing ? assumptions.ltv : 0;

  const totalCapexExLand = upfrontTotalCapex - landCost;
  const totalProjectCostExLand = upfrontTotalProjectCost - landCost;
  const totalDebt = Math.max(0, totalProjectCostExLand) * (effectiveLtv / 100);
  const totalEquity = upfrontTotalProjectCost - totalDebt;

  const ioYears = assumptions.ioGracePeriodYears || 0;
  const ioGraceMonths = ioYears * 12;
  const loanTenorMonths = (assumptions.loanTenor || 15) * 12;
  const amortizingTenorMonths = Math.max(1, loanTenorMonths - ioGraceMonths);
  const rateMonthly = assumptions.interestRate / 100 / 12;

  const postIoPmtMonthly = Math.abs(
    calculatePMT(rateMonthly, amortizingTenorMonths, totalDebt),
  );

  const totalDebtExLand = totalDebt;
  const totalEquityExLand = Math.max(0, totalCapexExLand) - totalDebtExLand;
  const postIoPmtExLandMonthly = Math.abs(
    calculatePMT(rateMonthly, amortizingTenorMonths, totalDebtExLand),
  );

  const vatRate = (assumptions.capexVat || 0) / 100;
  const contingencyRate = (assumptions.capexContingencyPct || 0) / 100;

  // Proportional VAT allocation (Licenses excluded)
  const buildVat = buildCost * vatRate;
  const infraVat = infraCost * vatRate;
  const ffeVat = ffeCost * vatRate;
  const sharingVat = sharingDevCost * vatRate;
  const consultantVat = upfrontConsultantCost * vatRate;

  // Proportional Contingency allocation
  const buildContingency = (buildCost + buildVat) * contingencyRate;
  const medEqContingencyUpfront = 0;

  const infraContingency = (infraCost + infraVat) * contingencyRate;
  const ffeContingency = (ffeCost + ffeVat) * contingencyRate;
  const sharingContingency = (sharingDevCost + sharingVat) * contingencyRate;
  const consultantContingency =
    (upfrontConsultantCost + consultantVat) * contingencyRate;
  const licenseContingency = upfrontLicenseCost * contingencyRate;

  const buildBasis = buildCost;
  let medEqBasis = 0;
  const infraBasis = infraCost;
  const ffeBasis = ffeCost;
  const sharingBasis = sharingDevCost;

  let consultantBasis = upfrontConsultantCost;
  let licenseBasis = upfrontLicenseCost;
  let vatBasis = upfrontVatCost;
  let contingencyBasis = upfrontContingencyCost;

  const devYears = Math.max(1, Math.ceil(totalDevMonths / 12));

  let outstandingDebt = 0,
    outstandingDebtExLand = 0,
    equityCum = 0,
    equityCumExLand = 0;

  let debtDrawsMonthly = [];
  let idcMonthly = [];
  let idcExLandMonthly = [];
  let landSpendMonthly = [];
  let buildSpendMonthlyArr = [];
  let eqSpendMonthlyArr = [];
  let infraSpendMonthlyArr = [];
  let ffeSpendMonthlyArr = [];
  let sharingSpendMonthlyArr = [];
  let consultantSpendMonthlyArr = [];
  let licenseSpendMonthlyArr = [];
  let vatSpendMonthlyArr = [];
  let contingencySpendMonthlyArr = [];

  const genericProjectCost = totalProjectCost - consultantCost - licenseCost;
  const genericCapex = genericProjectCost;
  const genericEquity = genericProjectCost * (1 - effectiveLtv / 100);
  const genericEquityExLand =
    (genericProjectCost - landCost) * (1 - effectiveLtv / 100);

  let cumNonLandCapex = 0;
  let cumDebtDrawn = 0;

  // Run development phase month-by-month
  for (let md = 1; md <= totalDevMonths; md++) {
    const devYearOfThisMonth = Math.ceil(md / 12);
    const m_ga = assumptions.devGaMonthly || 0;

    let m_hard = 0,
      m_soft = 0,
      capDrawBase_month = 0,
      eqDrawBase_month = 0,
      eqDrawExLandBase_month = 0;
    let fallback_m_car = 0;
    let m_ga_val = 0;
    let m_car_val = 0;

    let m_build = 0,
      m_eq = 0,
      m_infra = 0,
      m_ffe = 0,
      m_sharing = 0;
    let m_consultant = 0,
      m_license = 0,
      m_vat = 0,
      m_contingency = 0;

    if (hasTimeline) {
      // Hard Costs Month
      const t_land = landTiming
        ? landCost * (landTiming[md - 1] || 0)
        : md === 1
          ? landCost
          : 0;
      const t_build = constrTiming
        ? buildCost * (constrTiming[md - 1] || 0)
        : buildCost / totalDevMonths;
      const t_eq = 0;
      const t_infra = infraTiming
        ? infraCost * (infraTiming[md - 1] || 0)
        : infraCost / totalDevMonths;
      const t_ffe = ffeTiming
        ? ffeCost * (ffeTiming[md - 1] || 0)
        : ffeCost / totalDevMonths;
      const t_sharing = sharingTiming
        ? sharingDevCost * (sharingTiming[md - 1] || 0)
        : sharingDevCost / totalDevMonths;

      // Soft Costs Month
      const t_consultant = consultantTiming
        ? upfrontConsultantCost * (consultantTiming[md - 1] || 0)
        : md >= 2 && md <= 7
          ? upfrontConsultantCost / 6
          : 0;
      const t_license = licenseTiming
        ? upfrontLicenseCost * (licenseTiming[md - 1] || 0)
        : md === 1
          ? upfrontLicenseCost
          : 0;

      // Pro-rata VAT, Contingency, CAR based on core spend this month
      const core_spend =
        t_build + t_eq + t_infra + t_ffe + t_sharing + t_consultant + t_license;
      const total_core_cost =
        buildCost +
        infraCost +
        ffeCost +
        sharingDevCost +
        upfrontConsultantCost +
        upfrontLicenseCost;
      const pct_of_core =
        total_core_cost > 0 ? core_spend / total_core_cost : 1 / totalDevMonths;

      const t_vat = upfrontVatCost * pct_of_core;
      const t_contingency = upfrontContingencyCost * pct_of_core;
      const t_car = constrTiming
        ? carCost * (constrTiming[md - 1] || 0)
        : carCost / totalDevMonths;

      fallback_m_car = t_car;

      m_build = t_build;
      m_eq = t_eq;
      m_infra = t_infra;
      m_ffe = t_ffe;
      m_sharing = t_sharing;
      m_consultant = t_consultant;
      m_license = t_license;
      m_vat = t_vat;
      m_contingency = t_contingency;

       m_hard = t_build + t_eq + t_infra + t_ffe + t_sharing;
      m_soft = t_consultant + t_license + t_vat + t_contingency;

      m_ga_val = assumptions.devGaMonthly || 0;
      m_car_val = fallback_m_car;

      capDrawBase_month =
        (landTiming
          ? landCost * (landTiming[md - 1] || 0)
          : md === 1
            ? landCost
            : 0) +
        m_hard +
        m_soft +
        m_ga_val +
        m_car_val; // INCLUDING LAND
      eqDrawBase_month = capDrawBase_month * (1 - effectiveLtv / 100);
      eqDrawExLandBase_month = (m_hard + m_soft + m_ga_val + m_car_val) * (1 - effectiveLtv / 100);
    } else {
      let genericCapDraw_month, genericEqDraw_month, genericEqDrawExLand_month;
      if (devYears > 1) {
        const y1Pct = (assumptions.equityDrawYear1Pct ?? 50) / 100;
        if (devYearOfThisMonth === 1) {
          genericCapDraw_month = (genericCapex * y1Pct) / 12;
          genericEqDraw_month = (genericEquity * y1Pct) / 12;
          genericEqDrawExLand_month = (genericEquityExLand * y1Pct) / 12;
        } else {
          const remainingMonths = totalDevMonths - 12;
          genericCapDraw_month = (genericCapex * (1 - y1Pct)) / remainingMonths;
          genericEqDraw_month = (genericEquity * (1 - y1Pct)) / remainingMonths;
          genericEqDrawExLand_month =
            (genericEquityExLand * (1 - y1Pct)) / remainingMonths;
        }
      } else {
        genericCapDraw_month = genericCapex / totalDevMonths;
        genericEqDraw_month = genericEquity / totalDevMonths;
        genericEqDrawExLand_month = genericEquityExLand / totalDevMonths;
      }

      let m_consultantCost = 0;
      if (md >= 2 && md <= 7) m_consultantCost = upfrontConsultantCost / 6;

      let m_licenseCost = 0;
      if (md === 1) m_licenseCost = upfrontLicenseCost;

      capDrawBase_month =
        genericCapDraw_month + m_consultantCost + m_licenseCost;
      eqDrawBase_month =
        genericEqDraw_month +
        (m_consultantCost + m_licenseCost) * (1 - effectiveLtv / 100);
      eqDrawExLandBase_month =
        genericEqDrawExLand_month +
        (m_consultantCost + m_licenseCost) * (1 - effectiveLtv / 100);

      m_hard =
        upfrontTotalProjectCost > 0
          ? (capDrawBase_month * totalHardCosts) /
            upfrontTotalProjectCost
          : 0;
      const m_ga_scaled = upfrontTotalProjectCost > 0 ? (capDrawBase_month * devGaTotalCost) / upfrontTotalProjectCost : 0;
      fallback_m_car = upfrontTotalProjectCost > 0 ? (capDrawBase_month * carCost) / upfrontTotalProjectCost : 0;
      m_ga_val = m_ga_scaled;
      m_car_val = fallback_m_car;
      m_soft =
        upfrontTotalProjectCost > 0
          ? (capDrawBase_month * upfrontSoftCosts) / upfrontTotalProjectCost
          : 0;

      m_build =
        upfrontTotalProjectCost > 0
          ? (capDrawBase_month * buildCost) / upfrontTotalProjectCost
          : 0;
      m_eq = 0;
      m_infra =
        upfrontTotalProjectCost > 0
          ? (capDrawBase_month * infraCost) / upfrontTotalProjectCost
          : 0;
      m_ffe =
        upfrontTotalProjectCost > 0
          ? (capDrawBase_month * ffeCost) / upfrontTotalProjectCost
          : 0;
      m_sharing =
        upfrontTotalProjectCost > 0
          ? (capDrawBase_month * sharingDevCost) / upfrontTotalProjectCost
          : 0;

      m_consultant =
        upfrontTotalProjectCost > 0
          ? (capDrawBase_month * upfrontConsultantCost) / upfrontTotalProjectCost
          : 0;
      m_license =
        upfrontTotalProjectCost > 0
          ? (capDrawBase_month * upfrontLicenseCost) / upfrontTotalProjectCost
          : 0;
      m_vat =
        upfrontTotalProjectCost > 0
          ? (capDrawBase_month * upfrontVatCost) / upfrontTotalProjectCost
          : 0;
      m_contingency =
        upfrontTotalProjectCost > 0
          ? (capDrawBase_month * upfrontContingencyCost) / upfrontTotalProjectCost
          : 0;

      const buildSpendMonthly =
        upfrontTotalCapex > 0
          ? (capDrawBase_month * buildCost) / upfrontTotalCapex
          : 0;
      fallback_m_car = buildSpendMonthly * ((assumptions.devCarPct || 0) / 100);
    }

    let m_land_final = 0;
    if (hasTimeline) {
      m_land_final = landTiming
        ? landCost * (landTiming[md - 1] || 0)
        : md === 1
          ? landCost
          : 0;
    } else {
      m_land_final =
        upfrontTotalCapex > 0
          ? (capDrawBase_month * landCost) / upfrontTotalCapex
          : 0;
    }

    // Track debt drawn based on capEx base month (Land is strictly equity funded)
    let m_debtDraw = 0;
    const m_nonLandCapex = Math.max(0, capDrawBase_month - m_land_final);

    if (assumptions.drawdownScenario === "tranches" && totalCapexExLand > 0) {
      cumNonLandCapex += m_nonLandCapex;
      const progress = cumNonLandCapex / totalCapexExLand;

      const tranches = assumptions.drawdownTranches || [20, 40, 60, 80, 100];
      const p = progress * 100 + 0.0001; // Allow for floating point precision

      let targetTrancheDebtPct = 0;
      for (let tIdx = 0; tIdx < tranches.length; tIdx++) {
        if (p >= tranches[tIdx] || md === totalDevMonths) {
          targetTrancheDebtPct = tranches[tIdx];
        }
      }
      if (md === totalDevMonths) targetTrancheDebtPct = 100;

      const targetDebtDrawn = totalDebt * (targetTrancheDebtPct / 100);

      m_debtDraw = Math.max(0, targetDebtDrawn - cumDebtDrawn);
      cumDebtDrawn += m_debtDraw;
    } else {
      m_debtDraw = m_nonLandCapex * (effectiveLtv / 100);
    }
    const m_debtDrawExLand = m_debtDraw;

    // IDC calculated on PRIOR balance (before this month's draw)
    const m_idc = outstandingDebt * rateMonthly;
    const m_idcExLand = outstandingDebtExLand * rateMonthly;

    outstandingDebt += m_debtDraw;
    outstandingDebtExLand += m_debtDrawExLand;

    const m_eqDraw = -(capDrawBase_month - m_debtDraw + m_idc);
    const m_eqDrawExLand = -(
      Math.max(0, capDrawBase_month - m_land_final) -
      m_debtDrawExLand +
      m_idcExLand
    );
    const m_unleveredCf = -capDrawBase_month;

    const projectSpend_month = m_land_final + m_hard + m_soft + m_ga_val + m_car_val;

    landSpendMonthly.push(m_land_final);
    hardSpendMonthly.push(m_hard);
    softSpendMonthly.push(m_soft);
    totalSpendMonthly.push(projectSpend_month);
    debtDrawsMonthly.push(m_debtDraw);
    idcMonthly.push(m_idc);
    idcExLandMonthly.push(m_idcExLand);

    buildSpendMonthlyArr.push(m_build);
    eqSpendMonthlyArr.push(m_eq);
    infraSpendMonthlyArr.push(m_infra);
    ffeSpendMonthlyArr.push(m_ffe);
    sharingSpendMonthlyArr.push(m_sharing);

    consultantSpendMonthlyArr.push(m_consultant);
    licenseSpendMonthlyArr.push(m_license);
    vatSpendMonthlyArr.push(m_vat);
    contingencySpendMonthlyArr.push(m_contingency);

    equityCfsMonthly.push(m_eqDraw);
    equityCfsExLandMonthly.push(m_eqDrawExLand);
    unleveredCfsMonthly.push(m_unleveredCf);
    operatingCfsMonthly.push(m_eqDraw);
    devGaMonthly.push(m_ga_val);
    devCarMonthly.push(m_car_val);
    equityCum += m_eqDraw;
    equityCumExLand += m_eqDrawExLand;
  }

  const peakEquityRequired = Math.abs(equityCum);
  const peakTotalInvestment = totalSpendMonthly.reduce((a, b) => a + b, 0);

  // Push annual development summaries
  for (let i = 1; i <= devYears; i++) {
    const monthsThisYear = Math.min(
      12,
      Math.max(0, totalDevMonths - (i - 1) * 12),
    );
    const ga_year = devGaMonthly
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const car_year = devCarMonthly
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);

    const eqDraw_year = equityCfsMonthly
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const eqDrawExLand_year = equityCfsExLandMonthly
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const unleveredCf_year = unleveredCfsMonthly
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);

    const land_year = landSpendMonthly
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const hard_year = hardSpendMonthly
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const soft_year = softSpendMonthly
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const totalSpend_year = totalSpendMonthly
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const debtDraw_year = debtDrawsMonthly
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);

    // Detailed aggregations
    const build_year = buildSpendMonthlyArr
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const eq_year = eqSpendMonthlyArr
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const infra_year = infraSpendMonthlyArr
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const ffe_year = ffeSpendMonthlyArr
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const sharing_year = sharingSpendMonthlyArr
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);

    const consultant_year = consultantSpendMonthlyArr
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const license_year = licenseSpendMonthlyArr
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const vat_year = vatSpendMonthlyArr
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const contingency_year = contingencySpendMonthlyArr
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);

    let monthly = {
      debtBalance: [],
      debtBalanceExLand: [],
      fcfe: [],
      fcfeExLand: [],
      debtDraw: [],
      landSpend: [],
      buildSpend: [],
      eqSpend: [],
      infraSpend: [],
      ffeSpend: [],
      sharingSpend: [],
      consultantSpend: [],
      licenseSpend: [],
      vatSpend: [],
      contingencySpend: [],
      cumFcfe: [],
      cumFcfeExLand: [],
      devGa: [],
      devCar: [],
      gop: [],
      ebitda: [],
      ebit: [],
      ebt: [],
      netIncome: [],
      corpTax: [],
      ebtExLand: [],
      corpTaxExLand: [],
      interest: [],
      interestExLand: [],
      dep: [],
      hardSpend: [],
      softSpend: [],
      totalSpend: [],
      unleveredCf: [],
    };
    for (let m = 0; m < 12; m++) {
      const mIdx = (i - 1) * 12 + m;
      const m_fcfe = equityCfsMonthly[mIdx] || 0;
      const m_fcfeExLand = equityCfsExLandMonthly[mIdx] || 0;
      const m_ga = devGaMonthly[mIdx] || 0;
      const m_car = devCarMonthly[mIdx] || 0;
      const m_land = landSpendMonthly[mIdx] || 0;
      const m_hard = hardSpendMonthly[mIdx] || 0;
      const m_soft = softSpendMonthly[mIdx] || 0;
      const m_total = totalSpendMonthly[mIdx] || 0;
      const m_debtDraw = debtDrawsMonthly[mIdx] || 0;

      const m_build = buildSpendMonthlyArr[mIdx] || 0;
      const m_eq = eqSpendMonthlyArr[mIdx] || 0;
      const m_infra = infraSpendMonthlyArr[mIdx] || 0;
      const m_ffe = ffeSpendMonthlyArr[mIdx] || 0;
      const m_sharing = sharingSpendMonthlyArr[mIdx] || 0;

      const m_consultant = consultantSpendMonthlyArr[mIdx] || 0;
      const m_license = licenseSpendMonthlyArr[mIdx] || 0;
      const m_vat = vatSpendMonthlyArr[mIdx] || 0;
      const m_contingency = contingencySpendMonthlyArr[mIdx] || 0;

      const m_unleveredCf = unleveredCfsMonthly[mIdx] || 0;
      const m_idc = idcMonthly[mIdx] || 0;
      const m_idcExLand = idcExLandMonthly[mIdx] || 0;
      const m_ebitda = -(m_ga + m_car);
      const m_ebt = m_ebitda - m_idc;
      const m_ebtExLand = m_ebitda - m_idcExLand;

      monthly.debtBalance.push(outstandingDebt);
      monthly.debtBalanceExLand.push(outstandingDebtExLand);
      monthly.fcfe.push(m_fcfe);
      monthly.fcfeExLand.push(m_fcfeExLand);
      monthly.devGa.push(m_ga);
      monthly.devCar.push(m_car);
      monthly.landSpend.push(m_land);
      monthly.buildSpend.push(m_build);
      monthly.eqSpend.push(m_eq);
      monthly.infraSpend.push(m_infra);
      monthly.ffeSpend.push(m_ffe);
      monthly.sharingSpend.push(m_sharing);
      monthly.consultantSpend.push(m_consultant);
      monthly.licenseSpend.push(m_license);
      monthly.vatSpend.push(m_vat);
      monthly.contingencySpend.push(m_contingency);
      monthly.hardSpend.push(m_hard);
      monthly.softSpend.push(m_soft);
      monthly.totalSpend.push(m_total);
      monthly.debtDraw.push(m_debtDraw);
      monthly.unleveredCf.push(m_unleveredCf);
      monthly.ebitda.push(m_ebitda);
      monthly.ebt.push(m_ebt);
      monthly.ebtExLand.push(m_ebtExLand);
      monthly.netIncome.push(m_ebt);
      monthly.corpTax.push(0);
      monthly.corpTaxExLand.push(0);
      monthly.interest.push(m_idc);
      monthly.interestExLand.push(m_idcExLand);
      monthly.dep.push(0);
      monthly.cumFcfe.push(
        equityCfsMonthly.slice(0, mIdx + 1).reduce((a, b) => a + b, 0),
      );
      monthly.cumFcfeExLand.push(
        equityCfsExLandMonthly.slice(0, mIdx + 1).reduce((a, b) => a + b, 0),
      );
    }

    const interest_year = monthly.interest.reduce((a, b) => a + b, 0);
    const interestExLand_year = monthly.interestExLand.reduce(
      (a, b) => a + b,
      0,
    );

    annualData.push({
      year: `Year ${i}`,
      isOperating: false,
      revenue: 0,
      preOpeningDev: ga_year + car_year,
      gop: -(ga_year + car_year),
      ebitda: -(ga_year + car_year),
      ebit: -(ga_year + car_year),
      ebt: -(ga_year + car_year) - interest_year,
      ebtExLand: -(ga_year + car_year) - interestExLand_year,
      netIncome: -(ga_year + car_year) - interest_year,
      corpTax: 0,
      corpTaxExLand: 0,
      interest: interest_year,
      interestExLand: interestExLand_year,
      dep: 0,
      debtBalance:
        monthly.debtBalance[monthly.debtBalance.length - 1] || outstandingDebt,
      debtBalanceExLand:
        monthly.debtBalanceExLand[monthly.debtBalanceExLand.length - 1] ||
        outstandingDebtExLand,
      devGa: ga_year,
      devCar: car_year,
      landSpend: land_year,
      buildSpend: build_year,
      eqSpend: eq_year,
      infraSpend: infra_year,
      ffeSpend: ffe_year,
      sharingSpend: sharing_year,
      consultantSpend: consultant_year,
      licenseSpend: license_year,
      vatSpend: vat_year,
      contingencySpend: contingency_year,
      hardSpend: hard_year,
      softSpend: soft_year,
      totalSpend: totalSpend_year,
      debtDraw: debtDraw_year,
      unleveredCf: unleveredCf_year,
      fcfe: eqDraw_year,
      cumFcfe: equityCfsMonthly.slice(0, i * 12).reduce((a, b) => a + b, 0),
      fcfeExLand: eqDrawExLand_year,
      cumFcfeExLand: equityCfsExLandMonthly
        .slice(0, i * 12)
        .reduce((a, b) => a + b, 0),
      monthly,
    });
  }

  let avgDscr = 0,
    avgYield = 0;
  const opCoRents =
    opCoModelData?.annualData
      ?.filter((d) => d.isOperating)
      ?.map((d) => d.rent) || [];
  // Track book values of each component (base, vat, contingency) separately
  let bvB_base = buildCost,
    bvB_vat = buildVat,
    bvB_contingency = buildContingency;

  let bvM_base = 0,
    bvM_vat = 0,
    bvM_contingency = 0;

  let bvI_base = infraCost,
    bvI_vat = infraVat,
    bvI_contingency = infraContingency;

  let bvF_base = ffeCost,
    bvF_vat = ffeVat,
    bvF_contingency = ffeContingency;

  let bvSharing_base = sharingDevCost,
    bvSharing_vat = sharingVat,
    bvSharing_contingency = sharingContingency;

  let bvConsultant_base = upfrontConsultantCost,
    bvConsultant_vat = consultantVat,
    bvConsultant_contingency = consultantContingency;

  let bvLicense_base = upfrontLicenseCost,
    bvLicense_vat = 0,
    bvLicense_contingency = licenseContingency;

  // Active calculation bases for depreciations (allows deferred cost additions)
  let buildBasis_base = buildCost;
  let buildBasis_vat = buildVat;
  let buildBasis_contingency = buildContingency;

  let medEqBasis_base = 0;
  let medEqBasis_vat = 0;
  let medEqBasis_contingency = 0;

  let infraBasis_base = infraCost;
  let infraBasis_vat = infraVat;
  let infraBasis_contingency = infraContingency;

  let ffeBasis_base = ffeCost;
  let ffeBasis_vat = ffeVat;
  let ffeBasis_contingency = ffeContingency;

  let sharingBasis_base = sharingDevCost;
  let sharingBasis_vat = sharingVat;
  let sharingBasis_contingency = sharingContingency;

  let consultantBasis_base = upfrontConsultantCost;
  let consultantBasis_vat = consultantVat;
  let consultantBasis_contingency = consultantContingency;

  let licenseBasis_base = upfrontLicenseCost;
  let licenseBasis_vat = 0;
  let licenseBasis_contingency = licenseContingency;

  // Run operating phase month-by-month and group annually
  for (let i = 1; i <= projYears; i++) {
    let annualRevenue = assumptions.linkToOpCo
      ? opCoRents[i - 1] || 0
      : assumptions.manualBaseRent *
        Math.pow(1 + assumptions.manualRentEscalation / 100, i - 1);
    const maint_year = buildCost * (assumptions.maintRate / 100),
      taxOp_year = totalCapex * (assumptions.propTaxRate / 100);
    const overhead_year =
      assumptions.opOverheadMonthly *
      12 *
      Math.pow(1 + assumptions.opOverheadInc / 100, i - 1);

    let monthly = {
      revenue: [],
      maintOpex: [],
      taxOpex: [],
      overheadOpex: [],
      ffeReserve: [],
      medEqLeaseOpex: [],
      gop: [],
      ebitda: [],
      ebit: [],
      interest: [],
      principal: [],
      interestExLand: [],
      principalExLand: [],
      dep: [],
      ebt: [],
      corpTax: [],
      netIncome: [],
      deferredCapex: [],
      fcfe: [],
      cumFcfe: [],
      fcfeExLand: [],
      cumFcfeExLand: [],
      unleveredCf: [],
      shortfallEquity: [],
      opFcfe: [],
      exit: [],
      exitExLand: [],
      debtBalance: [],
      debtBalanceExLand: [],
      avgDscr: [],
      avgYield: [],
      yocExLand: [],
      landSpend: [],
      buildSpend: [],
      eqSpend: [],
      infraSpend: [],
      ffeSpend: [],
      sharingSpend: [],
      consultantSpend: [],
      licenseSpend: [],
      vatSpend: [],
      contingencySpend: [],
      hardSpend: [],
      softSpend: [],
      totalSpend: [],
      debtDraw: [],
    };

    let year_revenue = 0,
      year_maint = 0,
      year_taxOp = 0,
      year_overhead = 0,
      year_reserve = 0,
      year_medEqLease = 0,
      year_gop = 0,
      year_ebitda = 0,
      year_ebit = 0,
      year_interest = 0,
      year_principal = 0,
      year_interestExLand = 0,
      year_principalExLand = 0,
      year_dep = 0,
      year_depBuild = 0,
      year_depMedEq = 0,
      year_depInfra = 0,
      year_depFfe = 0,
      year_depSharing = 0,
      year_depConsultant = 0,
      year_depLicense = 0,
      year_depVat = 0,
      year_depContingency = 0,
      year_depSoft = 0,
      year_ebt = 0,
      year_tax = 0,
      year_netIncome = 0,
      year_deferredCapex = 0,
      year_fcfe = 0,
      year_fcfeExLand = 0,
      year_unleveredCf = 0,
      year_opFcfe = 0,
      year_opFcfeExLand = 0,
      year_shortfallEquity = 0,
      year_exit = 0,
      year_exitExLand = 0,
      year_loanSettledAtExit = 0,
      year_grossExitValue = 0;

    let ytdEbt = 0;
    for (let m = 1; m <= 12; m++) {
      // Distributed monthly:
      let m_revenue = annualRevenue / 12;
      const m_maint = maint_year / 12,
        m_taxOp = taxOp_year / 12;
      const m_overhead =
        assumptions.opOverheadMonthly *
        Math.pow(1 + assumptions.opOverheadInc / 100, i - 1);
      const m_reserve = m_revenue * (assumptions.ffeReservePct / 100);

      let m_deferredCapex = 0;

      const m_gop =
        m_revenue - m_maint - m_taxOp - m_overhead;
      const m_ebitda = m_gop - m_reserve;

      const m_op = (i - 1) * 12 + m;
      let m_interest = 0,
        m_principal = 0,
        m_interestExLand = 0,
        m_principalExLand = 0;

      if (outstandingDebt > 0.01) {
        m_interest = outstandingDebt * rateMonthly;
        m_principal =
          m_op <= ioGraceMonths
            ? 0
            : Math.min(outstandingDebt, postIoPmtMonthly - m_interest);
        outstandingDebt -= m_principal;
      }
      if (outstandingDebtExLand > 0.01) {
        m_interestExLand = outstandingDebtExLand * rateMonthly;
        m_principalExLand =
          m_op <= ioGraceMonths
            ? 0
            : Math.min(
                outstandingDebtExLand,
                postIoPmtExLandMonthly - m_interestExLand,
              );
        outstandingDebtExLand -= m_principalExLand;
      }

      const calcDep = (bv, basis, life, method) => {
        if (method === "DDB") return Math.min(bv * (2 / life), bv);
        return Math.min(basis / life, bv);
      };

      // 1. Construction (Building)
      const m_dB_base =
        calcDep(
          bvB_base,
          buildBasis_base,
          assumptions.depLifeBuilding || 20,
          assumptions.depMethodBuilding,
        ) / 12;
      bvB_base -= m_dB_base;
      const m_dB_vat =
        calcDep(
          bvB_vat,
          buildBasis_vat,
          assumptions.depLifeBuilding || 20,
          assumptions.depMethodBuilding,
        ) / 12;
      bvB_vat -= m_dB_vat;
      const m_dB_contingency =
        calcDep(
          bvB_contingency,
          buildBasis_contingency,
          assumptions.depLifeBuilding || 20,
          assumptions.depMethodBuilding,
        ) / 12;
      bvB_contingency -= m_dB_contingency;
      const m_d1 = m_dB_base;

      // 2. Medical Equipment
      let m_dM_base = 0;
      let m_dM_vat = 0;
      let m_dM_contingency = 0;
      if (
        !(
          assumptions.includeMedEq &&
          assumptions.medEqProcurement === "lease" &&
          i < (assumptions.medEqPurchaseOpYear || 4)
        )
      ) {
        m_dM_base =
          calcDep(
            bvM_base,
            medEqBasis_base,
            assumptions.depLifeMedEq || 10,
            assumptions.depMethodMedEq,
          ) / 12;
        bvM_base -= m_dM_base;
        m_dM_vat =
          calcDep(
            bvM_vat,
            medEqBasis_vat,
            assumptions.depLifeMedEq || 10,
            assumptions.depMethodMedEq,
          ) / 12;
        bvM_vat -= m_dM_vat;
        m_dM_contingency =
          calcDep(
            bvM_contingency,
            medEqBasis_contingency,
            assumptions.depLifeMedEq || 10,
            assumptions.depMethodMedEq,
          ) / 12;
        bvM_contingency -= m_dM_contingency;
      }
      const m_d2 = m_dM_base;

      // 3. Infrastructure
      const m_dI_base =
        calcDep(
          bvI_base,
          infraBasis_base,
          assumptions.depLifeInfra || 20,
          assumptions.depMethodInfra,
        ) / 12;
      bvI_base -= m_dI_base;
      const m_dI_vat =
        calcDep(
          bvI_vat,
          infraBasis_vat,
          assumptions.depLifeInfra || 20,
          assumptions.depMethodInfra,
        ) / 12;
      bvI_vat -= m_dI_vat;
      const m_dI_contingency =
        calcDep(
          bvI_contingency,
          infraBasis_contingency,
          assumptions.depLifeInfra || 20,
          assumptions.depMethodInfra,
        ) / 12;
      bvI_contingency -= m_dI_contingency;
      const m_d3 = m_dI_base;

      // 4. FF&E
      const m_dF_base =
        calcDep(
          bvF_base,
          ffeBasis_base,
          assumptions.depLifeFFE || 20,
          assumptions.depMethodFFE,
        ) / 12;
      bvF_base -= m_dF_base;
      const m_dF_vat =
        calcDep(
          bvF_vat,
          ffeBasis_vat,
          assumptions.depLifeFFE || 20,
          assumptions.depMethodFFE,
        ) / 12;
      bvF_vat -= m_dF_vat;
      const m_dF_contingency =
        calcDep(
          bvF_contingency,
          ffeBasis_contingency,
          assumptions.depLifeFFE || 20,
          assumptions.depMethodFFE,
        ) / 12;
      bvF_contingency -= m_dF_contingency;
      const m_d4 = m_dF_base;

      // 5. Sharing Development
      const m_dSharing_base =
        calcDep(
          bvSharing_base,
          sharingBasis_base,
          assumptions.depLifeInfra || 20,
          assumptions.depMethodInfra,
        ) / 12;
      bvSharing_base -= m_dSharing_base;
      const m_dSharing_vat =
        calcDep(
          bvSharing_vat,
          sharingBasis_vat,
          assumptions.depLifeInfra || 20,
          assumptions.depMethodInfra,
        ) / 12;
      bvSharing_vat -= m_dSharing_vat;
      const m_dSharing_contingency =
        calcDep(
          bvSharing_contingency,
          sharingBasis_contingency,
          assumptions.depLifeInfra || 20,
          assumptions.depMethodInfra,
        ) / 12;
      bvSharing_contingency -= m_dSharing_contingency;
      const m_dSharing = m_dSharing_base;

      // 6. Consultant & Design (Soft Cost)
      const m_dConsultant_base =
        calcDep(
          bvConsultant_base,
          consultantBasis_base,
          assumptions.depLifeSoftCost || 20,
          assumptions.depMethodSoftCost || "SL",
        ) / 12;
      bvConsultant_base -= m_dConsultant_base;
      const m_dConsultant_vat =
        calcDep(
          bvConsultant_vat,
          consultantBasis_vat,
          assumptions.depLifeSoftCost || 20,
          assumptions.depMethodSoftCost || "SL",
        ) / 12;
      bvConsultant_vat -= m_dConsultant_vat;
      const m_dConsultant_contingency =
        calcDep(
          bvConsultant_contingency,
          consultantBasis_contingency,
          assumptions.depLifeSoftCost || 20,
          assumptions.depMethodSoftCost || "SL",
        ) / 12;
      bvConsultant_contingency -= m_dConsultant_contingency;
      const m_dConsultant = m_dConsultant_base;

      // 7. Licenses & Permits (Soft Cost, exempt from VAT)
      const m_dLicense_base =
        calcDep(
          bvLicense_base,
          licenseBasis_base,
          assumptions.depLifeSoftCost || 20,
          assumptions.depMethodSoftCost || "SL",
        ) / 12;
      bvLicense_base -= m_dLicense_base;
      const m_dLicense_vat = 0;
      const m_dLicense_contingency =
        calcDep(
          bvLicense_contingency,
          licenseBasis_contingency,
          assumptions.depLifeSoftCost || 20,
          assumptions.depMethodSoftCost || "SL",
        ) / 12;
      bvLicense_contingency -= m_dLicense_contingency;
      const m_dLicense = m_dLicense_base;

      // Sum all components of VAT & Contingency
      const m_dVat =
        m_dB_vat +
        m_dM_vat +
        m_dI_vat +
        m_dF_vat +
        m_dSharing_vat +
        m_dConsultant_vat +
        m_dLicense_vat;
      const m_dContingency =
        m_dB_contingency +
        m_dM_contingency +
        m_dI_contingency +
        m_dF_contingency +
        m_dSharing_contingency +
        m_dConsultant_contingency +
        m_dLicense_contingency;

      const m_d5 = m_dConsultant + m_dLicense + m_dVat + m_dContingency;
      const m_dep = m_d1 + m_d2 + m_d3 + m_d4 + m_dSharing + m_d5;

      const m_ebt = m_ebitda - m_interest - m_dep;
      
      ytdEbt += m_ebt;
      const m_tax = (m === 12 && ytdEbt > 0) ? ytdEbt * (assumptions.corporateTax / 100) : 0;
      const m_netIncome = m_ebt - m_tax;

      let m_exit = 0,
        m_exitExLand = 0,
        m_exitUnlev = 0,
        m_loanSettledAtExit = 0,
        m_grossExitValue = 0;

      if (exitYear !== null && i === exitYear && m === 12) {
        let tv =
          assumptions.exitMethod === "multiple"
            ? (annualRevenue -
                maint_year -
                taxOp_year -
                overhead_year -
                annualRevenue * (assumptions.ffeReservePct / 100)) *
              assumptions.exitMultiple
            : (annualRevenue -
                maint_year -
                taxOp_year -
                overhead_year -
                annualRevenue * (assumptions.ffeReservePct / 100)) /
              (assumptions.exitCapRate / 100);

        if (tv > 0) {
          const cost = tv * (assumptions.sellingCosts / 100);
          m_grossExitValue = tv - cost;
          m_loanSettledAtExit = outstandingDebt;

          m_exit = tv - cost - outstandingDebt;
          m_exitUnlev = tv - cost;
          m_exitExLand = tv - cost - outstandingDebtExLand - landCost;
          outstandingDebt = 0;
          outstandingDebtExLand = 0;
        }
      }

      const m_unleveredCf =
        m_ebitda -
        m_dep -
        (m_ebitda - m_dep > 0
          ? (m_ebitda - m_dep) * (assumptions.corporateTax / 100)
          : 0) +
        m_dep +
        m_exitUnlev -
        m_deferredCapex;

      const m_opFcfe = m_netIncome + m_dep - m_principal - m_deferredCapex;
      const m_shortfallEquity = m_opFcfe < 0 ? Math.abs(m_opFcfe) : 0;
      const m_fcfe = m_opFcfe + m_exit;

      const m_fcfeExLand =
        m_ebitda -
        m_interestExLand -
        m_dep -
        (m_ebitda - m_interestExLand - m_dep > 0
          ? (m_ebitda - m_interestExLand - m_dep) *
            (assumptions.corporateTax / 100)
          : 0) +
        m_dep -
        m_principalExLand +
        m_exitExLand -
        m_deferredCapex;

      equityCum += m_fcfe;
      equityCumExLand += m_fcfeExLand;

      equityCfsMonthly.push(m_fcfe);
      equityCfsExLandMonthly.push(m_fcfeExLand);
      unleveredCfsMonthly.push(m_unleveredCf);
      operatingCfsMonthly.push(m_opFcfe);

      // Store monthly snapshots
      monthly.revenue.push(m_revenue);
      monthly.maintOpex.push(m_maint);
      monthly.taxOpex.push(m_taxOp);
      monthly.overheadOpex.push(m_overhead);
      monthly.ffeReserve.push(m_reserve);
      monthly.medEqLeaseOpex.push(0);
      monthly.gop.push(m_gop);
      monthly.ebitda.push(m_ebitda);
      const m_ebit = m_ebitda - m_dep;
      monthly.ebit.push(m_ebit);
      monthly.interest.push(m_interest);
      monthly.principal.push(m_principal);
      monthly.interestExLand.push(m_interestExLand);
      monthly.principalExLand.push(m_principalExLand);
      monthly.hardSpend.push(0);
      monthly.softSpend.push(0);
      monthly.totalSpend.push(0);
      monthly.dep.push(m_dep);
      monthly.ebt.push(m_ebt);
      monthly.corpTax.push(m_tax);
      monthly.netIncome.push(m_netIncome);
      monthly.deferredCapex.push(m_deferredCapex);
      monthly.fcfe.push(m_fcfe);
      monthly.cumFcfe.push(equityCum);
      monthly.fcfeExLand.push(m_fcfeExLand);
      monthly.cumFcfeExLand.push(equityCumExLand);
      monthly.unleveredCf.push(m_unleveredCf);
      monthly.shortfallEquity.push(m_shortfallEquity);
      monthly.opFcfe.push(m_opFcfe);
      monthly.exit.push(m_exit);
      monthly.exitExLand.push(m_exitExLand);
      monthly.debtBalance.push(outstandingDebt);
      monthly.debtBalanceExLand.push(outstandingDebtExLand);
      monthly.avgDscr.push(
        m_interest + m_principal > 0
          ? m_ebitda / (m_interest + m_principal)
          : 5,
      );
      monthly.avgYield.push(
        totalCapex > 0 ? ((m_revenue * 12) / totalCapex) * 100 : 0,
      );
      monthly.yocExLand.push(
        totalCapexExLand > 0 ? ((m_ebitda * 12) / totalCapexExLand) * 100 : 0,
      );

      monthly.landSpend.push(0);
      monthly.buildSpend.push(0);
      monthly.eqSpend.push(0);
      monthly.infraSpend.push(0);
      monthly.ffeSpend.push(0);
      monthly.sharingSpend.push(0);
      monthly.consultantSpend.push(0);
      monthly.licenseSpend.push(0);
      monthly.vatSpend.push(0);
      monthly.contingencySpend.push(0);
      monthly.hardSpend.push(0);
      monthly.softSpend.push(0);
      monthly.totalSpend.push(0);
      monthly.debtDraw.push(0);

      year_revenue += m_revenue;
      year_maint += m_maint;
      year_taxOp += m_taxOp;
      year_overhead += m_overhead;
      year_reserve += m_reserve;
      year_medEqLease += 0;
      year_gop += m_gop;
      year_ebitda += m_ebitda;
      year_ebit += m_ebit;
      year_interest += m_interest;
      year_principal += m_principal;
      year_interestExLand += m_interestExLand;
      year_principalExLand += m_principalExLand;
      year_dep += m_dep;
      year_depBuild += m_d1;
      year_depMedEq += m_d2;
      year_depInfra += m_d3;
      year_depFfe += m_d4;
      year_depSharing += m_dSharing;
      year_depConsultant += m_dConsultant;
      year_depLicense += m_dLicense;
      year_depVat += m_dVat;
      year_depContingency += m_dContingency;
      year_depSoft += m_d5;
      year_ebt += m_ebt;
      year_tax += m_tax;
      year_netIncome += m_netIncome;
      year_deferredCapex += m_deferredCapex;
      year_fcfe += m_fcfe;
      year_fcfeExLand += m_fcfeExLand;
      year_unleveredCf += m_unleveredCf;
      year_opFcfe += m_opFcfe;
      year_shortfallEquity += m_shortfallEquity;
      year_opFcfeExLand += m_fcfeExLand - m_exitExLand;
      year_exit += m_exit;
      year_exitExLand += m_exitExLand;
      year_loanSettledAtExit += m_loanSettledAtExit;
      year_grossExitValue += m_grossExitValue;
    }

    const dscr =
      year_principal + year_interest > 0
        ? year_ebitda / (year_principal + year_interest)
        : 0;
    avgDscr += dscr;
    avgYield += totalEquity > 0 ? (year_opFcfe / totalEquity) * 100 : 0;

    annualData.push({
      year: `Year ${i + devYears}`,
      isOperating: true,
      revenue: year_revenue,
      preOpeningDev: 0,
      maintOpex: year_maint,
      taxOpex: year_taxOp,
      overheadOpex: year_overhead,
      ffeReserve: year_reserve,
      medEqLeaseOpex: year_medEqLease,
      gop: year_gop,
      ebitda: year_ebitda,
      ebit: year_ebit,
      interest: year_interest,
      principal: year_principal,
      debtBalance: outstandingDebt,
      dep: year_dep,
      depBuild: year_depBuild,
      depMedEq: year_depMedEq,
      depInfra: year_depInfra,
      depFfe: year_depFfe,
      depSharing: year_depSharing,
      depConsultant: year_depConsultant,
      depLicense: year_depLicense,
      depVat: year_depVat,
      depContingency: year_depContingency,
      depSoft: year_depSoft,
      corpTax: year_tax,
      netIncome: year_netIncome,
      deferredCapex: year_deferredCapex,
      opFcfe: year_opFcfe,
      shortfallEquity: year_shortfallEquity,
      fcfe: year_fcfe,
      cumFcfe: equityCum,
      dscr,
      yield: totalEquity > 0 ? (year_opFcfe / totalEquity) * 100 : 0,
      opFcfeExLand: year_opFcfeExLand,
      fcfeExLand: year_fcfeExLand,
      cumFcfeExLand: equityCumExLand,
      interestExLand: year_interestExLand,
      principalExLand: year_principalExLand,
      debtBalanceExLand: outstandingDebtExLand,
      landSpend: 0,
      buildSpend: 0,
      eqSpend: 0,
      infraSpend: 0,
      ffeSpend: 0,
      sharingSpend: 0,
      consultantSpend: 0,
      licenseSpend: 0,
      vatSpend: 0,
      contingencySpend: 0,
      hardSpend: 0,
      softSpend: 0,
      totalSpend: 0,
      debtDraw: 0,
      exit: year_exit,
      loanSettledAtExit: year_loanSettledAtExit,
      grossExitValue: year_grossExitValue,
      netExitProceeds: year_exit,
      ebt: year_ebt,
      netExitProceedsExLand: year_exitExLand,
      ebtExLand: year_ebitda - year_interestExLand - year_dep,
      corpTaxExLand:
        year_ebitda - year_interestExLand - year_dep > 0
          ? (year_ebitda - year_interestExLand - year_dep) *
            (assumptions.corporateTax / 100)
          : 0,
      monthly,
    });
  }

  // Add CF Statement Standard Items for PropCo
  annualData = annualData.map(d => {
    const cfo = (d.netIncome || 0) + (d.dep || 0);
    const cfo_in = d.revenue || 0;
    const cfo_out = cfo - cfo_in;

    const cfi = -((d.hardSpend||0) + (d.softSpend||0) + (d.landSpend||0)) + (d.exit || 0);
    const cfi_in = d.exit || 0;
    const cfi_out = -((d.hardSpend||0) + (d.softSpend||0) + (d.landSpend||0));

    const cff = (d.debtDraw||0) - (d.principal||0) + (d.shortfallEquity||0) - (d.fcfe||0);
    const cff_in = (d.debtDraw||0) + (d.shortfallEquity||0);
    const cff_out = -(d.principal||0) - (d.fcfe||0);

    const netFlow = cfo + cfi + cff;
    
    if (d.monthly) {
        d.monthly.cfo = Array.from({length: 12}, (_, i) => (d.monthly?.netIncome?.[i] || 0) + (d.monthly?.dep?.[i] || 0));
        d.monthly.cfo_in = Array.from({length: 12}, (_, i) => d.monthly?.revenue?.[i] || 0);
        d.monthly.cfo_out = d.monthly.cfo.map((x, i) => x - (d.monthly.cfo_in[i] || 0));

        d.monthly.cfi = Array.from({length: 12}, (_, i) => -((d.monthly?.hardSpend?.[i] || 0) + (d.monthly?.softSpend?.[i] || 0) + (d.monthly?.landSpend?.[i] || 0)) + (d.monthly?.exit?.[i] || 0));
        d.monthly.cfi_in = Array.from({length: 12}, (_, i) => d.monthly?.exit?.[i] || 0);
        d.monthly.cfi_out = Array.from({length: 12}, (_, i) => -((d.monthly?.hardSpend?.[i] || 0) + (d.monthly?.softSpend?.[i] || 0) + (d.monthly?.landSpend?.[i] || 0)));

        d.monthly.cff = Array.from({length: 12}, (_, i) => (d.monthly?.debtDraw?.[i] || 0) - (d.monthly?.principal?.[i] || 0) + (d.monthly?.shortfallEquity?.[i] || 0) - (d.monthly?.fcfe?.[i] || 0));
        d.monthly.cff_in = Array.from({length: 12}, (_, i) => (d.monthly?.debtDraw?.[i] || 0) + (d.monthly?.shortfallEquity?.[i] || 0));
        d.monthly.cff_out = Array.from({length: 12}, (_, i) => -(d.monthly?.principal?.[i] || 0) - (d.monthly?.fcfe?.[i] || 0));

        d.monthly.netFlow = d.monthly.cfo.map((x, i) => x + d.monthly.cfi[i] + d.monthly.cff[i]);
    }
    
    return { ...d, cfo, cfo_in, cfo_out, cfi, cfi_in, cfi_out, cff, cff_in, cff_out, netFlow };
  });
  
  let currentCash = 0;
  annualData = annualData.map(d => {
      currentCash += d.netFlow;
      return { ...d, endCash: currentCash };
  });

  const operatingData = annualData.filter((d) => d.isOperating);

  return {
    assumptions,
    annualData,
    operatingData,
    metrics: {
      totalCapex,
      totalProjectCost,
      upfrontTotalCapex,
      totalCapexExLand,
      totalDebt,
      totalEquity: peakEquityRequired,
      totalInvestment: peakTotalInvestment,
      irr: calculateIRR(equityCfsMonthly, "monthly"),
      npv: calculateNPV(equityCfsMonthly, assumptions.discountRate, "monthly"),
      unleveredIrr: calculateIRR(unleveredCfsMonthly, "monthly"),
      unleveredNpv: calculateNPV(
        unleveredCfsMonthly,
        assumptions.discountRate,
        "monthly",
      ),
      irrExLand: calculateIRR(equityCfsExLandMonthly, "monthly"),
      npvExLand: calculateNPV(
        equityCfsExLandMonthly,
        assumptions.discountRate,
        "monthly",
      ),
      payback: calculatePayback(equityCfsMonthly, "monthly"),
      operatingPayback: calculatePayback(operatingCfsMonthly, "monthly"),
      avgDscr: projYears > 0 ? avgDscr / projYears : 0,
      minDscr:
        operatingData.filter((d) => d.principal + d.interest > 0).length > 0
          ? Math.min(
              ...operatingData
                .filter((d) => d.principal + d.interest > 0)
                .map((d) => d.dscr),
            )
          : 0,
      avgYield: projYears > 0 ? avgYield / projYears : 0,
      moic:
        equityCfsMonthly.reduce((acc, val) => (val > 0 ? acc + val : acc), 0) /
        totalEquity,
      costPerBed:
        opCoModelData?.opsMetrics?.beds > 0
          ? totalCapex / opCoModelData.opsMetrics.beds
          : 0,
      costPerSqm:
        assumptions.buildArea > 0
          ? (totalCapex * 1000) / assumptions.buildArea
          : 0,
      yocExLand:
        projYears > 0
          ? operatingData.reduce((acc, d) => acc + d.ebitda, 0) /
            projYears /
            totalCapexExLand
          : 0,
    },
    totals: {
      revenue: annualData.reduce((acc, d) => acc + (d.revenue || 0), 0),
      devGa: annualData.reduce((acc, d) => acc + (d.devGa || 0), 0),
      devCar: annualData.reduce((acc, d) => acc + (d.devCar || 0), 0),
      preOpeningDev: annualData.reduce(
        (acc, d) => acc + (d.devGa || 0) + (d.devCar || 0),
        0,
      ),
      maintOpex: annualData.reduce((acc, d) => acc + (d.maintOpex || 0), 0),
      taxOpex: annualData.reduce((acc, d) => acc + (d.taxOpex || 0), 0),
      overheadOpex: annualData.reduce(
        (acc, d) => acc + (d.overheadOpex || 0),
        0,
      ),
      ffeReserve: annualData.reduce((acc, d) => acc + (d.ffeReserve || 0), 0),
      medEqLeaseOpex: annualData.reduce(
        (acc, d) => acc + (d.medEqLeaseOpex || 0),
        0,
      ),
      gop: annualData.reduce((acc, d) => acc + (d.gop || 0), 0),
      ebitda: annualData.reduce((acc, d) => acc + (d.ebitda || 0), 0),
      ebit: annualData.reduce((acc, d) => acc + (d.ebit || 0), 0),
      interest: annualData.reduce((acc, d) => acc + (d.interest || 0), 0),
      principal: annualData.reduce((acc, d) => acc + (d.principal || 0), 0),
      ds: annualData.reduce(
        (acc, d) => acc + (d.interest || 0) + (d.principal || 0),
        0,
      ),
      dep: annualData.reduce((acc, d) => acc + (d.dep || 0), 0),
      depBuild: annualData.reduce((acc, d) => acc + (d.depBuild || 0), 0),
      depMedEq: annualData.reduce((acc, d) => acc + (d.depMedEq || 0), 0),
      depInfra: annualData.reduce((acc, d) => acc + (d.depInfra || 0), 0),
      depFfe: annualData.reduce((acc, d) => acc + (d.depFfe || 0), 0),
      depSharing: annualData.reduce((acc, d) => acc + (d.depSharing || 0), 0),
      depConsultant: annualData.reduce(
        (acc, d) => acc + (d.depConsultant || 0),
        0,
      ),
      depLicense: annualData.reduce((acc, d) => acc + (d.depLicense || 0), 0),
      depVat: annualData.reduce((acc, d) => acc + (d.depVat || 0), 0),
      depContingency: annualData.reduce(
        (acc, d) => acc + (d.depContingency || 0),
        0,
      ),
      depSoft: annualData.reduce((acc, d) => acc + (d.depSoft || 0), 0),
      ebt: annualData.reduce((acc, d) => acc + (d.ebt || 0), 0),
      corpTax: annualData.reduce((acc, d) => acc + (d.corpTax || 0), 0),
      netIncome: annualData.reduce((acc, d) => acc + (d.netIncome || 0), 0),
      cfo: annualData.reduce((acc, d) => acc + (d.cfo || 0), 0),
      cfo_in: annualData.reduce((acc, d) => acc + (d.cfo_in || 0), 0),
      cfo_out: annualData.reduce((acc, d) => acc + (d.cfo_out || 0), 0),
      cfi: annualData.reduce((acc, d) => acc + (d.cfi || 0), 0),
      cfi_in: annualData.reduce((acc, d) => acc + (d.cfi_in || 0), 0),
      cfi_out: annualData.reduce((acc, d) => acc + (d.cfi_out || 0), 0),
      cff: annualData.reduce((acc, d) => acc + (d.cff || 0), 0),
      cff_in: annualData.reduce((acc, d) => acc + (d.cff_in || 0), 0),
      cff_out: annualData.reduce((acc, d) => acc + (d.cff_out || 0), 0),
      netFlow: annualData.reduce((acc, d) => acc + (d.netFlow || 0), 0),
      deferredCapex: annualData.reduce(
        (acc, d) => acc + (d.deferredCapex || 0),
        0,
      ),
      landSpend: annualData.reduce((acc, d) => acc + (d.landSpend || 0), 0),
      buildSpend: annualData.reduce((acc, d) => acc + (d.buildSpend || 0), 0),
      eqSpend: annualData.reduce((acc, d) => acc + (d.eqSpend || 0), 0),
      infraSpend: annualData.reduce((acc, d) => acc + (d.infraSpend || 0), 0),
      ffeSpend: annualData.reduce((acc, d) => acc + (d.ffeSpend || 0), 0),
      sharingSpend: annualData.reduce(
        (acc, d) => acc + (d.sharingSpend || 0),
        0,
      ),
      consultantSpend: annualData.reduce(
        (acc, d) => acc + (d.consultantSpend || 0),
        0,
      ),
      licenseSpend: annualData.reduce(
        (acc, d) => acc + (d.licenseSpend || 0),
        0,
      ),
      vatSpend: annualData.reduce((acc, d) => acc + (d.vatSpend || 0), 0),
      contingencySpend: annualData.reduce(
        (acc, d) => acc + (d.contingencySpend || 0),
        0,
      ),
      hardSpend: annualData.reduce((acc, d) => acc + (d.hardSpend || 0), 0),
      softSpend: annualData.reduce((acc, d) => acc + (d.softSpend || 0), 0),
      totalSpend: annualData.reduce((acc, d) => acc + (d.totalSpend || 0), 0),
      debtDraw: annualData.reduce((acc, d) => acc + (d.debtDraw || 0), 0),
      fcfe: annualData.reduce((acc, d) => acc + (d.fcfe || 0), 0),
      opFcfe: annualData.reduce((acc, d) => acc + (d.opFcfe || 0), 0),
      shortfallEquity: annualData.reduce(
        (acc, d) => acc + (d.shortfallEquity || 0),
        0,
      ),
      netExitProceeds: annualData.reduce(
        (acc, d) => acc + (d.netExitProceeds || 0),
        0,
      ),
      loanSettledAtExit: annualData.reduce(
        (acc, d) => acc + (d.loanSettledAtExit || 0),
        0,
      ),
      grossExitValue: annualData.reduce(
        (acc, d) => acc + (d.grossExitValue || 0),
        0,
      ),
      interestExLand: annualData.reduce(
        (acc, d) => acc + (d.interestExLand || 0),
        0,
      ),
      principalExLand: annualData.reduce(
        (acc, d) => acc + (d.principalExLand || 0),
        0,
      ),
      ebtExLand: annualData.reduce((acc, d) => acc + (d.ebtExLand || 0), 0),
      corpTaxExLand: annualData.reduce(
        (acc, d) => acc + (d.corpTaxExLand || 0),
        0,
      ),
      netExitProceedsExLand: annualData.reduce(
        (acc, d) => acc + (d.netExitProceedsExLand || 0),
        0,
      ),
      opFcfeExLand: annualData.reduce(
        (acc, d) => acc + (d.opFcfeExLand || 0),
        0,
      ),
      fcfeExLand: annualData.reduce((acc, d) => acc + (d.fcfeExLand || 0), 0),
    },
    capexDetails: {
      landCost,
      buildCost,
      totalHardCosts,
      totalSoftCosts,
      totalCapex,
      medEqCost,
      infraCost,
      ffeCost,
      consultantCost,
      licenseCost,
      vatCost,
      contingencyCost,
      sharingDevCost,
      devGaCost: annualData
        .filter((d) => !d.isOperating)
        .reduce((acc, d) => acc + (d.devGa || 0), 0),
      devCarCost: annualData
        .filter((d) => !d.isOperating)
        .reduce((acc, d) => acc + (d.devCar || 0), 0),
    },
    equityCfsMonthly,
    equityCfsExLandMonthly,
    unleveredCfsMonthly,
    operatingCfsMonthly,
  };
};

const runConsolidatedEngine = (opCoData, propCoData, opCoAssumptions) => {
  let annualData = [],
    consolidatedCfs = [];
  let cumCf = 0;
  let avgConsolidatedDscr = 0;
  let operatingYearsWithDebt = 0;

  const totalPropCoEq = propCoData.metrics.totalEquity;
  const totalOpCoEq = opCoAssumptions.partnerBEquity; // 49% HoldCo Share
  const totalConsolidatedEquity = totalPropCoEq + totalOpCoEq;

  propCoData.annualData.forEach((pData, i) => {
    const oData = opCoData.annualData[i] || {
      shareB: 0,
      pB_Outlay: 0,
      pB_Exit: 0,
      isOperating: pData.isOperating,
      year: pData.year,
    };

    // FCFE & pB_Outlay are negative during investment, positive during returns
    const propCoInvestmentFlow = !pData.isOperating ? pData.fcfe || 0 : 0;
    const propCoExitFlow = pData.isOperating ? pData.exit || 0 : 0;
    const propCoOperatingFlow = pData.isOperating
      ? (pData.fcfe || 0) - propCoExitFlow
      : 0;

    const propCoFlow =
      propCoInvestmentFlow + propCoOperatingFlow + propCoExitFlow;
    const opCoInvestmentFlow = oData.pB_Outlay || 0;
    const opCoOperatingDividendFlow = oData.shareB || 0;
    const opCoExitFlow = oData.pB_Exit || 0;
    const opCoFlow =
      opCoInvestmentFlow + opCoOperatingDividendFlow + opCoExitFlow;
    const netFlow = propCoFlow + opCoFlow;

    let monthly = {
      propCoInvestmentFlow: [],
      propCoOperatingFlow: [],
      propCoExitFlow: [],
      propCoFlow: [],
      opCoInvestmentFlow: [],
      opCoOperatingDividendFlow: [],
      opCoExitFlow: [],
      opCoFlow: [],
      netFlow: [],
      cumCf: [],
      lookThroughRevenue: [],
      lookThroughEbitda: [],
      lookThroughNetIncome: [],
      lookThroughMargin: [],
      dep: [],
      interest: [],
      principal: [],
      tax: [],
      devGa: [],
      devCar: [],
      devPreOpening: [],
    };

    const sharePct = (100 - opCoAssumptions.sharingPercentA) / 100;
    for (let m = 0; m < 12; m++) {
      const pSnapshot = pData.monthly || {};
      const oSnapshot = oData.monthly || {};

      const m_pFcfe = (pSnapshot.fcfe || [])[m] || 0;
      const m_pExit = (pSnapshot.exit || [])[m] || 0;

      const m_propCoInvestmentFlow = !pData.isOperating ? m_pFcfe : 0;
      const m_propCoExitFlow = pData.isOperating ? m_pExit : 0;
      const m_propCoOperatingFlow = pData.isOperating ? m_pFcfe - m_pExit : 0;
      const m_propCoFlow =
        m_propCoInvestmentFlow + m_propCoOperatingFlow + m_propCoExitFlow;

      const m_opCoInvestmentFlow = (oSnapshot.pB_Outlay || [])[m] || 0;
      const m_opCoOperatingDividendFlow = (oSnapshot.shareB || [])[m] || 0;
      const m_opCoExitFlow = (oSnapshot.pB_Exit || [])[m] || 0;
      const m_opCoFlow =
        m_opCoInvestmentFlow + m_opCoOperatingDividendFlow + m_opCoExitFlow;
      const m_netFlow = m_propCoFlow + m_opCoFlow;

      const m_ltRev =
        ((pSnapshot.revenue || [])[m] || 0) +
        ((oSnapshot.totalRev || [])[m] || 0) * sharePct;
      const m_ltEbitda =
        ((pSnapshot.ebitda || [])[m] || 0) +
        ((oSnapshot.ebitda || [])[m] || 0) * sharePct;
      const m_ltNi =
        ((pSnapshot.netIncome || [])[m] || 0) +
        ((oSnapshot.netIncome || [])[m] || 0) * sharePct;

      const m_dep = (pSnapshot.dep || [])[m] || 0;
      const m_interest = (pSnapshot.interest || [])[m] || 0;
      const m_principal = (pSnapshot.principal || [])[m] || 0;
      const m_tax = ((pSnapshot.tax || [])[m] || 0) + ((oSnapshot.tax || [])[m] || 0) * sharePct;
      const m_devGa = (pSnapshot.devGa || [])[m] || 0;
      const m_devCar = (pSnapshot.devCar || [])[m] || 0;
      const m_devPreOpening = (pSnapshot.devPreOpening || [])[m] || 0;

      monthly.propCoInvestmentFlow.push(m_propCoInvestmentFlow);
      monthly.propCoOperatingFlow.push(m_propCoOperatingFlow);
      monthly.propCoExitFlow.push(m_propCoExitFlow);
      monthly.propCoFlow.push(m_propCoFlow);
      monthly.opCoInvestmentFlow.push(m_opCoInvestmentFlow);
      monthly.opCoOperatingDividendFlow.push(m_opCoOperatingDividendFlow);
      monthly.opCoExitFlow.push(m_opCoExitFlow);
      monthly.opCoFlow.push(m_opCoFlow);
      monthly.netFlow.push(m_netFlow);
      monthly.cumCf.push(cumCf + monthly.netFlow.reduce((a, b) => a + b, 0));
      monthly.lookThroughRevenue.push(m_ltRev);
      monthly.lookThroughEbitda.push(m_ltEbitda);
      monthly.lookThroughNetIncome.push(m_ltNi);
      monthly.lookThroughMargin.push(
        m_ltRev > 0 ? (m_ltNi / m_ltRev) * 100 : 0,
      );
      monthly.dep.push(m_dep);
      monthly.interest.push(m_interest);
      monthly.principal.push(m_principal);
      monthly.tax.push(m_tax);
      monthly.devGa.push(m_devGa);
      monthly.devCar.push(m_devCar);
      monthly.devPreOpening.push(m_devPreOpening);
    }

    cumCf += netFlow;
    consolidatedCfs.push(netFlow);

    // Look-Through PnL Metrics
    const lookThroughRevenue =
      (pData.revenue || 0) + (oData.totalRev || 0) * sharePct;
    const lookThroughEbitda =
      (pData.ebitda || 0) + (oData.ebitda || 0) * sharePct;
    const lookThroughNetIncome =
      (pData.netIncome || 0) + (oData.netIncome || 0) * sharePct;
    const lookThroughMargin =
      lookThroughRevenue > 0
         ? (lookThroughNetIncome / lookThroughRevenue) * 100
         : 0;

    // Consolidated DSCR Math
    if (pData.isOperating) {
      const ds = (pData.principal || 0) + (pData.interest || 0);
      if (ds > 0) {
        const cashAvailable = (pData.ebitda || 0) + opCoOperatingDividendFlow;
         avgConsolidatedDscr += cashAvailable / ds;
         operatingYearsWithDebt++;
      }
    }

    annualData.push({
      year: pData.year,
      isOperating: pData.isOperating,
      propCoInvestmentFlow,
      propCoOperatingFlow,
      propCoExitFlow,
      propCoFlow,
      opCoInvestmentFlow,
      opCoOperatingDividendFlow,
      opCoExitFlow,
      opCoFlow,
      netFlow,
      cumCf,
      lookThroughRevenue,
      lookThroughEbitda,
      lookThroughNetIncome,
      lookThroughMargin,
      dep: pData.dep || 0,
      depBuild: pData.depBuild || 0,
      depMedEq: pData.depMedEq || 0,
      depInfra: pData.depInfra || 0,
      depFfe: pData.depFfe || 0,
      depSharing: pData.depSharing || 0,
      depConsultant: pData.depConsultant || 0,
      depLicense: pData.depLicense || 0,
      depVat: pData.depVat || 0,
      depContingency: pData.depContingency || 0,
      depSoft: pData.depSoft || 0,
      interest: pData.interest || 0,
      principal: pData.principal || 0,
      tax: (pData.tax || 0) + (oData.tax || 0) * sharePct,
      devGa: pData.devGa || 0,
      devCar: pData.devCar || 0,
      devPreOpening: pData.devPreOpening || 0,
      monthly,
    });
  });

  const totals = {
    propCoInvestmentFlow: annualData.reduce(
      (acc, d) => acc + d.propCoInvestmentFlow,
      0,
    ),
    propCoOperatingFlow: annualData.reduce(
      (acc, d) => acc + d.propCoOperatingFlow,
      0,
    ),
    propCoExitFlow: annualData.reduce((acc, d) => acc + d.propCoExitFlow, 0),
    propCoFlow: annualData.reduce((acc, d) => acc + d.propCoFlow, 0),
    opCoInvestmentFlow: annualData.reduce(
      (acc, d) => acc + d.opCoInvestmentFlow,
      0,
    ),
    opCoOperatingDividendFlow: annualData.reduce(
      (acc, d) => acc + d.opCoOperatingDividendFlow,
      0,
    ),
    opCoExitFlow: annualData.reduce((acc, d) => acc + d.opCoExitFlow, 0),
    opCoFlow: annualData.reduce((acc, d) => acc + d.opCoFlow, 0),
    netFlow: annualData.reduce((acc, d) => acc + d.netFlow, 0),
    lookThroughRevenue: annualData.reduce(
      (acc, d) => acc + (d.lookThroughRevenue || 0),
      0,
    ),
    lookThroughEbitda: annualData.reduce(
      (acc, d) => acc + (d.lookThroughEbitda || 0),
      0,
    ),
    lookThroughNetIncome: annualData.reduce(
      (acc, d) => acc + (d.lookThroughNetIncome || 0),
      0,
    ),
    dep: annualData.reduce((acc, d) => acc + d.dep, 0),
    depBuild: annualData.reduce((acc, d) => acc + (d.depBuild || 0), 0),
    depMedEq: annualData.reduce((acc, d) => acc + (d.depMedEq || 0), 0),
    depInfra: annualData.reduce((acc, d) => acc + (d.depInfra || 0), 0),
    depFfe: annualData.reduce((acc, d) => acc + (d.depFfe || 0), 0),
    depSharing: annualData.reduce((acc, d) => acc + (d.depSharing || 0), 0),
    depConsultant: annualData.reduce((acc, d) => acc + (d.depConsultant || 0), 0),
    depLicense: annualData.reduce((acc, d) => acc + (d.depLicense || 0), 0),
    depVat: annualData.reduce((acc, d) => acc + (d.depVat || 0), 0),
    depContingency: annualData.reduce((acc, d) => acc + (d.depContingency || 0), 0),
    depSoft: annualData.reduce((acc, d) => acc + (d.depSoft || 0), 0),
    interest: annualData.reduce((acc, d) => acc + d.interest, 0),
    principal: annualData.reduce((acc, d) => acc + d.principal, 0),
    tax: annualData.reduce((acc, d) => acc + d.tax, 0),
    devGa: annualData.reduce((acc, d) => acc + d.devGa, 0),
    devCar: annualData.reduce((acc, d) => acc + d.devCar, 0),
    devPreOpening: annualData.reduce((acc, d) => acc + d.devPreOpening, 0),
  };
  totals.lookThroughMargin =
    totals.lookThroughRevenue > 0
      ? (totals.lookThroughNetIncome / totals.lookThroughRevenue) * 100
      : 0;

  // Compile monthly consolidated cash flows for monthly compounding IRR/NPV
  let consolidatedCfsMonthly = [];
  const propCoCfs = propCoData.equityCfsMonthly || [];
  const opCoCfs = opCoData.partnerBCfsMonthly || [];
  const totalMonths = Math.max(propCoCfs.length, opCoCfs.length);

  for (let m = 0; m < totalMonths; m++) {
    const pCf = propCoCfs[m] || 0;
    const oCf = opCoCfs[m] || 0;
    consolidatedCfsMonthly.push(pCf + oCf);
  }

  return {
    annualData,
    operatingData: annualData.filter((d) => d.isOperating),
    metrics: {
      totalEquity: totalConsolidatedEquity,
      irr: calculateIRR(consolidatedCfsMonthly, "monthly"),
      npv: calculateNPV(
        consolidatedCfsMonthly,
        opCoAssumptions.holdCoDiscountRate,
        "monthly",
      ),
      payback: calculatePayback(consolidatedCfsMonthly, "monthly"),
      moic:
        totalConsolidatedEquity > 0
          ? consolidatedCfsMonthly.reduce(
              (acc, val) => (val > 0 ? acc + val : acc),
              0,
            ) / totalConsolidatedEquity
          : 0,
      avgConsolidatedDscr:
        operatingYearsWithDebt > 0
          ? avgConsolidatedDscr / operatingYearsWithDebt
          : 0,
    },
    totals,
    consolidatedCfsMonthly,
  };
};

const formatNumber = (val, decimals = 1) => {
  if (val === null || val === undefined || isNaN(val)) return "0";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
};

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "Rp 0";
  if (Math.abs(val) >= 1) {
    return `Rp ${formatNumber(val, 1)} B`;
  }
  return `Rp ${formatNumber(val * 1000, 0)} M`;
};

const INITIAL_ASSET_CLUSTERS_ASSUMPTIONS = {
  global: {
    discountRate: 11,
    includeTerminalValue: true,
    exitMethod: "multiple",
    exitCapRate: 8.5,
    exitMultiple: 10,
    sellingCosts: 0,
    corporateTax: 22,
    interestRate: 8.5,
    ltv: 70,
    loanTenor: 15,
    ioGracePeriodYears: 3,
    includeFinancing: false,
    drawdownScenario: "tranches",
    drawdownTranches: [20, 40, 60, 80, 100],
    capexSharingDevQty: 5361,
    capexSharingDevPrice: 0.8,
    capexConsultantPct: 2.5,
    capexLicensePct: 1.5,
    capexContingencyPct: 5,
    capexVat: 11
  },
  clusters: {
    "Glamping": {
      type: "glamping",
      sharingArea: 1904,
      landArea: 41042,
      buildArea: 5000,
      buildCost: 3.5,
      landPrice: 0.7,
      civilMepCostPerUnit: 100,
      glampingMix: [
        { type: "1Br Tent - Deluxe", unitSize: "5 x 5", footprint: "6 x 6", qty: 24, villaCost: 0.65, ffeCost: 0.18, isAccommodation: true },
        { type: "1Br Tent - Family", unitSize: "5 x 7.5", footprint: "6 x 9", qty: 12, villaCost: 0.68, ffeCost: 0.28, isAccommodation: true },
        { type: "1Br Tent - Suite", unitSize: "7.5 x 10", footprint: "9 x 12", qty: 4, villaCost: 1.05, ffeCost: 0.31, isAccommodation: true },
        { type: "Spa Tent - Double Roof", unitSize: "5 x 7.5", footprint: "6 x 9", qty: 1, villaCost: 0.66, ffeCost: 0.19, isAccommodation: false },
        { type: "Bar Tent - Double Roof", unitSize: "5 x 7.5", footprint: "6 x 9", qty: 1, villaCost: 0.60, ffeCost: 0.29, isAccommodation: false },
        { type: "Restaurant Tent - Double", unitSize: "7.5 x 10", footprint: "9 x 12", qty: 1, villaCost: 1.01, ffeCost: 0.41, isAccommodation: false }
      ],
      manualBaseRent: 35,
      manualRentEscalation: 3,
      adr: 2500000,
      adrEscalationYear1to5: 5,
      adrEscalationAfterYear5: 3,
      barUnits: 1,
      barRevenuePctOfRoom: 0.4,
      fbCogsPct: 35,
      initialOccupancy: 30,
      stabilizedOccupancy: 55,
      seasonality: [0.8, 0.7, 0.9, 1.1, 1.2, 1.3, 1.4, 1.3, 1.2, 1.0, 0.9, 0.8],
      directLaborPct: 15,
      directRepairsPct: 7,
      directUtilitiesPct: 5,
      adminLaborPct: 10,
      marketingPct: 3,
      adminGeneralPct: 2,
      constructionOpexMonthly: 0.2,
      capexCarPct: 0.15,
      preOpeningMonthly: 0.4,
      preOpeningDuration: 4,
      opOverheadMonthly: 0,
      opOverheadInc: 4,
      maintRate: 0,
      propTaxRate: 0,
      ffeReservePct: 2,
      depMethodBuilding: "SL",
      depLifeBuilding: 20,
      depMethodInfra: "SL",
      depLifeInfra: 20,
      depMethodFFE: "SL",
      depLifeFFE: 20,
      includeFinancing: false,
      ltv: 70,
      interestRate: 8.5,
      loanTenor: 15,
      ioGracePeriodYears: 3,
      discountRate: 11,
      includeTerminalValue: true,
      exitMethod: "multiple",
      exitCapRate: 8.5,
      exitMultiple: 10,
      sellingCosts: 0,
      corporateTax: 22,
    },
    "Commercial Compound": {
      type: "lease",
      sharingArea: 3102,
      landArea: 66856,
      buildArea: 12000,
      buildCost: 6.5,
      manualBaseRent: 42,
      manualRentEscalation: 4,
      constructionOpexMonthly: 0.2,
      capexCarPct: 0.15,
      preOpeningMonthly: 0.3,
      preOpeningDuration: 4,
      opOverheadMonthly: 0,
      opOverheadInc: 4,
      maintRate: 0,
      propTaxRate: 0,
      ffeReservePct: 1,
      depMethodBuilding: "SL",
      depLifeBuilding: 20,
      depMethodInfra: "SL",
      depLifeInfra: 20,
      depMethodFFE: "SL",
      depLifeFFE: 20,
      includeFinancing: false,
      ltv: 70,
      interestRate: 8.5,
      loanTenor: 15,
      ioGracePeriodYears: 3,
      discountRate: 11,
      includeTerminalValue: true,
      exitMethod: "multiple",
      exitCapRate: 8.5,
      exitMultiple: 10,
      sellingCosts: 0,
      corporateTax: 22,
    },
    "Hills Villa": {
      type: "lease",
      sharingArea: 3108,
      landArea: 66986,
      buildArea: 15000,
      buildCost: 7.2,
      manualBaseRent: 48,
      manualRentEscalation: 4,
      constructionOpexMonthly: 0.2,
      capexCarPct: 0.15,
      preOpeningMonthly: 0.3,
      preOpeningDuration: 4,
      opOverheadMonthly: 0,
      opOverheadInc: 4,
      maintRate: 0,
      propTaxRate: 0,
      ffeReservePct: 1,
      depMethodBuilding: "SL",
      depLifeBuilding: 20,
      depMethodInfra: "SL",
      depLifeInfra: 20,
      depMethodFFE: "SL",
      depLifeFFE: 20,
      includeFinancing: false,
      ltv: 70,
      interestRate: 8.5,
      loanTenor: 15,
      ioGracePeriodYears: 3,
      discountRate: 11,
      includeTerminalValue: true,
      exitMethod: "multiple",
      exitCapRate: 8.5,
      exitMultiple: 10,
      sellingCosts: 0,
      corporateTax: 22,
    },
    "Hospitality 1": {
      type: "lease",
      sharingArea: 4831,
      landArea: 104143,
      buildArea: 25000,
      buildCost: 8.5,
      manualBaseRent: 65,
      manualRentEscalation: 5,
      constructionOpexMonthly: 0.2,
      capexCarPct: 0.15,
      preOpeningMonthly: 0.5,
      preOpeningDuration: 4,
      opOverheadMonthly: 0,
      opOverheadInc: 4,
      maintRate: 0,
      propTaxRate: 0,
      ffeReservePct: 1,
      depMethodBuilding: "SL",
      depLifeBuilding: 20,
      depMethodInfra: "SL",
      depLifeInfra: 20,
      depMethodFFE: "SL",
      depLifeFFE: 20,
      includeFinancing: false,
      ltv: 70,
      interestRate: 8.5,
      loanTenor: 15,
      ioGracePeriodYears: 3,
      discountRate: 11,
      includeTerminalValue: true,
      exitMethod: "multiple",
      exitCapRate: 8.5,
      exitMultiple: 10,
      sellingCosts: 0,
      corporateTax: 22,
    },
    "Hospitality 2": {
      type: "lease",
      sharingArea: 1909,
      landArea: 41139,
      buildArea: 10000,
      buildCost: 7.8,
      manualBaseRent: 38,
      manualRentEscalation: 3,
      constructionOpexMonthly: 0.2,
      capexCarPct: 0.15,
      preOpeningMonthly: 0.3,
      preOpeningDuration: 4,
      opOverheadMonthly: 0,
      opOverheadInc: 4,
      maintRate: 0,
      propTaxRate: 0,
      ffeReservePct: 1,
      depMethodBuilding: "SL",
      depLifeBuilding: 20,
      depMethodInfra: "SL",
      depLifeInfra: 20,
      depMethodFFE: "SL",
      depLifeFFE: 20,
      includeFinancing: false,
      ltv: 70,
      interestRate: 8.5,
      loanTenor: 15,
      ioGracePeriodYears: 3,
      discountRate: 11,
      includeTerminalValue: true,
      exitMethod: "multiple",
      exitCapRate: 8.5,
      exitMultiple: 10,
      sellingCosts: 0,
      corporateTax: 22,
    },
    "Adventure & Stable": {
      type: "lease",
      sharingArea: 4609,
      landArea: 99345,
      buildArea: 8000,
      buildCost: 4.2,
      manualBaseRent: 22,
      manualRentEscalation: 3,
      constructionOpexMonthly: 0.2,
      capexCarPct: 0.15,
      preOpeningMonthly: 0.2,
      preOpeningDuration: 4,
      opOverheadMonthly: 0,
      opOverheadInc: 4,
      maintRate: 0,
      propTaxRate: 0,
      ffeReservePct: 1,
      depMethodBuilding: "SL",
      depLifeBuilding: 20,
      depMethodInfra: "SL",
      depLifeInfra: 20,
      depMethodFFE: "SL",
      depLifeFFE: 20,
      includeFinancing: false,
      ltv: 70,
      interestRate: 8.5,
      loanTenor: 15,
      ioGracePeriodYears: 3,
      discountRate: 11,
      includeTerminalValue: true,
      exitMethod: "multiple",
      exitCapRate: 8.5,
      exitMultiple: 10,
      sellingCosts: 0,
      corporateTax: 22,
    },
  }
};

const runConsolidatedAssetEngine = (assumptions, holdCoScenario = "manual", globalDevDuration = 24, groups = []) => {
  const activeAssumptions = assumptions || INITIAL_ASSET_CLUSTERS_ASSUMPTIONS;
  const globalClaims = activeAssumptions.global || INITIAL_ASSET_CLUSTERS_ASSUMPTIONS.global;
  const clusters = activeAssumptions.clusters || INITIAL_ASSET_CLUSTERS_ASSUMPTIONS.clusters;

  const parsedTimings = parseTimelineTimings(groups, 30, globalDevDuration);
  const clusterTimings = parsedTimings || {
    totalDevMonths: globalDevDuration,
    constrTiming: null,
    infraTiming: null,
    ffeTiming: null,
    sharingTiming: null,
    consultantTiming: null,
    licenseTiming: null,
    landTiming: null
  };

  const clustersData = {};
  const MAX_MONTHS = 360;
  const consolidatedCfsMonthly = Array(MAX_MONTHS).fill(0);
  const consolidatedPropCoFlowMonthly = Array(MAX_MONTHS).fill(0);
  const consolidatedOpCoFlowMonthly = Array(MAX_MONTHS).fill(0);

  let cumulativeConsolidatedNpv = 0;
  let cumulativeConsolidatedCapex = 0;
  const capexDetails = {
    landCost: 0,
    buildCost: 0,
    civilMepCost: 0,
    ffeCost: 0,
    infraCost: 0,
    sharingDevCost: 0,
    medEqCost: 0,
    consultantCost: 0,
    licenseCost: 0,
    contingencyCost: 0,
    vatCost: 0,
    devGa: 0,
    devCar: 0,
    devPreOpening: 0,
    totalSoftCosts: 0,
    totalHardCosts: 0,
    totalCapexExLand: 0,
    totalCapex: 0,
  };

  Object.keys(clusters).forEach((cName) => {
    const cAss = { ...clusters[cName], ...globalClaims };
    const type = cAss.type || "lease";

    const buildArea = cAss.buildArea || 0;
    const buildCost = cAss.buildCost || 0;
    let buildCostB = 0;

    const infraQty = cAss.capexInfraQty !== undefined && cAss.capexInfraQty !== null
      ? cAss.capexInfraQty
      : ((cAss.landArea || 0) - (cAss.sharingArea || 0)) * 0.5;
    const infraPrice = cAss.capexInfraPrice !== undefined && cAss.capexInfraPrice !== null
      ? cAss.capexInfraPrice
      : 0.45;

    let ffeCost = 0;
    let infraCost = 0;
    let civilMepCost = 0;

    if (type === "glamping") {
      const glampingMix = cAss.glampingMix || [];
      const acomUnits = glampingMix.filter(item => item.isAccommodation);
      const acomQty = acomUnits.reduce((sum, item) => sum + (item.qty || 0), 0);
      const totalMixCost = glampingMix.reduce((sum, item) => sum + (item.qty || 0) * (item.villaCost || 0), 0);
      buildCostB = totalMixCost; // Corrected: already in Billion IDR
      
      const ffeMixCost = glampingMix.reduce((sum, item) => sum + (item.qty || 0) * (item.ffeCost || 0), 0);
      const infraMixCost = glampingMix.reduce((sum, item) => sum + (item.qty || 0) * (item.infraCost || 0), 0);
      const civilMepMixCost = glampingMix.reduce((sum, item) => sum + (item.qty || 0) * (item.civilMepCost || 0), 0);
      
      ffeCost = ffeMixCost; // Corrected: already in Billion IDR
      infraCost = infraMixCost > 0 ? infraMixCost : (infraQty * infraPrice) / 1000;
      civilMepCost = civilMepMixCost > 0 ? civilMepMixCost : (acomQty > 0 ? (acomQty * (cAss.civilMepCostPerUnit || 120)) / 1000 : buildCostB * 0.20);
    } else {
      buildCostB = (buildArea * buildCost) / 1000;
      ffeCost = buildCostB * 0.15; // Example approx for non-glamping
      infraCost = (infraQty * infraPrice) / 1000;
      civilMepCost = buildCostB * 0.20;
    }

    const sharingDevCost = ((cAss.sharingArea || cAss.capexSharingDevQty) * (cAss.capexSharingDevPrice || 0)) / 1000;

    const designLicenseBase = buildCostB + civilMepCost + ffeCost + infraCost + sharingDevCost;
    const consultantCost = designLicenseBase * (cAss.capexConsultantPct || 2.5) / 100;
    const licenseCost = designLicenseBase * (cAss.capexLicensePct || 1.5) / 100;
    
    const vatBase = consultantCost + buildCostB + civilMepCost + ffeCost + infraCost + sharingDevCost;
    const vatCost = vatBase * (cAss.capexVat || 11) / 100;

    const contingencyBase = licenseCost + consultantCost + buildCostB + civilMepCost + ffeCost + infraCost + sharingDevCost + vatCost;
    const contingencyCost = contingencyBase * (cAss.capexContingencyPct !== undefined && cAss.capexContingencyPct !== null ? cAss.capexContingencyPct : 5) / 100;

    const landCost = (cAss.includeLand !== false) ? ((cAss.landArea || 0) * (cAss.landPrice || 0) / 1000) : 0;

    // PSAK 19 Start-up expenditure is strictly expensed immediately
    const preOpeningCost = (cAss.preOpeningMonthly || 0.4) * (cAss.preOpeningDuration || 6);

    const totalCapex = landCost + buildCostB + ffeCost + infraCost + civilMepCost + sharingDevCost + consultantCost + licenseCost + contingencyCost + vatCost;
    cumulativeConsolidatedCapex += totalCapex;

    capexDetails.landCost += landCost;
    capexDetails.buildCost += buildCostB;
    capexDetails.ffeCost += ffeCost;
    capexDetails.infraCost += infraCost;
    capexDetails.civilMepCost += civilMepCost;
    capexDetails.sharingDevCost += sharingDevCost;
    capexDetails.consultantCost += consultantCost;
    capexDetails.licenseCost += licenseCost;
    capexDetails.contingencyCost += contingencyCost;
    capexDetails.vatCost += vatCost;
    capexDetails.devPreOpening += preOpeningCost;
    capexDetails.totalSoftCosts += consultantCost + licenseCost + contingencyCost + vatCost;
    capexDetails.totalHardCosts += buildCostB + ffeCost + infraCost + civilMepCost + sharingDevCost;
    capexDetails.totalCapexExLand += totalCapex - landCost;
    capexDetails.totalCapex += totalCapex;

    const monthlyCfs = Array(MAX_MONTHS).fill(0);
    const propCoCfs = Array(MAX_MONTHS).fill(0);
    const opCoCfs = Array(MAX_MONTHS).fill(0);

    const monthlyDataLocal = [];
    const devDuration = Math.max(1, globalDevDuration);

    let localScenario = holdCoScenario;
    if (holdCoScenario === "blended") {
      localScenario = cAss.clusterExitStrategy || "yr10";
    }

    let targetExitMonth = -1;
    if (localScenario === "none") {
      targetExitMonth = -1;
    } else if (localScenario === "yr10") {
      targetExitMonth = devDuration + 120;
    } else if (localScenario === "debt_free" || localScenario === "postdebt") {
      targetExitMonth = devDuration + (cAss.loanTenor || 15) * 12;
    } else if (localScenario === "manual") {
      targetExitMonth = cAss.includeTerminalValue ? 120 : -1;
    }

    let hasExited = false;
    let cumFcfe = 0;

    for (let m = 1; m <= MAX_MONTHS; m++) {
      const y = Math.ceil(m / 12);
      const monthIdxInYear = (m - 1) % 12;
      const isLeap = ((2025 + y) % 4 === 0 && ((2025 + y) % 100 !== 0)) || ((2025 + y) % 400 === 0);
      const daysInYear = isLeap ? 366 : 365;

      const daysInMonth = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][monthIdxInYear];
      const daysShare = daysInMonth / daysInYear;

      let opRev = 0;
      let opCosts = 0;
      let ebitda = 0;
      let baseRent = 0;
      let monthCapex = 0;
      let propCoFlow = 0;
      let opCoOperatingFlow = 0;
      let opCoExitFlow = 0;
      let ebt = 0;
      let corpTax = 0;
      let totalFlow = 0;
      let fbCogs = 0;
      let laborCost = 0;
      let maintCost = 0;
      let utilitiesCost = 0;
      let miscCost = 0;
      
      let directLabor = 0;
      let adminLabor = 0;
      let marketingCost = 0;
      let adminGeneralCost = 0;
      let taxOpex = 0;
      let ffeReserve = 0;
      let medEqLeaseOpex = 0;
      let overheadOpex = 0;
      let fixedOverhead = 0;
      let roomRevenue = 0;
      let barRevenue = 0;

      let monthlyDep = 0;

      const commercialOpeningMonth = devDuration + 1;
      const isActuallyOperating = m >= commercialOpeningMonth && !hasExited;

      let m_land = 0, m_build = 0, m_ffe = 0, m_infra = 0, m_civilMep = 0; 
      let m_consultant = 0, m_license = 0, m_vat = 0, m_contingency = 0, m_sharing = 0, m_preOpening = 0;

      let m_depBuild = 0, m_depFfe = 0, m_depInfra = 0, m_depSharing = 0, m_depConsultant = 0;
      let m_depLicense = 0, m_depVat = 0, m_depContingency = 0, m_depMedEq = 0;

      if (!hasExited) {
        if (m >= commercialOpeningMonth) {
          const opMonth = m - commercialOpeningMonth + 1;
          const yearOfOp = Math.ceil(opMonth / 12);
          
          taxOpex = (totalCapex * ((cAss.propTaxRate || 0) / 100)) / 12;
          
          if (type === "glamping") {
            const adrMult = Math.pow(1 + (cAss.adrEscalationYear1to5 !== undefined ? cAss.adrEscalationYear1to5 : 5) / 100, Math.min(4, yearOfOp - 1)) *
                             Math.pow(1 + (cAss.adrEscalationAfterYear5 !== undefined ? cAss.adrEscalationAfterYear5 : 3) / 100, Math.max(0, yearOfOp - 5));
            
            let occupancy = cAss.initialOccupancy !== undefined ? cAss.initialOccupancy : 30;
            if (yearOfOp === 2) {
              const initOcc = cAss.initialOccupancy !== undefined ? cAss.initialOccupancy : 30;
              const stabOcc = cAss.stabilizedOccupancy !== undefined ? cAss.stabilizedOccupancy : 55;
              occupancy = initOcc + (stabOcc - initOcc) / 2;
            } else if (yearOfOp >= 3) {
              occupancy = cAss.stabilizedOccupancy !== undefined ? cAss.stabilizedOccupancy : 55;
            }

            const seasonality = cAss.seasonality || [0.8, 0.7, 0.9, 1.1, 1.2, 1.3, 1.4, 1.3, 1.2, 1.0, 0.9, 0.8];
            const rawSeasonVal = seasonality[monthIdxInYear] !== undefined ? seasonality[monthIdxInYear] : 1.0;
            const seasonFactor = rawSeasonVal > 3 ? rawSeasonVal / 100 : rawSeasonVal;

            const glampingMix = cAss.glampingMix || [];
            const acomUnits = glampingMix.filter(item => item.isAccommodation);
            const roomUnits = acomUnits.reduce((sum, item) => sum + (item.qty || 0), 0) || cAss.roomUnits || 20;

            const roomsRev = roomUnits * ((cAss.adr !== undefined ? cAss.adr : 2500000) / 1.0e9) * adrMult * (occupancy / 100) * seasonFactor * daysInMonth;
            const fbRev = roomsRev * (cAss.barRevenuePctOfRoom !== undefined ? cAss.barRevenuePctOfRoom : 0.4);
            opRev = roomsRev + fbRev;
            roomRevenue = roomsRev;
            barRevenue = fbRev;

            fbCogs = fbRev * ((cAss.fbCogsPct !== undefined ? cAss.fbCogsPct : 35) / 100);
            directLabor = opRev * ((cAss.directLaborPct || 15) / 100);
            adminLabor = opRev * ((cAss.adminLaborPct || 10) / 100);
            laborCost = directLabor + adminLabor;
            
            maintCost = opRev * ((cAss.directRepairsPct || 7) / 100);
            utilitiesCost = opRev * ((cAss.directUtilitiesPct || 5) / 100);
            
            marketingCost = opRev * ((cAss.marketingPct !== undefined ? cAss.marketingPct : 3) / 100);
            adminGeneralCost = opRev * ((cAss.adminGeneralPct !== undefined ? cAss.adminGeneralPct : 2) / 100);
            miscCost = marketingCost + adminGeneralCost;
            
            ffeReserve = opRev * ((cAss.ffeReservePct !== undefined ? cAss.ffeReservePct : 2) / 100);
            
            // Apply fixed overhead additions if defined in assumptions
            const monthlyFixedOverhead = cAss.opOverheadMonthly ? 
                cAss.opOverheadMonthly * Math.pow(1 + (cAss.opOverheadInc || 0)/100, Math.max(0, yearOfOp - 1)) : 0;
            fixedOverhead = monthlyFixedOverhead;
                
            overheadOpex = directLabor + adminLabor + marketingCost + adminGeneralCost + monthlyFixedOverhead;

            opCosts = fbCogs + laborCost + maintCost + utilitiesCost + miscCost + ffeReserve + taxOpex + monthlyFixedOverhead;
            ebitda = opRev - opCosts;
          } else {
            const rentEsc = Math.pow(1 + (cAss.manualRentEscalation || 3) / 100, yearOfOp - 1);
            opRev = (cAss.manualBaseRent || 35) / 12 * rentEsc;
            
            // For simple lease models, overhead might be fixed
            const monthlyFixedOverhead = cAss.opOverheadMonthly ? 
                cAss.opOverheadMonthly * Math.pow(1 + (cAss.opOverheadInc || 0)/100, Math.max(0, yearOfOp - 1)) : 0;
            fixedOverhead = monthlyFixedOverhead;
                
            overheadOpex = monthlyFixedOverhead;
            adminGeneralCost = monthlyFixedOverhead;
            miscCost = monthlyFixedOverhead;
            
            ffeReserve = opRev * ((cAss.ffeReservePct !== undefined ? cAss.ffeReservePct : 1) / 100);
            
            opCosts = taxOpex + ffeReserve + monthlyFixedOverhead;
            ebitda = opRev - opCosts;
          }
          
          if (cAss.type === 'lease') {
            baseRent = opRev; // For lease type, we proxy revenues into base rent
          } else {
             // Optional logic: some assets use manual base rent based on yield
             if (cAss.baseRentYield !== undefined && cAss.baseRentYield > 0) {
                 const baseRentAnnual = totalCapex * (cAss.baseRentYield / 100);
                 const baseRentEsc = Math.pow(1 + (cAss.baseRentEscalation || 2) / 100, yearOfOp - 1);
                 baseRent = (baseRentAnnual / 12) * baseRentEsc;
             } else {
                 baseRent = (cAss.manualBaseRent || 35) / 12 * Math.pow(1 + (cAss.manualRentEscalation || 3) / 100, yearOfOp - 1);
             }
          }
        }

        if (m < commercialOpeningMonth) {
          if (clusterTimings && clusterTimings.constrTiming && m <= devDuration) {
            m_land = (clusterTimings.landTiming?.[m - 1] || 0) * landCost;
            m_build = (clusterTimings.constrTiming?.[m - 1] || 0) * buildCostB;
            m_civilMep = (clusterTimings.constrTiming?.[m - 1] || 0) * civilMepCost;
            m_ffe = (clusterTimings.ffeTiming?.[m - 1] || 0) * ffeCost;
            m_infra = (clusterTimings.infraTiming?.[m - 1] || 0) * infraCost;
            m_consultant = (clusterTimings.consultantTiming?.[m - 1] || 0) * consultantCost;
            m_license = (clusterTimings.licenseTiming?.[m - 1] || 0) * licenseCost;
            m_sharing = (clusterTimings.sharingTiming?.[m - 1] || 0) * sharingDevCost;
            
            m_preOpening = preOpeningCost / devDuration; // Pre-opening remains uniform
            
            const softHardSumForMonth = m_land + m_build + m_civilMep + m_ffe + m_infra + m_sharing + m_consultant + m_license;
            const totalMix = landCost + buildCostB + civilMepCost + ffeCost + infraCost + sharingDevCost + consultantCost + licenseCost;
            const distributionRatio = totalMix > 0 ? softHardSumForMonth / totalMix : 1 / devDuration;

            m_vat = vatCost * distributionRatio;
            m_contingency = contingencyCost * distributionRatio;
          } else if (m <= devDuration) {
            m_land = landCost / devDuration;
            m_build = buildCostB / devDuration;
            m_ffe = ffeCost / devDuration;
            m_infra = infraCost / devDuration;
            m_civilMep = civilMepCost / devDuration;
            m_consultant = consultantCost / devDuration;
            m_license = licenseCost / devDuration;
            m_vat = vatCost / devDuration;
            m_contingency = contingencyCost / devDuration;
            m_sharing = sharingDevCost / devDuration;
            m_preOpening = preOpeningCost / devDuration;
          }
          
          monthCapex = m_land + m_build + m_civilMep + m_ffe + m_infra + m_consultant + m_license + m_sharing + m_vat + m_contingency + m_preOpening;
        }

        const remainsMon = 120 - devDuration;
        const isOperating = remainsMon > 0 && m >= commercialOpeningMonth;

        m_depBuild = isOperating ? (buildCostB + civilMepCost) / ((cAss.depLifeBuilding || 20) * 12) : 0;
        m_depFfe = isOperating ? ffeCost / ((cAss.depLifeFFE || 20) * 12) : 0;
        m_depInfra = isOperating ? infraCost / ((cAss.depLifeInfra || 20) * 12) : 0;
        m_depSharing = isOperating ? sharingDevCost / ((cAss.depLifeInfra || 20) * 12) : 0;
        m_depConsultant = isOperating ? consultantCost / ((cAss.depLifeSoftCost || 20) * 12) : 0;
        m_depLicense = isOperating ? licenseCost / ((cAss.depLifeSoftCost || 20) * 12) : 0;
        m_depVat = isOperating ? vatCost / ((cAss.depLifeBuilding || 20) * 12) : 0;
        m_depContingency = isOperating ? contingencyCost / ((cAss.depLifeBuilding || 20) * 12) : 0;
        m_depMedEq = 0;

        monthlyDep = m_depBuild + m_depMedEq + m_depInfra + m_depFfe + m_depSharing + m_depConsultant + m_depLicense + m_depVat + m_depContingency;

        ebt = Math.max(0, ebitda - monthlyDep);
        corpTax = ebt * ((cAss.corporateTax || 22) / 100);

        propCoFlow = m < commercialOpeningMonth ? -monthCapex : baseRent;
        opCoOperatingFlow = m < commercialOpeningMonth ? 0 : ebitda - baseRent - corpTax;

        totalFlow = propCoFlow + opCoOperatingFlow;
        cumFcfe += totalFlow;

        if ((holdCoScenario === "breakeven" || localScenario === "breakeven") && targetExitMonth === -1 && cumFcfe > 0) {
          targetExitMonth = m;
        }

        if (targetExitMonth !== -1 && m === targetExitMonth) {
          const sellingCt = cAss.sellingCosts || 0;
          const lastYearEbitda = ebitda * 12; // Serves as the stabilized annual NOI/EBITDA for the cluster
          
          let exitPrice = 0;
          if (cAss.exitMethod === "cap_rate") {
            const capRate = cAss.exitCapRate || 8.5;
            exitPrice = lastYearEbitda / (capRate / 100);
          } else {
            const exitMul = cAss.exitMultiple || 10;
            exitPrice = lastYearEbitda * exitMul;
          }
          
          const exitNet = exitPrice * (1 - sellingCt / 100);
          opCoExitFlow = exitNet;
          hasExited = true;
          totalFlow += opCoExitFlow;
          cumFcfe += opCoExitFlow;
        }
      }

      monthlyCfs[m - 1] = totalFlow;
      propCoCfs[m - 1] = propCoFlow;
      opCoCfs[m - 1] = opCoOperatingFlow + opCoExitFlow;

      consolidatedCfsMonthly[m - 1] += totalFlow;
      consolidatedPropCoFlowMonthly[m - 1] += propCoFlow;
      consolidatedOpCoFlowMonthly[m - 1] += (opCoOperatingFlow + opCoExitFlow);

      const m_hard = m_build + m_ffe + m_infra + m_civilMep + m_sharing;
      const m_soft = m_consultant + m_license + m_contingency + m_vat;

      monthlyDataLocal.push({
        year: y,
        month: m,
        isOperating: isActuallyOperating,
        propCoFlow,
        opCoOperatingFlow,
        opCoExitFlow,
        revenue: opRev,
        roomRevenue,
        barRevenue,
        fbCogs,
        directLabor,
        adminLabor,
        marketing: marketingCost,
        maintOpex: maintCost + utilitiesCost,
        adminGeneral: adminGeneralCost,
        taxOpex,
        overheadOpex,
        fixedOverhead,
        ffeReserve,
        medEqLeaseOpex,
        cogs: fbCogs,
        grossProfit: opRev - fbCogs,
        dep: monthlyDep,
        depBuild: m_depBuild,
        depMedEq: m_depMedEq,
        depInfra: m_depInfra,
        depFfe: m_depFfe,
        depSharing: m_depSharing,
        depConsultant: m_depConsultant,
        depLicense: m_depLicense,
        depVat: m_depVat,
        depContingency: m_depContingency,
        netExitProceeds: opCoExitFlow,
        ebitda,
        cashOutflows: opCosts,
        interest: 0,
        principal: 0,
        ebt,
        corpTax,
        netIncome: ebt - corpTax,
        fcfe: totalFlow,
        cumFcfe,
        landSpend: m_land,
        buildSpend: m_build + m_civilMep,
        eqSpend: m_ffe,
        infraSpend: m_infra,
        hardSpend: m_hard,
        softSpend: m_soft,
        ffeSpend: m_ffe,
        sharingSpend: m_sharing,
        contingencySpend: m_contingency,
        licenseSpend: m_license,
        consultantSpend: m_consultant,
        vatSpend: m_vat,
        devGa: m_preOpening,
        devCar: 0,
        totalSpend: monthCapex
      });
    }

    const clusterIrr = calculateIRR(monthlyCfs, "monthly");
    const clusterNpv = calculateNPV(monthlyCfs, cAss.discountRate || 11, "monthly");
    cumulativeConsolidatedNpv += clusterNpv;

    const annualDataLocal = [];
    const maxLocalYear = Math.ceil((hasExited ? targetExitMonth : MAX_MONTHS) / 12);
    for (let yr = 1; yr <= (hasExited ? maxLocalYear : 30); yr++) {
      const yearMonths = monthlyDataLocal.filter(item => item.year === yr);
      const totalsLocal = {};
      const monthlyLocalArrays = {};
      if (yearMonths.length > 0) {
        Object.keys(yearMonths[0]).forEach(k => {
          if (typeof yearMonths[0][k] === 'number' && k !== 'month' && k !== 'year' && k !== 'cumFcfe') {
            totalsLocal[k] = yearMonths.reduce((sum, item) => sum + (item[k] || 0), 0);
            
            // Build the exact array of 12 numbers for this year
            const arr = [];
            for (let m = 1; m <= 12; m++) {
                const globalM = (yr - 1) * 12 + m;
                const match = yearMonths.find(x => x.month === globalM);
                arr.push(match ? (match[k] || 0) : 0);
            }
            monthlyLocalArrays[k] = arr;
          }
        });
      }
      annualDataLocal.push({
        year: `Year ${yr}`,
        isOperating: (yr * 12) > devDuration,
        monthly: monthlyLocalArrays,
        ...totalsLocal
      });
    }

    const cTotals = {};
    if (annualDataLocal.length > 0) {
      Object.keys(annualDataLocal[0]).forEach(k => {
        if (typeof annualDataLocal[0][k] === 'number' && k !== 'cumFcfe') {
          cTotals[k] = annualDataLocal.reduce((sum, item) => sum + (item[k] || 0), 0);
        }
      });
    }

    clustersData[cName] = {
      name: cName,
      assumptions: cAss,
      metrics: {
        totalCapex,
        totalEquity: totalCapex, // Assumes 100% equity at the cluster level for simpler visualization if financing isn't split
        totalDebt: 0,
        irr: clusterIrr,
        npv: clusterNpv,
        payback: 0,
        avgConsolidatedDscr: 0,
        moic: clusterIrr > 0 ? 1 : 0
      },
      monthlyData: monthlyDataLocal,
      annualData: annualDataLocal,
      operatingData: annualDataLocal.filter(d => d.isOperating),
      capexDetails: {
          landCost,
          buildCost: buildCostB,
          ffeCost,
          infraCost,
          civilMepCost,
          sharingDevCost,
          consultantCost,
          licenseCost,
          contingencyCost,
          vatCost,
          devGa: 0,
          devCar: 0,
          devPreOpening: preOpeningCost,
          totalSoftCosts: consultantCost + licenseCost + contingencyCost + vatCost,
          totalHardCosts: buildCostB + ffeCost + infraCost + civilMepCost + sharingDevCost,
          totalCapexExLand: totalCapex - landCost,
          totalCapex
      },
      totals: cTotals
    };
  });

  const masterIrr = calculateIRR(consolidatedCfsMonthly, "monthly");
  const masterNpv = calculateNPV(consolidatedCfsMonthly, globalClaims.discountRate || 11, "monthly");
  const masterPayback = calculatePayback(consolidatedCfsMonthly, "monthly");

  const maxYearAllowed = Math.max(...Object.values(clustersData).map(c => c.annualData.length), 10);
  const maxMonths = maxYearAllowed * 12;

  const cumulativeFcfeList = [];
  let currentCum = 0;
  for (let m = 0; m < maxMonths; m++) {
    currentCum += consolidatedCfsMonthly[m] || 0;
    cumulativeFcfeList.push(currentCum);
  }

  const globalCommercialOpeningMonth = Math.max(1, globalDevDuration) + 1;

  const completeMonthlyData = Array(maxMonths).fill(0).map((_, idx) => {
    const m = idx + 1;
    const y = Math.ceil(m / 12);
    
    const monthRowAgg = {};

    Object.keys(clustersData).forEach(cName => {
      const row = clustersData[cName].monthlyData[idx];
      if (row) {
        Object.keys(row).forEach(k => {
          if (typeof row[k] === 'number' && k !== 'month' && k !== 'year' && k !== 'cumFcfe') {
            monthRowAgg[k] = (monthRowAgg[k] || 0) + row[k];
          }
        });
      }
    });

    return {
      year: y,
      month: m,
      isOperating: m >= globalCommercialOpeningMonth,
      ...monthRowAgg,
      cumFcfe: cumulativeFcfeList[idx],
    };
  });

  const annualData = [];
  let cumOverallFcfe = 0;
  for (let yr = 1; yr <= maxYearAllowed; yr++) {
    const yearRowAgg = {};

    Object.keys(clustersData).forEach(cName => {
      const yearRow = clustersData[cName].annualData[yr - 1];
      if (yearRow) {
        Object.keys(yearRow).forEach(k => {
          if (typeof yearRow[k] === 'number' && k !== 'cumFcfe') {
            yearRowAgg[k] = (yearRowAgg[k] || 0) + yearRow[k];
          }
        });
      }
    });

    cumOverallFcfe += (yearRowAgg.fcfe || 0);

    const monthlyLocal = {};
    for (let m = 0; m < 12; m++) {
        const mIdx = (yr - 1) * 12 + m;
        const row = completeMonthlyData[mIdx];
        if (row) {
            Object.keys(row).forEach(k => {
                if (typeof row[k] === 'number' && k !== 'month' && k !== 'year') {
                    if (!monthlyLocal[k]) monthlyLocal[k] = [];
                    monthlyLocal[k].push(row[k]);
                }
            });
        }
    }

    annualData.push({
      year: `Year ${yr}`,
      isOperating: (yr * 12) > globalDevDuration,
      ...yearRowAgg,
      cumFcfe: cumOverallFcfe,
      monthly: monthlyLocal
    });
  }

  const totals = {};
  if (annualData.length > 0) {
    Object.keys(annualData[0]).forEach(k => {
      if (typeof annualData[0][k] === 'number' && k !== 'cumFcfe') {
        totals[k] = annualData.reduce((sum, item) => sum + (item[k] || 0), 0);
      }
    });
  }

  return {
    clustersData,
    annualData,
    monthlyData: completeMonthlyData,
    totals,
    capexDetails,
    metrics: {
      totalCapex: cumulativeConsolidatedCapex,
      totalEquity: cumulativeConsolidatedCapex,
      totalDebt: 0,
      irr: masterIrr,
      npv: masterNpv,
      payback: masterPayback,
      operatingPayback: masterPayback,
      moic: cumulativeConsolidatedCapex > 0 ? (totals.fcfe + cumulativeConsolidatedCapex) / cumulativeConsolidatedCapex : 0,
      avgConsolidatedDscr: 0,
    }
  };
};

export {
  calculatePMT,
  calculatePayback,
  calculateIRR,
  calculateNPV,
  runOpCoEngine,
  runPropCoEngine,
  runConsolidatedEngine,
  DEFAULT_OPCO_ASSUMPTIONS,
  DEFAULT_PROPCO_ASSUMPTIONS,
  CANCER_DATA,
  INSURANCE_DATA,
  callGemini,
  formatNumber,
  formatCurrency,
  INITIAL_ASSET_CLUSTERS_ASSUMPTIONS,
  runConsolidatedAssetEngine,
};
