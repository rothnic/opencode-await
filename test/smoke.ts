import { spawnProcess, pollCommand } from '../src/process-manager';
import { formatOutput, createTemplateContext, DEFAULT_TEMPLATE } from '../src/output-formatter';
import { createLogCapture } from '../src/log-capture';
import { summarizeOutput, truncateForContext } from '../src/summarizer';
import type { AwaitResult } from '../src/types';

async function testProcessManager() {
  console.log('Testing process-manager...');
  
  const result = await spawnProcess({ cmd: ['echo', 'hello world'] });
  
  if (result.exitCode !== 0) {
    throw new Error(`Expected exit code 0, got ${result.exitCode}`);
  }
  if (!result.stdout.includes('hello world')) {
    throw new Error(`Expected stdout to contain 'hello world', got: ${result.stdout}`);
  }
  
  console.log('  ✓ Basic command execution works');
  
  const timeoutResult = await spawnProcess({ 
    cmd: ['sleep', '10'], 
    timeout: 100 
  });
  
  if (!timeoutResult.timedOut) {
    throw new Error('Expected timeout');
  }
  
  console.log('  ✓ Timeout handling works');
}

async function testOutputFormatter() {
  console.log('Testing output-formatter...');
  
  const mockResult: AwaitResult = {
    status: 'success',
    exitCode: 0,
    elapsedMs: 5200,
    output: 'test output <script>alert(1)</script>',
    outputTruncated: false,
    matchedPattern: null,
  };
  
  const ctx = createTemplateContext(mockResult);
  
  if (ctx.elapsed !== '5.20') {
    throw new Error(`Expected elapsed '5.20', got '${ctx.elapsed}'`);
  }
  if (ctx.status !== 'success') {
    throw new Error(`Expected status 'success', got '${ctx.status}'`);
  }
  
  console.log('  ✓ Template context creation works');
  
  const formatted = formatOutput('Status: {{status}}, Time: {{elapsed}}s', ctx);
  
  if (formatted !== 'Status: success, Time: 5.20s') {
    throw new Error(`Unexpected formatted output: ${formatted}`);
  }
  
  console.log('  ✓ Template formatting works');
  
  const htmlEscaped = formatOutput('{{output}}', ctx);
  if (htmlEscaped.includes('<script>')) {
    throw new Error('HTML should be escaped');
  }
  
}

async function testPollCommand() {
  console.log('Testing pollCommand...');
  
  // Test basic poll with immediate success
  const result = await pollCommand({
    command: 'echo "DONE"',
    interval: 1,
    maxDuration: 5,
    successPattern: /DONE/,
  });
  
  if (result.reason !== 'success') {
    throw new Error(`Expected reason 'success', got '${result.reason}'`);
  }
  if (!result.output.includes('DONE')) {
    throw new Error(`Expected output to contain 'DONE'`);
  }
  
  console.log('  ✓ pollCommand with success pattern works');
  
  // Test command completion without pattern match (new behavior: exits on complete, not timeout)
  const completedResult = await pollCommand({
    command: 'echo "waiting"',
    interval: 1,
    maxDuration: 2,
    successPattern: /NEVER_MATCH/,
  });
  
  if (completedResult.reason !== 'completed') {
    throw new Error(`Expected reason 'completed', got '${completedResult.reason}'`);
  }
  
  console.log('  ✓ pollCommand exits on command completion');
}

async function testLogCapture() {
  console.log('Testing log-capture...');
  
  const capture = await createLogCapture('test-');
  
  if (!capture.tempDir.includes('test-')) {
    throw new Error(`Expected tempDir to contain 'test-', got: ${capture.tempDir}`);
  }
  
  await capture.write('line 1\n');
  await capture.write('line 2\n');
  
  const finalPath = await capture.finalize();
  
  const content = await Bun.file(finalPath).text();
  if (!content.includes('line 1') || !content.includes('line 2')) {
    throw new Error(`Expected content to contain both lines, got: ${content}`);
  }
  
  console.log('  ✓ createLogCapture write/finalize works');
  
  // Cleanup
  await capture.cleanup();
  
  const exists = await Bun.file(finalPath).exists();
  if (exists) {
    throw new Error('Expected log file to be cleaned up');
  }
}

async function testSummarizer() {
  console.log('Testing summarizer...');
  
  // Test truncateForContext
  const short = 'short text';
  const truncatedShort = truncateForContext(short, 100);
  if (truncatedShort !== short) {
    throw new Error('Short text should not be truncated');
  }
  
  const long = 'a'.repeat(200);
  const truncatedLong = truncateForContext(long, 100);
  if (!truncatedLong.includes('[...truncated...]')) {
    throw new Error('Long text should be truncated');
  }
  if (truncatedLong.length > 130) { // some buffer for marker
    throw new Error(`Truncated text should be shorter, got ${truncatedLong.length}`);
  }
  
  console.log('  ✓ truncateForContext works');
  
  // Test summarizeOutput returns result object
  const summary = await summarizeOutput('test output');
  if (!summary.success || !summary.summary?.includes('Summarization pending')) {
    throw new Error('Expected success with pending summary');
  }
  
  console.log('  ✓ summarizeOutput returns placeholder');
}

async function testBuild() {
  console.log('Testing build...');
  
  // Use process.cwd() for CI compatibility
  const projectRoot = process.cwd();
  
  const buildResult = await spawnProcess({ 
    cmd: ['bun', 'build', 'src/index.ts', '--outdir', 'dist', '--target', 'bun', '--format', 'esm', '--splitting'],
    cwd: projectRoot
  });
  
  if (buildResult.exitCode !== 0) {
    throw new Error(`Build failed: ${buildResult.stderr}`);
  }
  
  const distExists = await Bun.file(`${projectRoot}/dist/index.js`).exists();
  if (!distExists) {
    throw new Error('dist/index.js not created');
  }
  
  console.log('  ✓ Build successful');
}

async function main() {
  console.log('\n=== opencode-await smoke tests ===\n');
  
  try {
    await testProcessManager();
    await testOutputFormatter();
    await testPollCommand();
    await testLogCapture();
    await testSummarizer();
    await testBuild();
    
    console.log('\n✓ All tests passed!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Test failed:', error);
    process.exit(1);
  }
}

main();
