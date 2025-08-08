// test-utils.ts
// Simple test utilities for unit tests across the backend.
// Currently provides mock data for ChildSafetyService tests.

export const ChildSafetyTestScenarios = {
  inappropriateContentTests: [
    {
      name: 'detects explicit violence',
      content: 'This is a violent scene with blood and weapons.',
      expected: false,
    },
    {
      name: 'detects adult content',
      content: 'Explicit adult language and sexual content.',
      expected: false,
    },
    {
      name: 'allows safe educational content',
      content: 'A fun educational story about numbers.',
      expected: true,
    },
  ],
};
