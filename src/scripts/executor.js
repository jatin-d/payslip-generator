const prompts = require('prompts');
const utility = require('./main.js')

const questions = [
    {
        type: 'text',
        name: 'sourceFilePath',
        message: 'Provide input file path including file name',
        validate: input => input.length <= 0 ? 'Please enter a valid path' : true
    },
    {
        type: 'text',
        name: 'destinationFilePath',
        message: 'Provide output file path including file name',
        validate: input => input.length <= 0 ? 'Please enter a valid path' : true
    }
];

(async () => {
    const response = await prompts(questions);
    utility.runSalarySlipsGenerator(response.sourceFilePath, response.destinationFilePath)
})();