const csv = require('csv-parser');
const fs = require('fs');
const path = require('path')

// Default super rate is kept as 9%
const DEFAULT_SUPER_MULTIPLIER = 0.09;

// Common assumption, all income will be neumeric and will not contain any non neumeric char
// Tax breakets are kept configurable for yearly changes
const taxBrackets = [
    {
        lowerLimit: 0,
        upperLimit: 18200,
        fixedTax: 0,
        taxMultiplier: 0,
    },
    {
        lowerLimit: 18201,
        upperLimit: 37000,
        fixedTax: 0,
        taxMultiplier: 0.19,
    },
    {
        lowerLimit: 37001,
        upperLimit: 80000,
        fixedTax: 3572,
        taxMultiplier: 0.325,
    },
    {
        lowerLimit: 80001,
        upperLimit: 180000,
        fixedTax: 17547,
        taxMultiplier: 0.37,
    },
    {
        lowerLimit: 180001,
        upperLimit: -1,
        fixedTax: 54547,
        taxMultiplier: 0.45,
    },
];

/**
 * This function takes input and oputput filepath and processes salary slip generation 
 * for all entries in the input file provided
 * @param {string} inputFilePath    absulute path of input csv file.
 * @param {string} outputFilePath   absulute path of output csv file.
 */
function runSalarySlipsGenerator(inputFilePath, outputFilePath) {
    const employees = []
    const payslips = []
    const outputFileDirectory = outputFilePath.substring(0, outputFilePath.lastIndexOf(path.sep))
    if (inputFilePath.endsWith(".csv") && outputFilePath.endsWith(".csv")
        && fs.existsSync(inputFilePath) && fs.existsSync(outputFileDirectory)) {
        fs.createReadStream(inputFilePath)
            .pipe(csv())
            .on('data', (data) => employees.push(data))
            .on('end', () => {
                employees.forEach((employee) => {
                    payslips.push(generatePayslip(employee))
                })
                let data = "name,pay period,gross income,income tax,net income,super" + "\n";
                payslips.forEach(payslip => {
                    data += payslip.join(',') + "\n";
                });
                fs.writeFileSync(outputFilePath, data)
                console.log(`Output csv file is saved successfully at ${outputFilePath}`)

            })
    } else {
        console.log('Please provide a valid file path')
    }
}

/**
 * This function calculates gross montly income for a specific annual salary passed
 * @param {number}   annualSalary   annual salary of an employee for whom payslip is to be generated
 * @param {boolean}  roundOff       true if you want output to be rounded or flase 
 * @returns {number} gross income calculated on monthly basis
 */
const calculateGrossMonthlyIncome = (annualSalary, roundOff = true) => {
    let grossMonthlyIncome = annualSalary / 12
    if (roundOff) {
        return (Math.round(grossMonthlyIncome))
    }
    return grossMonthlyIncome
}

/**
 * This function inplemets a way to search for tax bracket applicable to the annual salary amount passed
 * @param {number} annualSalary  annual salary of an employee
 * @returns an object containing selected tax bracket
 */
const findTaxBracket = (annualSalary) => {
    let selectedBracket = {}
    taxBrackets.forEach(bracket => {
        if (annualSalary >= bracket.lowerLimit && (annualSalary <= bracket.upperLimit || bracket.upperLimit == -1)) {
            selectedBracket = bracket
        }
    })
    return selectedBracket
}

/**
 * This function calculates income tax for specific annual salary passed
 * @param {number}  annualSalary    annual salary of an employee
 * @param {boolean} roundOff        true if you want output to be rounded or flase
 * @returns {number} income tax calculated on monthly basis
 */
const calculateIncomeTax = (annualSalary, roundOff = true) => {
    let applicableTaxBracket = findTaxBracket(annualSalary)
    let incomeTaxMonthly = (applicableTaxBracket.fixedTax + ((annualSalary - applicableTaxBracket.lowerLimit) * applicableTaxBracket.taxMultiplier)) / 12
    if (roundOff) {
        return Math.round(incomeTaxMonthly)
    }
    return incomeTaxMonthly
}

/**
 * This function calculates net mothly income based on annual salary and income 
 * tax applicable based on tax breaket
 * @param {number}  annualSalary  annual salary of an employee
 * @param {boolean} roundOff      true if you want output to be rounded or flase
 * @returns {number} net income calculated on monthly basis
 */
const calculateNetMonthlyIncome = (annualSalary, roundOff = true) => {
    let netMonthlyIncome = calculateGrossMonthlyIncome(annualSalary, roundOff) - calculateIncomeTax(annualSalary, roundOff)
    if (roundOff) {
        return Math.round(netMonthlyIncome)
    }
    return netMonthlyIncome
}

/* Assuming superRate will come here as it is provided in input file i.e. x% as a string
 * Also if invalid super rate is passed the default super rate will be considered
 * Based on the requirements, anything between 0-50% are considered as valid 
 * All other values will be considered invalid and default multiplier will be used
 */
/**
 * This function decides super multiplier based on super rate in percent
 * @param {string} superRate super rate as a string with % sign included; for example "7.5%".
 * @returns {number} a number used as a multiplier to calculate super.
 */
const calculateSuperMultiplier = superRate => {
    let superMultiplier = DEFAULT_SUPER_MULTIPLIER
    let superStringModified = superRate.slice(0, -1).trim()
    if (superStringModified.length > 0) {
        let superStringToToNumber = Number(superStringModified)
        if (superStringToToNumber !== NaN) {
            if (superStringToToNumber >= 0 && superStringToToNumber <= 50) {
                superMultiplier = superStringToToNumber / 100
            }
        }
    }
    return superMultiplier
}

/**
 * This function calculates monthly superannuation based on annual income and super rate provided
 * @param {number}  annualSalary annual salary of an employee for whom payslip is to be generated
 * @param {string}  superRate    super rate in percent string e.g. "10%"
 * @param {boolean} roundOff     true if you want output to be rounded or flase
 * @returns {number} super amount value on monthly basis 
 */
const calculateMonthlySuper = (annualSalary, superRate, roundOff = true) => {
    let superMultiplier = calculateSuperMultiplier(superRate)
    let monthlySuper = calculateGrossMonthlyIncome(annualSalary, roundOff) * superMultiplier
    if (roundOff) {
        return Math.round(monthlySuper)
    }
    return monthlySuper
}

/**
 * This method generates payslip entry array based on the employee object passed
 * @param {object} employee an employee object having necessary properties like  firstName, lastName,
 * paymentStartDate, annualSalary, and superRate. The object can be generated from a csv file using
 * other method.
 * @returns {object} an array containing employee payslip data such as employee name, payment start date
 * gross monthly income, monthly tax, net monthly income and monthly super. This can directly be 
 * written into an output csv file
 */
const generatePayslip = employee => {
    let grossMonthlyIncome = calculateGrossMonthlyIncome(employee.annualSalary, true)
    let monthlyTax = calculateIncomeTax(employee.annualSalary, true)
    let netMonthlyIncome = calculateNetMonthlyIncome(employee.annualSalary, true)
    let monthlySuper = calculateMonthlySuper(employee.annualSalary, employee.superRate, true)
    let payslip = [
        `${employee.firstName} ${employee.lastName}`,
        employee.paymentStartDate,
        grossMonthlyIncome,
        monthlyTax,
        netMonthlyIncome,
        monthlySuper
    ]
    return payslip;
}

/* This exports all the methods of the main script for other modules to consume
 * All module exports are kept at one place for eacy management
 */
module.exports = {
    runSalarySlipsGenerator: runSalarySlipsGenerator,
    calculateGrossMonthlyIncome: calculateGrossMonthlyIncome,
    findTaxBracket: findTaxBracket,
    calculateIncomeTax: calculateIncomeTax,
    calculateNetMonthlyIncome: calculateNetMonthlyIncome,
    calculateSuperMultiplier: calculateSuperMultiplier,
    calculateMonthlySuper: calculateMonthlySuper,
    generatePayslip: generatePayslip
}