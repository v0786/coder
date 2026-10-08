import { exec } from 'child_process';
// Mock console.log for testing
const originalConsoleLog = console.log;
beforeAll(() => {
    console.log = jest.fn();
});
afterAll(() => {
    console.log = originalConsoleLog;
});
describe('CLI Integration Tests', () => {
    it('should display available commands when no command is specified', (done) => {
        exec('npm run dev', (error, stdout, stderr) => {
            if (error) {
                done(error);
                return;
            }
            expect(stdout).toContain('No command specified. Available commands:');
            expect(stdout).toContain('doctor: Check CODER system health and configuration');
            done();
        });
    });
    it('should run the doctor command successfully', (done) => {
        exec('npm run doctor', (error, stdout, stderr) => {
            if (error) {
                done(error);
                return;
            }
            expect(stdout).toContain('Running CODER doctor...');
            expect(stdout).toContain('Checking configuration...');
            expect(stdout).toContain('Testing logging system...');
            expect(stdout).toContain('CODER doctor check completed successfully!');
            done();
        });
    });
});
//# sourceMappingURL=cli.test.js.map