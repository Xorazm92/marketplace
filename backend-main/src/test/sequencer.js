const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    // Define test execution order for optimal performance
    const testOrder = [
      'setup',
      'unit',
      'security',
      'database',
      'integration',
      'performance',
      'monitoring',
      'e2e',
      'complete-system'
    ];

    return tests.sort((testA, testB) => {
      const orderA = this.getTestOrder(testA.path);
      const orderB = this.getTestOrder(testB.path);
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      // Secondary sort by file name
      return testA.path.localeCompare(testB.path);
    });
  }

  getTestOrder(testPath) {
    if (testPath.includes('setup')) return 0;
    if (testPath.includes('unit') || testPath.includes('.spec.')) return 1;
    if (testPath.includes('auth-security')) return 2;
    if (testPath.includes('child-safety')) return 3;
    if (testPath.includes('database-performance')) return 4;
    if (testPath.includes('api-integration')) return 5;
    if (testPath.includes('ui-ux')) return 6;
    if (testPath.includes('monitoring-logging')) return 7;
    if (testPath.includes('complete-system-workflow')) return 8;
    return 9; // Default order
  }
}

module.exports = CustomSequencer;