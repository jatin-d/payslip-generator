Assumptions:
- All annual income will be neumeric and will not contain any non neumeric characters
- SuperRate will be provided as it is provided in input file i.e. x% as a string
- If invalid super rate is passed the default super rate will be considered
- Anything between 0-50% are considered as valid super rates
- For invalid super rates, default super rate will be used
- Default super rate is 9%
- Payment start date is actualy a pay period and it is only informative. It does not have any role in payslip calculations
- Input to the program is a csv file and output is expected to be a csv file as well
- The input csv will always follow the same header naming as data/sampledata.csv


Pre-requisites:
- NodeJS is installed on the machine


Instructions to run the program:
- Open command prompt and navigate to the payslip_generator directory
- run npm install to install necessary dependencies for the program
- The program will require you to enter path to an input csv and path for the csv to be generated (output csv)
- For the testing purpose, a sample csv is provided in payslip_generator/data named sampledata.csv 
- run npm start to execute the program
- when prompted, enter input csv file path (example: data/sampledata.csv OR /path/to/payslip_generator/data/sampledata.csv)
- when prompted, enter output csv file path (example: data/results.csv OR /path/to/payslip_generator/data/results.csv)
- The program will generate payslip data in results.csv
- open results.csv to varify the data
- run npm test to execute unit tests for the program