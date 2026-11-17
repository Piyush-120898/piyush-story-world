// Compatibility entry point for older local launch commands.
process.argv.push(process.argv[2] === 'dist' ? '--preview' : '--dev');
await import('../server.mjs');
