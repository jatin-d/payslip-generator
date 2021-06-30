const assert = require('assert');
const mainScript = require('../../src/scripts/main.js')

describe('calculateGrossMonthlyIncome', function () {
    it('should return 10417 for annual income 125000 and roundOff is true', function () {
        assert.ok(mainScript.calculateGrossMonthlyIncome(125000, true) === 10417)
    })
    it('should return 11583.333333333334 with decimal precision for annual income 139000 and roundOff is false', function () {
        assert.ok(mainScript.calculateGrossMonthlyIncome(139000, false) === 11583.333333333334)
    })
})

describe('findTaxBracket', function () {
    it('should return upper limit 18200 and lower limit 0 for annual income 9000', function () {
        let applicableBracket = mainScript.findTaxBracket(9000)
        assert.ok(applicableBracket.lowerLimit === 0 && applicableBracket.upperLimit === 18200)
    })
    it('should return upper limit 37000 and lower limit 18201 for annual income 20000', function () {
        let applicableBracket = mainScript.findTaxBracket(20000)
        assert.ok(applicableBracket.lowerLimit === 18201 && applicableBracket.upperLimit === 37000)
    })
    it('should return upper limit 80000 and lower limit 37001 for annual income 50000', function () {
        let applicableBracket = mainScript.findTaxBracket(50000)
        assert.ok(applicableBracket.lowerLimit === 37001 && applicableBracket.upperLimit === 80000)
    })
    it('should return upper limit 180000 and lower limit 80001 for annual income 175000', function () {
        let applicableBracket = mainScript.findTaxBracket(175000)
        assert.ok(applicableBracket.lowerLimit === 80001 && applicableBracket.upperLimit === 180000)
    })
    it('should return upper limit -1 and lower limit 180001 for annual income 275000', function () {
        let applicableBracket = mainScript.findTaxBracket(275000)
        assert.ok(applicableBracket.lowerLimit === 180001 && applicableBracket.upperLimit === -1)
    })
})


describe('calculateIncomeTax', function () {
    it('should return 922 for annual salary 60050 and roundOff is true', function () {
        assert.ok(mainScript.calculateIncomeTax(60050, true) === 922)
    })
    it('should return 1387.7437500000003 with decimal precision for annual salary 77250 and roundOff is false ', function () {
        assert.ok(mainScript.calculateIncomeTax(77250, false) === 1387.7437500000003)
    })
})

describe('calculateNetMonthlyIncome', function () {
    it('should return 4082 for annual salary 60050 and roundOff is true', function () {
        assert.ok(mainScript.calculateNetMonthlyIncome(60050, true) === 4082)
    })
    it('should return 4956.38125 with decimal precision for annual salary 75590 and roundOff is false ', function () {
        assert.ok(mainScript.calculateNetMonthlyIncome(75590, false) === 4956.38125)
    })
})

describe('calculateSuperMultiplier', function () {
    it('should return 0.12 for super rate 12%', function () {
        assert.ok(mainScript.calculateSuperMultiplier('12%') === 0.12)
    })
    it('should return 0.09 (default rate) for super rate "%" (missing value)', function () {
        assert.ok(mainScript.calculateSuperMultiplier('%') === 0.09)
    })
    it('should return 0.09 (default rate) for super rate " %" (empty string)', function () {
        assert.ok(mainScript.calculateSuperMultiplier(' %') === 0.09)
    })
    it('should return 0.09 (default rate) for super rate "-7%" (negative value)', function () {
        assert.ok(mainScript.calculateSuperMultiplier('-7%') === 0.09)
    })
    it('should return 0.09 (default rate) for super rate "70%" (greater than 50% value)', function () {
        assert.ok(mainScript.calculateSuperMultiplier('70%') === 0.09)
    })
    it('should return 0.09 (default rate) for super rate "JD%" (NaN)', function () {
        assert.ok(mainScript.calculateSuperMultiplier('JD%') === 0.09)
    })
})

describe('calculateMonthlySuper', function () {
    it('should return 450 for annual salary 60050, super rate 9% and roundOff is true', function () {
        assert.ok(mainScript.calculateMonthlySuper(60050, '9%', true) === 450)
    })
    it('should return 1029.1666666666667 with decimal precision for annual salary 130000, super rate 9.5% and roundOff is false ', function () {
        assert.ok(mainScript.calculateMonthlySuper(130000, '9.5%', false) === 1029.1666666666667)
    })
})

describe('generatePayslip', function () {
    it('should generate payslip data as expected', function () {
        let employee = {
            firstName: "David",
            lastName: "Rudd",
            annualSalary: 60050,
            superRate: "9%",
            paymentStartDate: "01 March - 31 March"
        }
        let salarySlipEntry = mainScript.generatePayslip(employee);
        let isValid = salarySlipEntry.length == 6
            && salarySlipEntry[0] == `${employee.firstName} ${employee.lastName}`
            && salarySlipEntry[1] == employee.paymentStartDate
            && salarySlipEntry[2] == 5004
            && salarySlipEntry[3] == 922
            && salarySlipEntry[4] == 4082
            && salarySlipEntry[5] == 450
        assert.ok(isValid)
    })
})