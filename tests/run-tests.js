/**
 * End-to-End Test Runner
 * 
 * This script runs all end-to-end tests and generates a comprehensive report
 * of the results for both researcher and participant workflows.
 */

const path = require('path');
const fs = require('fs');

// Create a directory for test results if it doesn't exist
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir);
}

// Configure Jest programmatically
const jest = require('jest');

// Run the tests and capture results
async function runTests() {
  try {
    console.log('Starting end-to-end tests for Rapid Consumer Sentiment Analysis service...');
    console.log('Running researcher workflow tests...');
    
    // Run researcher workflow tests
    const researcherResults = await jest.runCLI(
      {
        testRegex: 'researcher-workflow\\.test\\.js$',
        json: true,
        silent: false,
        testTimeout: 30000,
        verbose: true
      },
      [path.join(__dirname)]
    );
    
    console.log('Running participant workflow tests...');
    
    // Run participant workflow tests
    const participantResults = await jest.runCLI(
      {
        testRegex: 'participant-workflow\\.test\\.js$',
        json: true,
        silent: false,
        testTimeout: 30000,
        verbose: true
      },
      [path.join(__dirname)]
    );
    
    // Generate a combined report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        researcher: {
          numPassedTests: researcherResults.results.numPassedTests,
          numFailedTests: researcherResults.results.numFailedTests,
          numTotalTests: researcherResults.results.numTotalTests,
          success: researcherResults.results.success
        },
        participant: {
          numPassedTests: participantResults.results.numPassedTests,
          numFailedTests: participantResults.results.numFailedTests,
          numTotalTests: participantResults.results.numTotalTests,
          success: participantResults.results.success
        },
        overall: {
          numPassedTests: researcherResults.results.numPassedTests + participantResults.results.numPassedTests,
          numFailedTests: researcherResults.results.numFailedTests + participantResults.results.numFailedTests,
          numTotalTests: researcherResults.results.numTotalTests + participantResults.results.numTotalTests,
          success: researcherResults.results.success && participantResults.results.success
        }
      },
      details: {
        researcher: researcherResults.results,
        participant: participantResults.results
      }
    };
    
    // Save the report to a file
    fs.writeFileSync(
      path.join(resultsDir, 'e2e-test-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    // Generate a human-readable summary
    const summaryReport = `
# End-to-End Test Results for Rapid Consumer Sentiment Analysis

## Test Summary
- **Date:** ${new Date().toLocaleString()}
- **Overall Success:** ${report.summary.overall.success ? '✅ PASSED' : '❌ FAILED'}
- **Total Tests:** ${report.summary.overall.numTotalTests}
- **Passed Tests:** ${report.summary.overall.numPassedTests}
- **Failed Tests:** ${report.summary.overall.numFailedTests}

## Researcher Workflow
- **Status:** ${report.summary.researcher.success ? '✅ PASSED' : '❌ FAILED'}
- **Tests:** ${report.summary.researcher.numPassedTests}/${report.summary.researcher.numTotalTests} passed

## Participant Workflow
- **Status:** ${report.summary.participant.success ? '✅ PASSED' : '❌ FAILED'}
- **Tests:** ${report.summary.participant.numPassedTests}/${report.summary.participant.numTotalTests} passed

## Test Coverage
- Project creation and management
- Interview setup with discussion guide
- Participant interview session
- Voice response submission and processing
- Emotion and language analysis
- Mixed analysis correlation
- Results visualization

## Next Steps
- Address any failed tests
- Expand test coverage for edge cases
- Implement performance testing
- Set up continuous integration for automated testing
`;
    
    fs.writeFileSync(
      path.join(resultsDir, 'e2e-test-summary.md'),
      summaryReport
    );
    
    console.log('End-to-end tests completed. Results saved to:', path.join(resultsDir, 'e2e-test-summary.md'));
    return report;
  } catch (error) {
    console.error('Error running tests:', error);
    return {
      error: error.message,
      success: false
    };
  }
}

// Execute the tests
runTests();
